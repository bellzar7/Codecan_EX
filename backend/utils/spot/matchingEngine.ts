/**
 * SPOT Internal Matching Engine
 *
 * Core matching engine for SPOT trading using price-time priority algorithm.
 * All trades happen internally - NO external API calls.
 *
 * Features:
 * - Price-time priority (best price first, then earliest order)
 * - Support for LIMIT and MARKET orders
 * - Partial fills handling
 * - Wallet balance updates on trade execution
 * - Transaction recording for audit trail
 * - Liquidity pool integration for market making
 */

import { models, sequelize } from "@b/db";
import { logError } from "@b/utils/logger";
import type { LiquidityPoolManager } from "./liquidityPoolManager";
import type { SpotOrderValidator } from "./orderValidator";
import type { SpotWalletManager } from "./walletManager";

// ============================================================================
// Types and Interfaces
// ============================================================================

export type OrderStatus =
  | "OPEN"
  | "CLOSED"
  | "CANCELED"
  | "EXPIRED"
  | "REJECTED";

/**
 * No liquidity error for MARKET orders
 */
export class NoLiquidityError extends Error {
  constructor(symbol: string, side: string) {
    super(
      `No liquidity available for ${side} order on ${symbol}. Please place a LIMIT order or wait for matching orders.`
    );
    this.name = "NoLiquidityError";
  }
}
export type OrderType = "MARKET" | "LIMIT";
export type OrderSide = "BUY" | "SELL";
export type TimeInForce = "GTC" | "IOC" | "FOK" | "PO";

/**
 * Internal order representation for the matching engine
 */
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  cost: number;
  fee: number;
  feeCurrency: string;
  status: OrderStatus;
  timeInForce: TimeInForce;
  trades: Trade[];
  createdAt: Date;
  updatedAt: Date;
  lockedAmount?: number; // Track the actual amount locked for proper release
}

/**
 * Trade execution record
 */
export interface Trade {
  id: string;
  orderId: string;
  matchedOrderId: string;
  symbol: string;
  side: OrderSide;
  price: number;
  amount: number;
  cost: number;
  fee: number;
  feeCurrency: string;
  timestamp: Date;
  buyerUserId: string;
  sellerUserId: string;
}

/**
 * Order book structure for a single symbol
 */
export interface OrderBook {
  bids: Map<number, Order[]>; // Buy orders sorted by price DESC
  asks: Map<number, Order[]>; // Sell orders sorted by price ASC
}

/**
 * Result of order matching
 */
export interface MatchResult {
  trades: Trade[];
  remainingOrder: Order | null;
  filledOrders: Order[];
}

/**
 * Order input for creating new orders
 */
export interface OrderInput {
  userId: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  timeInForce?: TimeInForce;
}

// ============================================================================
// SpotMatchingEngine Class
// ============================================================================

export class SpotMatchingEngine {
  private static instance: SpotMatchingEngine | null = null;
  private readonly orderBooks: Map<string, OrderBook>;
  private readonly lockedOrders: Set<string>;
  private walletManager: SpotWalletManager | null = null;
  private orderValidator: SpotOrderValidator | null = null;
  private liquidityPoolManager: LiquidityPoolManager | null = null;
  private feeRate = 0.001; // 0.1% default fee

  private constructor() {
    this.orderBooks = new Map();
    this.lockedOrders = new Set();
  }

  /**
   * Get singleton instance of the matching engine
   */
  static getInstance(): SpotMatchingEngine {
    if (!SpotMatchingEngine.instance) {
      SpotMatchingEngine.instance = new SpotMatchingEngine();
    }
    return SpotMatchingEngine.instance;
  }

  /**
   * Initialize the matching engine with dependencies
   */
  async initialize(
    walletManager: SpotWalletManager,
    orderValidator: SpotOrderValidator,
    liquidityPoolManager?: LiquidityPoolManager
  ): Promise<void> {
    this.walletManager = walletManager;
    this.orderValidator = orderValidator;
    this.liquidityPoolManager = liquidityPoolManager ?? null;
    await this.loadOpenOrders();
    await this.loadFeeRate();
  }

  /**
   * Set the liquidity pool manager (can be set after initialization)
   */
  setLiquidityPoolManager(manager: LiquidityPoolManager): void {
    this.liquidityPoolManager = manager;
  }

  /**
   * Load fee rate from settings
   */
  private async loadFeeRate(): Promise<void> {
    try {
      const settings = await models.settings.findOne({
        where: { key: "spot_trading_fee" },
      });
      if (settings?.value) {
        this.feeRate = Number.parseFloat(settings.value) / 100;
      }
    } catch (error) {
      logError("spot_matching_engine", error, __filename);
      // Use default fee rate
    }
  }

  /**
   * Load all open orders from database into memory
   */
  private async loadOpenOrders(): Promise<void> {
    try {
      const openOrders = await models.exchangeOrder.findAll({
        where: { status: "OPEN" },
        order: [["createdAt", "ASC"]],
      });

      for (const dbOrder of openOrders) {
        const order = this.dbOrderToOrder(dbOrder);
        this.addToOrderBook(order);
      }

      console.log(
        `Loaded ${openOrders.length} open orders into matching engine`
      );
    } catch (error) {
      logError("spot_matching_engine", error, __filename);
      throw new Error("Failed to load open orders");
    }
  }

  /**
   * Convert database order to internal order format
   */
  // biome-ignore lint/suspicious/noExplicitAny: Database model type from Sequelize
  private dbOrderToOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId,
      symbol: dbOrder.symbol,
      type: dbOrder.type,
      side: dbOrder.side,
      price: dbOrder.price,
      amount: dbOrder.amount,
      filled: dbOrder.filled,
      remaining: dbOrder.remaining,
      cost: dbOrder.cost,
      fee: dbOrder.fee,
      feeCurrency: dbOrder.feeCurrency,
      status: dbOrder.status,
      timeInForce: dbOrder.timeInForce,
      trades: dbOrder.trades ? JSON.parse(dbOrder.trades) : [],
      createdAt: new Date(dbOrder.createdAt),
      updatedAt: new Date(dbOrder.updatedAt),
    };
  }

  /**
   * Add order to the appropriate order book
   */
  private addToOrderBook(order: Order): void {
    if (!this.orderBooks.has(order.symbol)) {
      this.orderBooks.set(order.symbol, {
        bids: new Map(),
        asks: new Map(),
      });
    }

    // biome-ignore lint/style/noNonNullAssertion: Order book is guaranteed to exist after the check above
    const orderBook = this.orderBooks.get(order.symbol)!;
    const side = order.side === "BUY" ? orderBook.bids : orderBook.asks;

    if (!side.has(order.price)) {
      side.set(order.price, []);
    }

    side.get(order.price)?.push(order);
  }

  /**
   * Remove order from order book
   */
  private removeFromOrderBook(order: Order): void {
    const orderBook = this.orderBooks.get(order.symbol);
    if (!orderBook) {
      return;
    }

    const side = order.side === "BUY" ? orderBook.bids : orderBook.asks;
    const ordersAtPrice = side.get(order.price);

    if (ordersAtPrice) {
      const index = ordersAtPrice.findIndex((o) => o.id === order.id);
      if (index !== -1) {
        ordersAtPrice.splice(index, 1);
        if (ordersAtPrice.length === 0) {
          side.delete(order.price);
        }
      }
    }
  }

  /**
   * Process a new order - validate, match, and execute
   */
  async processOrder(input: OrderInput): Promise<MatchResult> {
    // Validate order
    if (this.orderValidator) {
      const validation = await this.orderValidator.validateOrder(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }
    }

    // For MARKET orders, check liquidity BEFORE locking funds or creating order
    if (input.type === "MARKET") {
      const hasLiquidity = this.checkLiquidity(input.symbol, input.side);
      if (!hasLiquidity) {
        throw new NoLiquidityError(input.symbol, input.side);
      }
    }

    // Calculate fee
    const fee = this.calculateFee(input.amount, input.price, input.side);
    const [baseCurrency, quoteCurrency] = input.symbol.split("/");
    const feeCurrency = input.side === "BUY" ? baseCurrency : quoteCurrency;

    // Calculate the actual amount to lock (track for proper release)
    const lockedAmount = this.calculateLockAmount(input, fee);

    // Lock funds
    if (this.walletManager) {
      const lockSuccess = await this.lockFundsForOrder(input, fee);
      if (!lockSuccess) {
        throw new Error("Insufficient funds to place order");
      }
    }

    // Create order in database
    const dbOrder = await this.createOrderInDatabase(input, fee, feeCurrency);

    // Create internal order
    const order: Order = {
      id: dbOrder.id,
      userId: input.userId,
      symbol: input.symbol,
      type: input.type,
      side: input.side,
      price: input.price,
      amount: input.amount,
      filled: 0,
      remaining: input.amount,
      cost: 0,
      fee,
      feeCurrency,
      status: "OPEN",
      timeInForce: input.timeInForce || "GTC",
      trades: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lockedAmount, // Track the actual locked amount
    };

    // Attempt matching
    const result = await this.matchOrder(order);

    // Handle remaining order based on type and time in force
    await this.handleRemainingOrder(result, order);

    return result;
  }

  /**
   * Check if there's liquidity available for a MARKET order
   * Checks both order book and liquidity pool
   */
  private checkLiquidity(symbol: string, side: OrderSide): boolean {
    const orderBook = this.orderBooks.get(symbol);

    // Check order book first
    if (orderBook) {
      if (side === "BUY" && orderBook.asks.size > 0) {
        return true;
      }
      if (side === "SELL" && orderBook.bids.size > 0) {
        return true;
      }
    }

    // Check liquidity pool as fallback
    if (this.liquidityPoolManager) {
      const pool = this.liquidityPoolManager.getPoolBySymbol(symbol);
      if (pool?.isActive) {
        // Pool can provide liquidity
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate the actual amount to lock for an order
   */
  private calculateLockAmount(input: OrderInput, fee: number): number {
    if (input.side === "BUY") {
      // For buy orders, lock quote currency (price * amount + buffer for market orders)
      const baseCost = input.amount * input.price;
      const MARKET_ORDER_BUFFER_PERCENT = 0.05; // 5% buffer for market orders
      const buffer =
        input.type === "MARKET" ? baseCost * MARKET_ORDER_BUFFER_PERCENT : 0;
      return baseCost + buffer + fee;
    }
    // For sell orders, lock base currency (amount)
    return input.amount;
  }

  /**
   * Lock funds for a new order
   */
  private async lockFundsForOrder(
    input: OrderInput,
    fee: number
  ): Promise<boolean> {
    if (!this.walletManager) {
      return true;
    }

    const [baseCurrency, quoteCurrency] = input.symbol.split("/");

    if (input.side === "BUY") {
      // For buy orders, lock quote currency (price * amount + fee)
      const totalCost =
        input.type === "MARKET"
          ? input.amount * input.price * 1.05 // 5% buffer for market orders
          : input.amount * input.price;
      return await this.walletManager.lockFunds(
        input.userId,
        quoteCurrency,
        totalCost + fee
      );
    }
    // For sell orders, lock base currency (amount)
    return await this.walletManager.lockFunds(
      input.userId,
      baseCurrency,
      input.amount
    );
  }

  /**
   * Calculate trading fee
   */
  private calculateFee(
    amount: number,
    price: number,
    _side: OrderSide
  ): number {
    const cost = amount * price;
    return cost * this.feeRate;
  }

  /**
   * Create order in database
   */
  private async createOrderInDatabase(
    input: OrderInput,
    fee: number,
    feeCurrency: string
    // biome-ignore lint/suspicious/noExplicitAny: Database model type from Sequelize
  ): Promise<any> {
    return await models.exchangeOrder.create({
      userId: input.userId,
      symbol: input.symbol,
      type: input.type,
      side: input.side,
      price: input.price,
      amount: input.amount,
      filled: 0,
      remaining: input.amount,
      cost: 0,
      fee,
      feeCurrency,
      status: "OPEN",
      timeInForce: input.timeInForce || "GTC",
      trades: JSON.stringify([]),
    });
  }

  /**
   * Match an order against the order book
   */
  private async matchOrder(order: Order): Promise<MatchResult> {
    if (order.side === "BUY") {
      return await this.matchBuyOrder(order);
    }
    return await this.matchSellOrder(order);
  }

  /**
   * Match a buy order against asks (sell orders)
   * User orders have priority over liquidity pool
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex matching algorithm with multiple conditions for price-time priority, order types, and liquidity pool fallback - intentionally complex for correctness
  private async matchBuyOrder(order: Order): Promise<MatchResult> {
    const orderBook = this.orderBooks.get(order.symbol);
    const trades: Trade[] = [];
    const filledOrders: Order[] = [];

    // First, try to match against user orders in the order book
    if (orderBook && orderBook.asks.size > 0) {
      // Get sorted ask prices (ascending - lowest first)
      const askPrices = Array.from(orderBook.asks.keys()).sort((a, b) => a - b);

      for (const askPrice of askPrices) {
        // For limit orders, only match if ask price <= order price
        if (order.type === "LIMIT" && askPrice > order.price) {
          break;
        }

        // biome-ignore lint/style/noNonNullAssertion: Orders at price level guaranteed to exist since we're iterating over keys from the Map
        const ordersAtPrice = orderBook.asks.get(askPrice)!;

        // Process orders at this price level (time priority)
        for (const sellOrder of [...ordersAtPrice]) {
          if (order.remaining <= 0) {
            break;
          }

          // Skip if order is locked
          if (this.lockedOrders.has(sellOrder.id)) {
            continue;
          }

          // Lock both orders
          this.lockedOrders.add(order.id);
          this.lockedOrders.add(sellOrder.id);

          try {
            const trade = await this.executeTrade(
              order,
              sellOrder,
              askPrice,
              Math.min(order.remaining, sellOrder.remaining)
            );

            trades.push(trade);

            // Update orders
            if (sellOrder.remaining <= 0) {
              sellOrder.status = "CLOSED";
              this.removeFromOrderBook(sellOrder);
              filledOrders.push(sellOrder);
            }
          } finally {
            this.lockedOrders.delete(order.id);
            this.lockedOrders.delete(sellOrder.id);
          }
        }

        if (order.remaining <= 0) {
          break;
        }
      }
    }

    // If order still has remaining amount, try to fill from liquidity pool
    if (order.remaining > 0 && this.liquidityPoolManager) {
      const poolTrades = await this.fillFromLiquidityPool(order, trades);
      trades.push(...poolTrades);
    }

    if (order.remaining <= 0) {
      order.status = "CLOSED";
    }

    return {
      trades,
      remainingOrder: order.remaining > 0 ? order : null,
      filledOrders,
    };
  }

  /**
   * Match a sell order against bids (buy orders)
   * User orders have priority over liquidity pool
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex matching algorithm with multiple conditions for price-time priority, order types, and liquidity pool fallback - intentionally complex for correctness
  private async matchSellOrder(order: Order): Promise<MatchResult> {
    const orderBook = this.orderBooks.get(order.symbol);
    const trades: Trade[] = [];
    const filledOrders: Order[] = [];

    // First, try to match against user orders in the order book
    if (orderBook && orderBook.bids.size > 0) {
      // Get sorted bid prices (descending - highest first)
      const bidPrices = Array.from(orderBook.bids.keys()).sort((a, b) => b - a);

      for (const bidPrice of bidPrices) {
        // For limit orders, only match if bid price >= order price
        if (order.type === "LIMIT" && bidPrice < order.price) {
          break;
        }

        // biome-ignore lint/style/noNonNullAssertion: Orders at price level guaranteed to exist since we're iterating over keys from the Map
        const ordersAtPrice = orderBook.bids.get(bidPrice)!;

        // Process orders at this price level (time priority)
        for (const buyOrder of [...ordersAtPrice]) {
          if (order.remaining <= 0) {
            break;
          }

          // Skip if order is locked
          if (this.lockedOrders.has(buyOrder.id)) {
            continue;
          }

          // Lock both orders
          this.lockedOrders.add(order.id);
          this.lockedOrders.add(buyOrder.id);

          try {
            const trade = await this.executeTrade(
              buyOrder,
              order,
              bidPrice,
              Math.min(order.remaining, buyOrder.remaining)
            );

            trades.push(trade);

            // Update orders
            if (buyOrder.remaining <= 0) {
              buyOrder.status = "CLOSED";
              this.removeFromOrderBook(buyOrder);
              filledOrders.push(buyOrder);
            }
          } finally {
            this.lockedOrders.delete(order.id);
            this.lockedOrders.delete(buyOrder.id);
          }
        }

        if (order.remaining <= 0) {
          break;
        }
      }
    }

    // If order still has remaining amount, try to fill from liquidity pool
    if (order.remaining > 0 && this.liquidityPoolManager) {
      const poolTrades = await this.fillFromLiquidityPool(order, trades);
      trades.push(...poolTrades);
    }

    if (order.remaining <= 0) {
      order.status = "CLOSED";
    }

    return {
      trades,
      remainingOrder: order.remaining > 0 ? order : null,
      filledOrders,
    };
  }

  /**
   * Fill remaining order amount from liquidity pool
   */
  private async fillFromLiquidityPool(
    order: Order,
    _existingTrades: Trade[]
  ): Promise<Trade[]> {
    if (!this.liquidityPoolManager) {
      return [];
    }

    const trades: Trade[] = [];
    const pool = this.liquidityPoolManager.getPoolBySymbol(order.symbol);

    if (!pool?.isActive) {
      return [];
    }

    // Get the best prices from order book for price calculation
    const bestBid = this.getBestBid(order.symbol);
    const bestAsk = this.getBestAsk(order.symbol);

    // Get pool trade price with spread
    const poolPrice = await this.liquidityPoolManager.getPoolTradePrice(
      order.symbol,
      order.side,
      bestBid ?? undefined,
      bestAsk ?? undefined
    );

    if (!poolPrice) {
      return [];
    }

    // For LIMIT orders, check if pool price is acceptable
    if (order.type === "LIMIT") {
      if (order.side === "BUY" && poolPrice > order.price) {
        // Pool ask price is higher than user's limit price
        return [];
      }
      if (order.side === "SELL" && poolPrice < order.price) {
        // Pool bid price is lower than user's limit price
        return [];
      }
    }

    // Check how much the pool can fill
    const maxFillable = this.liquidityPoolManager.getMaxFillableAmount(
      order.symbol,
      order.side,
      poolPrice
    );

    if (maxFillable <= 0) {
      return [];
    }

    const fillAmount = Math.min(order.remaining, maxFillable);
    const [baseCurrency, quoteCurrency] = order.symbol.split("/");
    const cost = fillAmount * poolPrice;
    const fee = cost * this.feeRate;

    // Execute trade against pool (updates pool balances)
    const poolResult = await this.liquidityPoolManager.executePoolTrade(
      order.userId,
      order.symbol,
      order.side,
      fillAmount,
      poolPrice,
      order.id
    );

    if (!poolResult.success) {
      return [];
    }

    // Update user's wallet using the new executePoolTrade method
    if (this.walletManager) {
      await sequelize.transaction(async (t) => {
        // Use the wallet manager's executePoolTrade method
        await this.walletManager?.executePoolTrade(
          order.userId,
          baseCurrency,
          quoteCurrency,
          order.side,
          fillAmount,
          cost,
          fee,
          t
        );

        // Record transaction
        await this.recordPoolTradeTransaction(
          order,
          fillAmount,
          poolPrice,
          fee,
          poolResult.poolId,
          t
        );
      });
    }

    // Create trade record
    const trade: Trade = {
      id: `${order.id}-pool-${Date.now()}`,
      orderId: order.id,
      matchedOrderId: `pool-${poolResult.poolId}`,
      symbol: order.symbol,
      side: order.side,
      price: poolPrice,
      amount: fillAmount,
      cost,
      fee,
      feeCurrency: quoteCurrency,
      timestamp: new Date(),
      buyerUserId:
        order.side === "BUY" ? order.userId : `pool-${poolResult.poolId}`,
      sellerUserId:
        order.side === "SELL" ? order.userId : `pool-${poolResult.poolId}`,
    };

    trades.push(trade);

    // Update order
    order.filled += fillAmount;
    order.remaining -= fillAmount;
    order.cost += cost;
    order.trades.push(trade);
    order.updatedAt = new Date();

    // Update order in database
    await models.exchangeOrder.update(
      {
        filled: order.filled,
        remaining: order.remaining,
        cost: order.cost,
        status: order.remaining <= 0 ? "CLOSED" : "OPEN",
        trades: JSON.stringify(order.trades),
        updatedAt: order.updatedAt,
      },
      { where: { id: order.id } }
    );

    return trades;
  }

  /**
   * Record transaction for pool trade
   */
  private async recordPoolTradeTransaction(
    order: Order,
    amount: number,
    price: number,
    fee: number,
    poolId: string,
    transaction: unknown
  ): Promise<void> {
    const [baseCurrency, quoteCurrency] = order.symbol.split("/");
    const cost = amount * price;

    // Get user's wallets
    const baseWallet = await models.wallet.findOne({
      where: { userId: order.userId, currency: baseCurrency, type: "SPOT" },
      transaction: transaction as import("sequelize").Transaction,
    });

    const quoteWallet = await models.wallet.findOne({
      where: { userId: order.userId, currency: quoteCurrency, type: "SPOT" },
      transaction: transaction as import("sequelize").Transaction,
    });

    if (order.side === "BUY") {
      // User bought from pool
      if (baseWallet) {
        await models.transaction.create(
          {
            userId: order.userId,
            walletId: baseWallet.id,
            type: "EXCHANGE_ORDER",
            status: "COMPLETED",
            amount,
            fee: 0,
            description: `Bought ${amount} ${baseCurrency} from liquidity pool at ${price} ${quoteCurrency}`,
            referenceId: `pool-${poolId}-${order.id}`,
            metadata: JSON.stringify({
              orderId: order.id,
              poolId,
              symbol: order.symbol,
              side: "BUY",
              price,
              source: "LIQUIDITY_POOL",
            }),
          },
          { transaction: transaction as import("sequelize").Transaction }
        );
      }

      if (quoteWallet) {
        await models.transaction.create(
          {
            userId: order.userId,
            walletId: quoteWallet.id,
            type: "EXCHANGE_ORDER",
            status: "COMPLETED",
            amount: -cost,
            fee,
            description: `Paid ${cost} ${quoteCurrency} to liquidity pool for ${amount} ${baseCurrency}`,
            referenceId: `pool-${poolId}-${order.id}-payment`,
            metadata: JSON.stringify({
              orderId: order.id,
              poolId,
              symbol: order.symbol,
              side: "BUY",
              price,
              source: "LIQUIDITY_POOL",
            }),
          },
          { transaction: transaction as import("sequelize").Transaction }
        );
      }
    } else {
      // User sold to pool
      if (baseWallet) {
        await models.transaction.create(
          {
            userId: order.userId,
            walletId: baseWallet.id,
            type: "EXCHANGE_ORDER",
            status: "COMPLETED",
            amount: -amount,
            fee: 0,
            description: `Sold ${amount} ${baseCurrency} to liquidity pool at ${price} ${quoteCurrency}`,
            referenceId: `pool-${poolId}-${order.id}-sold`,
            metadata: JSON.stringify({
              orderId: order.id,
              poolId,
              symbol: order.symbol,
              side: "SELL",
              price,
              source: "LIQUIDITY_POOL",
            }),
          },
          { transaction: transaction as import("sequelize").Transaction }
        );
      }

      if (quoteWallet) {
        await models.transaction.create(
          {
            userId: order.userId,
            walletId: quoteWallet.id,
            type: "EXCHANGE_ORDER",
            status: "COMPLETED",
            amount: cost,
            fee,
            description: `Received ${cost} ${quoteCurrency} from liquidity pool for ${amount} ${baseCurrency}`,
            referenceId: `pool-${poolId}-${order.id}-receive`,
            metadata: JSON.stringify({
              orderId: order.id,
              poolId,
              symbol: order.symbol,
              side: "SELL",
              price,
              source: "LIQUIDITY_POOL",
            }),
          },
          { transaction: transaction as import("sequelize").Transaction }
        );
      }
    }
  }

  /**
   * Execute a trade between two orders
   */
  private async executeTrade(
    buyOrder: Order,
    sellOrder: Order,
    price: number,
    amount: number
  ): Promise<Trade> {
    const cost = price * amount;
    const [baseCurrency, quoteCurrency] = buyOrder.symbol.split("/");

    // Calculate fees for this trade
    const buyerFee = cost * this.feeRate;
    const sellerFee = cost * this.feeRate;

    // Create trade record
    const trade: Trade = {
      id: `${buyOrder.id}-${sellOrder.id}-${Date.now()}`,
      orderId: buyOrder.id,
      matchedOrderId: sellOrder.id,
      symbol: buyOrder.symbol,
      side: "BUY",
      price,
      amount,
      cost,
      fee: buyerFee + sellerFee,
      feeCurrency: quoteCurrency,
      timestamp: new Date(),
      buyerUserId: buyOrder.userId,
      sellerUserId: sellOrder.userId,
    };

    // Use database transaction for atomicity
    await sequelize.transaction(async (t) => {
      // Update wallet balances
      if (this.walletManager) {
        await this.walletManager.executeTrade(
          buyOrder.userId,
          sellOrder.userId,
          baseCurrency,
          quoteCurrency,
          amount,
          cost,
          buyerFee,
          sellerFee,
          t
        );
      }

      // Update buy order
      buyOrder.filled += amount;
      buyOrder.remaining -= amount;
      buyOrder.cost += cost;
      buyOrder.trades.push(trade);
      buyOrder.updatedAt = new Date();

      // Update sell order
      sellOrder.filled += amount;
      sellOrder.remaining -= amount;
      sellOrder.cost += cost;
      sellOrder.trades.push(trade);
      sellOrder.updatedAt = new Date();

      // Update orders in database
      await models.exchangeOrder.update(
        {
          filled: buyOrder.filled,
          remaining: buyOrder.remaining,
          cost: buyOrder.cost,
          status: buyOrder.remaining <= 0 ? "CLOSED" : "OPEN",
          trades: JSON.stringify(buyOrder.trades),
          updatedAt: buyOrder.updatedAt,
        },
        { where: { id: buyOrder.id }, transaction: t }
      );

      await models.exchangeOrder.update(
        {
          filled: sellOrder.filled,
          remaining: sellOrder.remaining,
          cost: sellOrder.cost,
          status: sellOrder.remaining <= 0 ? "CLOSED" : "OPEN",
          trades: JSON.stringify(sellOrder.trades),
          updatedAt: sellOrder.updatedAt,
        },
        { where: { id: sellOrder.id }, transaction: t }
      );

      // Record transactions for audit trail
      await this.recordTradeTransactions(trade, buyOrder, sellOrder, t);
    });

    return trade;
  }

  /**
   * Record trade transactions for audit trail
   */
  private async recordTradeTransactions(
    trade: Trade,
    buyOrder: Order,
    sellOrder: Order,
    transaction: import("sequelize").Transaction
  ): Promise<void> {
    const [baseCurrency, quoteCurrency] = trade.symbol.split("/");

    // Get wallets
    const buyerBaseWallet = await models.wallet.findOne({
      where: { userId: buyOrder.userId, currency: baseCurrency, type: "SPOT" },
      transaction,
    });

    const buyerQuoteWallet = await models.wallet.findOne({
      where: { userId: buyOrder.userId, currency: quoteCurrency, type: "SPOT" },
      transaction,
    });

    const sellerBaseWallet = await models.wallet.findOne({
      where: { userId: sellOrder.userId, currency: baseCurrency, type: "SPOT" },
      transaction,
    });

    const sellerQuoteWallet = await models.wallet.findOne({
      where: {
        userId: sellOrder.userId,
        currency: quoteCurrency,
        type: "SPOT",
      },
      transaction,
    });

    // Buyer receives base currency
    if (buyerBaseWallet) {
      await models.transaction.create(
        {
          userId: buyOrder.userId,
          walletId: buyerBaseWallet.id,
          type: "EXCHANGE_ORDER",
          status: "COMPLETED",
          amount: trade.amount,
          fee: 0,
          description: `Bought ${trade.amount} ${baseCurrency} at ${trade.price} ${quoteCurrency}`,
          referenceId: trade.id,
          metadata: JSON.stringify({
            orderId: buyOrder.id,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: "BUY",
            price: trade.price,
          }),
        },
        { transaction }
      );
    }

    // Buyer pays quote currency
    if (buyerQuoteWallet) {
      await models.transaction.create(
        {
          userId: buyOrder.userId,
          walletId: buyerQuoteWallet.id,
          type: "EXCHANGE_ORDER",
          status: "COMPLETED",
          amount: -trade.cost,
          fee: trade.fee / 2,
          description: `Paid ${trade.cost} ${quoteCurrency} for ${trade.amount} ${baseCurrency}`,
          referenceId: `${trade.id}-payment`,
          metadata: JSON.stringify({
            orderId: buyOrder.id,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: "BUY",
            price: trade.price,
          }),
        },
        { transaction }
      );
    }

    // Seller receives quote currency
    if (sellerQuoteWallet) {
      await models.transaction.create(
        {
          userId: sellOrder.userId,
          walletId: sellerQuoteWallet.id,
          type: "EXCHANGE_ORDER",
          status: "COMPLETED",
          amount: trade.cost,
          fee: trade.fee / 2,
          description: `Received ${trade.cost} ${quoteCurrency} for ${trade.amount} ${baseCurrency}`,
          referenceId: `${trade.id}-receive`,
          metadata: JSON.stringify({
            orderId: sellOrder.id,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: "SELL",
            price: trade.price,
          }),
        },
        { transaction }
      );
    }

    // Seller pays base currency
    if (sellerBaseWallet) {
      await models.transaction.create(
        {
          userId: sellOrder.userId,
          walletId: sellerBaseWallet.id,
          type: "EXCHANGE_ORDER",
          status: "COMPLETED",
          amount: -trade.amount,
          fee: 0,
          description: `Sold ${trade.amount} ${baseCurrency} at ${trade.price} ${quoteCurrency}`,
          referenceId: `${trade.id}-sold`,
          metadata: JSON.stringify({
            orderId: sellOrder.id,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: "SELL",
            price: trade.price,
          }),
        },
        { transaction }
      );
    }
  }

  /**
   * Handle remaining order after matching
   */
  private async handleRemainingOrder(
    result: MatchResult,
    order: Order
  ): Promise<void> {
    if (!result.remainingOrder) {
      return;
    }

    const remaining = result.remainingOrder;

    // Handle based on order type and time in force
    if (order.type === "MARKET") {
      // Market orders that can't be fully filled are rejected (not canceled)
      // This should rarely happen since we check liquidity before creating the order
      remaining.status = "REJECTED";
      await this.rejectOrderInDatabase(
        remaining.id,
        "Market order could not be fully filled - insufficient liquidity"
      );

      // Release ALL locked funds for unfilled portion (including buffer)
      if (this.walletManager) {
        await this.releaseUnfilledFundsWithBuffer(remaining, order);
      }
    } else if (order.timeInForce === "IOC") {
      // Immediate or Cancel - cancel unfilled portion
      remaining.status = "CANCELED";
      await this.cancelOrderInDatabase(
        remaining.id,
        "IOC order - unfilled portion canceled"
      );

      if (this.walletManager) {
        await this.releaseUnfilledFunds(remaining);
      }
    } else if (order.timeInForce === "FOK") {
      // Fill or Kill - if not fully filled, cancel entire order
      if (remaining.filled === 0) {
        remaining.status = "CANCELED";
        await this.cancelOrderInDatabase(
          remaining.id,
          "FOK order - could not be fully filled"
        );

        if (this.walletManager) {
          await this.releaseUnfilledFunds(remaining);
        }
      }
    } else {
      // GTC (Good Till Canceled) or PO (Post Only) - add to order book
      this.addToOrderBook(remaining);
    }
  }

  /**
   * Release locked funds for unfilled portion of order
   */
  private async releaseUnfilledFunds(order: Order): Promise<void> {
    if (!this.walletManager) {
      return;
    }

    const [baseCurrency, quoteCurrency] = order.symbol.split("/");

    if (order.side === "BUY") {
      // Release quote currency for unfilled amount
      const unfilledCost = order.remaining * order.price;
      await this.walletManager.releaseFunds(
        order.userId,
        quoteCurrency,
        unfilledCost
      );
    } else {
      // Release base currency for unfilled amount
      await this.walletManager.releaseFunds(
        order.userId,
        baseCurrency,
        order.remaining
      );
    }
  }

  /**
   * Release locked funds for unfilled portion of MARKET order (includes buffer)
   * This ensures the 5% buffer locked for MARKET orders is properly released
   */
  private async releaseUnfilledFundsWithBuffer(
    remainingOrder: Order,
    originalOrder: Order
  ): Promise<void> {
    if (!this.walletManager) {
      return;
    }

    const [baseCurrency, quoteCurrency] = remainingOrder.symbol.split("/");

    if (remainingOrder.side === "BUY") {
      // For MARKET BUY orders, we locked (amount * price * 1.05) + fee
      // We need to release the unfilled portion including the buffer
      const originalLockedAmount = originalOrder.lockedAmount || 0;

      // Calculate what should be released: original locked - what was actually used
      // For filled portion, the actual cost was deducted during trade execution
      // We need to release the remaining locked amount
      const unfilledRatio =
        remainingOrder.amount > 0
          ? remainingOrder.remaining / remainingOrder.amount
          : 0;
      const unfilledLockedAmount = originalLockedAmount * unfilledRatio;

      await this.walletManager.releaseFunds(
        remainingOrder.userId,
        quoteCurrency,
        unfilledLockedAmount
      );
    } else {
      // For SELL orders, release base currency for unfilled amount
      await this.walletManager.releaseFunds(
        remainingOrder.userId,
        baseCurrency,
        remainingOrder.remaining
      );
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    // Find order in database
    const dbOrder = await models.exchangeOrder.findOne({
      where: { id: orderId, userId, status: "OPEN" },
    });

    if (!dbOrder) {
      throw new Error("Order not found or already closed");
    }

    const order = this.dbOrderToOrder(dbOrder);

    // Check if order is locked
    if (this.lockedOrders.has(orderId)) {
      throw new Error("Order is currently being processed");
    }

    // Lock order
    this.lockedOrders.add(orderId);

    try {
      // Remove from order book
      this.removeFromOrderBook(order);

      // Update database
      await this.cancelOrderInDatabase(orderId, "Canceled by user");

      // Release locked funds
      if (this.walletManager) {
        await this.releaseUnfilledFunds(order);
      }

      return true;
    } finally {
      this.lockedOrders.delete(orderId);
    }
  }

  /**
   * Cancel order in database
   */
  private async cancelOrderInDatabase(
    orderId: string,
    _reason: string
  ): Promise<void> {
    await models.exchangeOrder.update(
      {
        status: "CANCELED",
        updatedAt: new Date(),
      },
      { where: { id: orderId } }
    );
  }

  /**
   * Reject order in database (for MARKET orders that can't be filled)
   */
  private async rejectOrderInDatabase(
    orderId: string,
    _reason: string
  ): Promise<void> {
    await models.exchangeOrder.update(
      {
        status: "REJECTED",
        updatedAt: new Date(),
      },
      { where: { id: orderId } }
    );
  }

  /**
   * Get current order book for a symbol
   */
  getOrderBook(symbol: string): {
    bids: Array<{ price: number; amount: number; count: number }>;
    asks: Array<{ price: number; amount: number; count: number }>;
  } {
    const orderBook = this.orderBooks.get(symbol);

    if (!orderBook) {
      return { bids: [], asks: [] };
    }

    // Aggregate bids
    const bids: Array<{ price: number; amount: number; count: number }> = [];
    const bidPrices = Array.from(orderBook.bids.keys()).sort((a, b) => b - a);
    for (const price of bidPrices) {
      // biome-ignore lint/style/noNonNullAssertion: Orders at price level guaranteed to exist since we're iterating over keys from the Map
      const orders = orderBook.bids.get(price)!;
      const totalAmount = orders.reduce((sum, o) => sum + o.remaining, 0);
      bids.push({ price, amount: totalAmount, count: orders.length });
    }

    // Aggregate asks
    const asks: Array<{ price: number; amount: number; count: number }> = [];
    const askPrices = Array.from(orderBook.asks.keys()).sort((a, b) => a - b);
    for (const price of askPrices) {
      // biome-ignore lint/style/noNonNullAssertion: Orders at price level guaranteed to exist since we're iterating over keys from the Map
      const orders = orderBook.asks.get(price)!;
      const totalAmount = orders.reduce((sum, o) => sum + o.remaining, 0);
      asks.push({ price, amount: totalAmount, count: orders.length });
    }

    return { bids, asks };
  }

  /**
   * Get best bid price for a symbol
   */
  getBestBid(symbol: string): number | null {
    const orderBook = this.orderBooks.get(symbol);
    if (!orderBook || orderBook.bids.size === 0) {
      return null;
    }

    const prices = Array.from(orderBook.bids.keys());
    return Math.max(...prices);
  }

  /**
   * Get best ask price for a symbol
   */
  getBestAsk(symbol: string): number | null {
    const orderBook = this.orderBooks.get(symbol);
    if (!orderBook || orderBook.asks.size === 0) {
      return null;
    }

    const prices = Array.from(orderBook.asks.keys());
    return Math.min(...prices);
  }

  /**
   * Get spread for a symbol
   */
  getSpread(symbol: string): number | null {
    const bestBid = this.getBestBid(symbol);
    const bestAsk = this.getBestAsk(symbol);

    if (bestBid === null || bestAsk === null) {
      return null;
    }

    return bestAsk - bestBid;
  }

  /**
   * Get user's open orders
   */
  async getUserOpenOrders(userId: string, symbol?: string): Promise<Order[]> {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic query object for Sequelize
    const where: any = { userId, status: "OPEN" };
    if (symbol) {
      where.symbol = symbol;
    }

    const dbOrders = await models.exchangeOrder.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return dbOrders.map((o) => this.dbOrderToOrder(o));
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId: string): Promise<Order | null> {
    const dbOrder = await models.exchangeOrder.findOne({
      where: { id: orderId, userId },
    });

    if (!dbOrder) {
      return null;
    }

    return this.dbOrderToOrder(dbOrder);
  }

  /**
   * Get recent trades for a symbol
   */
  async getRecentTrades(symbol: string, limit = 50): Promise<Trade[]> {
    const recentOrders = await models.exchangeOrder.findAll({
      where: {
        symbol,
        status: ["CLOSED", "OPEN"],
        filled: { [models.Sequelize.Op.gt]: 0 },
      },
      order: [["updatedAt", "DESC"]],
      limit: limit * 2, // Get more orders to extract trades
    });

    const trades: Trade[] = [];
    for (const order of recentOrders) {
      const orderTrades = order.trades ? JSON.parse(order.trades) : [];
      trades.push(...orderTrades);
    }

    // Sort by timestamp and limit
    return trades
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }
}

export default SpotMatchingEngine;
