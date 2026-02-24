/**
 * Liquidity Pool Manager
 *
 * Manages admin liquidity pools for the internal SPOT exchange.
 * Provides liquidity when no user orders are available on the opposite side.
 *
 * Features:
 * - Pool CRUD operations
 * - Deposit/withdraw liquidity
 * - Execute trades against pool
 * - Transaction logging for audit trail
 * - Market price fetching from Binance/TWD/admin
 */

import { models, sequelize } from "@b/db";
import { logError } from "@b/utils/logger";
import type { Transaction } from "sequelize";

// ============================================================================
// Price Provider Types
// ============================================================================

export interface PriceInfo {
  price: number;
  source: "BINANCE" | "TWD" | "ADMIN" | "ORDER_BOOK";
  timestamp: Date;
}

export interface PriceProviderConfig {
  binanceEnabled: boolean;
  twdEnabled: boolean;
  fallbackToAdmin: boolean;
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface LiquidityPoolInfo {
  id: string;
  symbol: string;
  currency: string;
  pair: string;
  baseBalance: number;
  quoteBalance: number;
  baseInOrder: number;
  quoteInOrder: number;
  baseAvailable: number;
  quoteAvailable: number;
  spreadPercentage: number;
  minOrderSize: number;
  maxOrderSize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePoolInput {
  symbol: string;
  spreadPercentage?: number;
  minOrderSize?: number;
  maxOrderSize?: number;
  isActive?: boolean;
}

export interface UpdatePoolInput {
  spreadPercentage?: number;
  minOrderSize?: number;
  maxOrderSize?: number;
  isActive?: boolean;
}

export interface PoolTradeResult {
  success: boolean;
  filledAmount: number;
  filledCost: number;
  price: number;
  poolId: string;
}

export interface PoolStats {
  totalPools: number;
  activePools: number;
  totalBaseValue: number;
  totalQuoteValue: number;
  recentTransactions: number;
}

export interface PoolPriceConfig {
  adminBidPrice?: number;
  adminAskPrice?: number;
  useMarketPrice: boolean;
}

type OrderSide = "BUY" | "SELL";

// ============================================================================
// LiquidityPoolManager Class
// ============================================================================

export class LiquidityPoolManager {
  private static instance: LiquidityPoolManager | null = null;
  private readonly pools: Map<string, LiquidityPoolInfo>;
  private readonly priceCache: Map<string, PriceInfo>;
  private readonly priceCacheTTL = 5000; // 5 seconds cache
  private initialized = false;

  private constructor() {
    this.pools = new Map();
    this.priceCache = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LiquidityPoolManager {
    if (!LiquidityPoolManager.instance) {
      LiquidityPoolManager.instance = new LiquidityPoolManager();
    }
    return LiquidityPoolManager.instance;
  }

  /**
   * Initialize the pool manager and load pools from database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.loadPools();
      this.initialized = true;
    } catch (error) {
      logError("liquidity_pool_manager", error, __filename);
      throw new Error("Failed to initialize liquidity pool manager");
    }
  }

  /**
   * Load all pools from database into memory
   */
  private async loadPools(): Promise<void> {
    const dbPools = await models.liquidityPool.findAll();

    for (const pool of dbPools) {
      const poolInfo = this.dbPoolToPoolInfo(pool);
      this.pools.set(pool.symbol, poolInfo);
    }
  }

  /**
   * Convert database pool to pool info
   */
  private dbPoolToPoolInfo(dbPool: {
    id: string;
    symbol: string;
    currency: string;
    pair: string;
    baseBalance: number;
    quoteBalance: number;
    baseInOrder: number;
    quoteInOrder: number;
    spreadPercentage: number;
    minOrderSize: number;
    maxOrderSize: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): LiquidityPoolInfo {
    return {
      id: dbPool.id,
      symbol: dbPool.symbol,
      currency: dbPool.currency,
      pair: dbPool.pair,
      baseBalance: dbPool.baseBalance,
      quoteBalance: dbPool.quoteBalance,
      baseInOrder: dbPool.baseInOrder,
      quoteInOrder: dbPool.quoteInOrder,
      baseAvailable: dbPool.baseBalance - dbPool.baseInOrder,
      quoteAvailable: dbPool.quoteBalance - dbPool.quoteInOrder,
      spreadPercentage: dbPool.spreadPercentage,
      minOrderSize: dbPool.minOrderSize,
      maxOrderSize: dbPool.maxOrderSize,
      isActive: dbPool.isActive,
      createdAt: dbPool.createdAt ?? new Date(),
      updatedAt: dbPool.updatedAt ?? new Date(),
    };
  }

  /**
   * Check if pool can fill an order
   */
  canFillOrder(
    symbol: string,
    side: OrderSide,
    amount: number,
    _price: number
  ): boolean {
    const pool = this.pools.get(symbol);

    if (!pool?.isActive) {
      return false;
    }

    // Check minimum order size
    if (pool.minOrderSize > 0 && amount < pool.minOrderSize) {
      return false;
    }

    // Check maximum order size
    if (pool.maxOrderSize > 0 && amount > pool.maxOrderSize) {
      return false;
    }

    // For BUY orders, pool needs to have base currency to sell
    // For SELL orders, pool needs to have quote currency to buy
    if (side === "BUY") {
      return pool.baseAvailable >= amount;
    }
    // For SELL, we need quote currency to pay the user
    // The amount of quote needed depends on the price
    // We'll check this more precisely in executePoolTrade
    return pool.quoteAvailable > 0;
  }

  /**
   * Get the amount that can be filled from the pool
   */
  getMaxFillableAmount(symbol: string, side: OrderSide, price: number): number {
    const pool = this.pools.get(symbol);

    if (!pool?.isActive) {
      return 0;
    }

    if (side === "BUY") {
      // Pool sells base currency
      let maxAmount = pool.baseAvailable;
      if (pool.maxOrderSize > 0) {
        maxAmount = Math.min(maxAmount, pool.maxOrderSize);
      }
      return maxAmount;
    }
    // Pool buys base currency, pays quote
    // Max amount = quote available / price
    let maxAmount = price > 0 ? pool.quoteAvailable / price : 0;
    if (pool.maxOrderSize > 0) {
      maxAmount = Math.min(maxAmount, pool.maxOrderSize);
    }
    return maxAmount;
  }

  /**
   * Execute a trade against the pool
   *
   * For BUY orders: User buys base, pool sells base (receives quote)
   * For SELL orders: User sells base, pool buys base (pays quote)
   */
  async executePoolTrade(
    userId: string,
    symbol: string,
    side: OrderSide,
    amount: number,
    price: number,
    orderId?: string,
    transaction?: Transaction
  ): Promise<PoolTradeResult> {
    const pool = this.pools.get(symbol);

    if (!pool?.isActive) {
      return {
        success: false,
        filledAmount: 0,
        filledCost: 0,
        price: 0,
        poolId: "",
      };
    }

    const useTransaction = transaction ?? (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const cost = amount * price;
      const [baseCurrency, quoteCurrency] = symbol.split("/");

      if (side === "BUY") {
        // User buys base currency from pool
        // Pool: decrease base, increase quote
        if (pool.baseAvailable < amount) {
          if (shouldCommit) {
            await useTransaction.rollback();
          }
          return {
            success: false,
            filledAmount: 0,
            filledCost: 0,
            price: 0,
            poolId: pool.id,
          };
        }

        // Update pool balances
        const newBaseBalance = pool.baseBalance - amount;
        const newQuoteBalance = pool.quoteBalance + cost;

        await models.liquidityPool.update(
          {
            baseBalance: newBaseBalance,
            quoteBalance: newQuoteBalance,
          },
          {
            where: { id: pool.id },
            transaction: useTransaction,
          }
        );

        // Record transactions
        await this.recordPoolTransaction(
          pool.id,
          "TRADE_SELL",
          baseCurrency,
          -amount,
          pool.baseBalance,
          newBaseBalance,
          orderId,
          userId,
          `Pool sold ${amount} ${baseCurrency} at ${price} ${quoteCurrency}`,
          useTransaction
        );

        await this.recordPoolTransaction(
          pool.id,
          "TRADE_SELL",
          quoteCurrency,
          cost,
          pool.quoteBalance,
          newQuoteBalance,
          orderId,
          userId,
          `Pool received ${cost} ${quoteCurrency} for ${amount} ${baseCurrency}`,
          useTransaction
        );

        // Update in-memory cache
        pool.baseBalance = newBaseBalance;
        pool.quoteBalance = newQuoteBalance;
        pool.baseAvailable = newBaseBalance - pool.baseInOrder;
        pool.quoteAvailable = newQuoteBalance - pool.quoteInOrder;
      } else {
        // User sells base currency to pool
        // Pool: increase base, decrease quote
        if (pool.quoteAvailable < cost) {
          if (shouldCommit) {
            await useTransaction.rollback();
          }
          return {
            success: false,
            filledAmount: 0,
            filledCost: 0,
            price: 0,
            poolId: pool.id,
          };
        }

        // Update pool balances
        const newBaseBalance = pool.baseBalance + amount;
        const newQuoteBalance = pool.quoteBalance - cost;

        await models.liquidityPool.update(
          {
            baseBalance: newBaseBalance,
            quoteBalance: newQuoteBalance,
          },
          {
            where: { id: pool.id },
            transaction: useTransaction,
          }
        );

        // Record transactions
        await this.recordPoolTransaction(
          pool.id,
          "TRADE_BUY",
          baseCurrency,
          amount,
          pool.baseBalance,
          newBaseBalance,
          orderId,
          userId,
          `Pool bought ${amount} ${baseCurrency} at ${price} ${quoteCurrency}`,
          useTransaction
        );

        await this.recordPoolTransaction(
          pool.id,
          "TRADE_BUY",
          quoteCurrency,
          -cost,
          pool.quoteBalance,
          newQuoteBalance,
          orderId,
          userId,
          `Pool paid ${cost} ${quoteCurrency} for ${amount} ${baseCurrency}`,
          useTransaction
        );

        // Update in-memory cache
        pool.baseBalance = newBaseBalance;
        pool.quoteBalance = newQuoteBalance;
        pool.baseAvailable = newBaseBalance - pool.baseInOrder;
        pool.quoteAvailable = newQuoteBalance - pool.quoteInOrder;
      }

      if (shouldCommit) {
        await useTransaction.commit();
      }

      return {
        success: true,
        filledAmount: amount,
        filledCost: cost,
        price,
        poolId: pool.id,
      };
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("liquidity_pool_manager", error, __filename);
      return {
        success: false,
        filledAmount: 0,
        filledCost: 0,
        price: 0,
        poolId: pool?.id ?? "",
      };
    }
  }

  /**
   * Record a pool transaction for audit trail
   */
  private async recordPoolTransaction(
    poolId: string,
    type: "DEPOSIT" | "WITHDRAW" | "TRADE_BUY" | "TRADE_SELL" | "ADJUSTMENT",
    currency: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    orderId: string | undefined,
    userId: string | undefined,
    description: string,
    transaction: Transaction
  ): Promise<void> {
    await models.liquidityPoolTransaction.create(
      {
        poolId,
        type,
        currency,
        amount,
        balanceBefore,
        balanceAfter,
        orderId,
        userId,
        description,
      },
      { transaction }
    );
  }

  // ============================================================================
  // Admin Operations
  // ============================================================================

  /**
   * Create a new liquidity pool
   */
  async createPool(data: CreatePoolInput): Promise<LiquidityPoolInfo> {
    const [currency, pair] = data.symbol.split("/");
    const isValidSymbol = currency && pair;

    if (!isValidSymbol) {
      throw new Error("Invalid symbol format. Expected format: BASE/QUOTE");
    }

    // Check if pool already exists
    const existing = await models.liquidityPool.findOne({
      where: { symbol: data.symbol },
    });

    if (existing) {
      throw new Error(`Pool for ${data.symbol} already exists`);
    }

    // Check if market exists
    const market = await models.exchangeMarket.findOne({
      where: { currency, pair },
    });

    if (!market) {
      throw new Error(`Market ${data.symbol} does not exist`);
    }

    const pool = await models.liquidityPool.create({
      symbol: data.symbol,
      currency,
      pair,
      baseBalance: 0,
      quoteBalance: 0,
      baseInOrder: 0,
      quoteInOrder: 0,
      spreadPercentage: data.spreadPercentage ?? 0.1,
      minOrderSize: data.minOrderSize ?? 0,
      maxOrderSize: data.maxOrderSize ?? 0,
      isActive: data.isActive ?? true,
    });

    const poolInfo = this.dbPoolToPoolInfo(pool);
    this.pools.set(data.symbol, poolInfo);

    return poolInfo;
  }

  /**
   * Update pool settings
   */
  async updatePool(
    id: string,
    data: UpdatePoolInput
  ): Promise<LiquidityPoolInfo> {
    const pool = await models.liquidityPool.findByPk(id);

    if (!pool) {
      throw new Error("Pool not found");
    }

    await pool.update({
      spreadPercentage: data.spreadPercentage ?? pool.spreadPercentage,
      minOrderSize: data.minOrderSize ?? pool.minOrderSize,
      maxOrderSize: data.maxOrderSize ?? pool.maxOrderSize,
      isActive: data.isActive ?? pool.isActive,
    });

    const poolInfo = this.dbPoolToPoolInfo(pool);
    this.pools.set(pool.symbol, poolInfo);

    return poolInfo;
  }

  /**
   * Delete a pool
   */
  async deletePool(id: string): Promise<void> {
    const pool = await models.liquidityPool.findByPk(id);

    if (!pool) {
      throw new Error("Pool not found");
    }

    // Check if pool has any balance
    if (pool.baseBalance > 0 || pool.quoteBalance > 0) {
      throw new Error(
        "Cannot delete pool with remaining balance. Withdraw all funds first."
      );
    }

    await pool.destroy();
    this.pools.delete(pool.symbol);
  }

  /**
   * Deposit liquidity to a pool
   */
  async depositLiquidity(
    id: string,
    baseAmount: number,
    quoteAmount: number
  ): Promise<LiquidityPoolInfo> {
    if (baseAmount < 0 || quoteAmount < 0) {
      throw new Error("Deposit amounts cannot be negative");
    }

    if (baseAmount === 0 && quoteAmount === 0) {
      throw new Error("At least one deposit amount must be greater than zero");
    }

    const transaction = await sequelize.transaction();

    try {
      const pool = await models.liquidityPool.findByPk(id, {
        lock: true,
        transaction,
      });

      if (!pool) {
        await transaction.rollback();
        throw new Error("Pool not found");
      }

      const [baseCurrency, quoteCurrency] = pool.symbol.split("/");
      const newBaseBalance = pool.baseBalance + baseAmount;
      const newQuoteBalance = pool.quoteBalance + quoteAmount;

      await pool.update(
        {
          baseBalance: newBaseBalance,
          quoteBalance: newQuoteBalance,
        },
        { transaction }
      );

      // Record transactions
      if (baseAmount > 0) {
        await this.recordPoolTransaction(
          pool.id,
          "DEPOSIT",
          baseCurrency,
          baseAmount,
          pool.baseBalance,
          newBaseBalance,
          undefined,
          undefined,
          `Admin deposited ${baseAmount} ${baseCurrency}`,
          transaction
        );
      }

      if (quoteAmount > 0) {
        await this.recordPoolTransaction(
          pool.id,
          "DEPOSIT",
          quoteCurrency,
          quoteAmount,
          pool.quoteBalance,
          newQuoteBalance,
          undefined,
          undefined,
          `Admin deposited ${quoteAmount} ${quoteCurrency}`,
          transaction
        );
      }

      await transaction.commit();

      const poolInfo = this.dbPoolToPoolInfo({
        ...pool.get({ plain: true }),
        baseBalance: newBaseBalance,
        quoteBalance: newQuoteBalance,
      });
      this.pools.set(pool.symbol, poolInfo);

      return poolInfo;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Withdraw liquidity from a pool
   */
  async withdrawLiquidity(
    id: string,
    baseAmount: number,
    quoteAmount: number
  ): Promise<LiquidityPoolInfo> {
    if (baseAmount < 0 || quoteAmount < 0) {
      throw new Error("Withdrawal amounts cannot be negative");
    }

    if (baseAmount === 0 && quoteAmount === 0) {
      throw new Error(
        "At least one withdrawal amount must be greater than zero"
      );
    }

    const transaction = await sequelize.transaction();

    try {
      const pool = await models.liquidityPool.findByPk(id, {
        lock: true,
        transaction,
      });

      if (!pool) {
        await transaction.rollback();
        throw new Error("Pool not found");
      }

      const baseAvailable = pool.baseBalance - pool.baseInOrder;
      const quoteAvailable = pool.quoteBalance - pool.quoteInOrder;

      if (baseAmount > baseAvailable) {
        await transaction.rollback();
        throw new Error(
          `Insufficient base balance. Available: ${baseAvailable}`
        );
      }

      if (quoteAmount > quoteAvailable) {
        await transaction.rollback();
        throw new Error(
          `Insufficient quote balance. Available: ${quoteAvailable}`
        );
      }

      const [baseCurrency, quoteCurrency] = pool.symbol.split("/");
      const newBaseBalance = pool.baseBalance - baseAmount;
      const newQuoteBalance = pool.quoteBalance - quoteAmount;

      await pool.update(
        {
          baseBalance: newBaseBalance,
          quoteBalance: newQuoteBalance,
        },
        { transaction }
      );

      // Record transactions
      if (baseAmount > 0) {
        await this.recordPoolTransaction(
          pool.id,
          "WITHDRAW",
          baseCurrency,
          -baseAmount,
          pool.baseBalance,
          newBaseBalance,
          undefined,
          undefined,
          `Admin withdrew ${baseAmount} ${baseCurrency}`,
          transaction
        );
      }

      if (quoteAmount > 0) {
        await this.recordPoolTransaction(
          pool.id,
          "WITHDRAW",
          quoteCurrency,
          -quoteAmount,
          pool.quoteBalance,
          newQuoteBalance,
          undefined,
          undefined,
          `Admin withdrew ${quoteAmount} ${quoteCurrency}`,
          transaction
        );
      }

      await transaction.commit();

      const poolInfo = this.dbPoolToPoolInfo({
        ...pool.get({ plain: true }),
        baseBalance: newBaseBalance,
        quoteBalance: newQuoteBalance,
      });
      this.pools.set(pool.symbol, poolInfo);

      return poolInfo;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Toggle pool active status
   */
  async setPoolStatus(
    id: string,
    isActive: boolean
  ): Promise<LiquidityPoolInfo> {
    const pool = await models.liquidityPool.findByPk(id);

    if (!pool) {
      throw new Error("Pool not found");
    }

    await pool.update({ isActive });

    const poolInfo = this.dbPoolToPoolInfo(pool);
    this.pools.set(pool.symbol, poolInfo);

    return poolInfo;
  }

  // ============================================================================
  // Query Operations
  // ============================================================================

  /**
   * Get pool by ID
   */
  async getPool(id: string): Promise<LiquidityPoolInfo | null> {
    const pool = await models.liquidityPool.findByPk(id);
    if (!pool) {
      return null;
    }
    return this.dbPoolToPoolInfo(pool);
  }

  /**
   * Get pool by symbol
   */
  getPoolBySymbol(symbol: string): LiquidityPoolInfo | null {
    return this.pools.get(symbol) ?? null;
  }

  /**
   * Get all pools
   */
  async getAllPools(): Promise<LiquidityPoolInfo[]> {
    const pools = await models.liquidityPool.findAll({
      order: [["symbol", "ASC"]],
    });
    return pools.map((p) => this.dbPoolToPoolInfo(p));
  }

  /**
   * Get pool transactions
   */
  async getPoolTransactions(
    poolId: string,
    limit = 50,
    offset = 0
  ): Promise<{
    transactions: Array<{
      id: string;
      type: string;
      currency: string;
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      orderId?: string;
      userId?: string;
      description?: string;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const { count, rows } =
      await models.liquidityPoolTransaction.findAndCountAll({
        where: { poolId },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

    return {
      transactions: rows.map((t) => ({
        id: t.id,
        type: t.type,
        currency: t.currency,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        orderId: t.orderId,
        userId: t.userId,
        description: t.description,
        createdAt: t.createdAt ?? new Date(),
      })),
      total: count,
    };
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(): Promise<PoolStats> {
    const pools = await models.liquidityPool.findAll();
    const activePools = pools.filter((p) => p.isActive);

    const totalBaseValue = pools.reduce((sum, p) => sum + p.baseBalance, 0);
    const totalQuoteValue = pools.reduce((sum, p) => sum + p.quoteBalance, 0);

    // Get recent transaction count (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTransactions = await models.liquidityPoolTransaction.count({
      where: {
        createdAt: {
          [models.Sequelize.Op.gte]: oneDayAgo,
        },
      },
    });

    return {
      totalPools: pools.length,
      activePools: activePools.length,
      totalBaseValue,
      totalQuoteValue,
      recentTransactions,
    };
  }

  /**
   * Check if manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Refresh pool data from database
   */
  async refreshPool(symbol: string): Promise<void> {
    const pool = await models.liquidityPool.findOne({ where: { symbol } });
    if (pool) {
      const poolInfo = this.dbPoolToPoolInfo(pool);
      this.pools.set(symbol, poolInfo);
    } else {
      this.pools.delete(symbol);
    }
  }

  // ============================================================================
  // Price Provider Methods
  // ============================================================================

  /**
   * Get the current market price for a symbol
   * Priority: Binance API > TWD Provider > Admin Price > Order Book
   */
  async getMarketPrice(
    symbol: string,
    orderBookBestBid?: number,
    orderBookBestAsk?: number
  ): Promise<PriceInfo | null> {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    if (
      cached &&
      Date.now() - cached.timestamp.getTime() < this.priceCacheTTL
    ) {
      return cached;
    }

    // Try Binance first
    const binancePrice = await this.fetchBinancePrice(symbol);
    if (binancePrice) {
      this.priceCache.set(symbol, binancePrice);
      return binancePrice;
    }

    // Try TWD provider
    const twdPrice = await this.fetchTWDPrice(symbol);
    if (twdPrice) {
      this.priceCache.set(symbol, twdPrice);
      return twdPrice;
    }

    // Try admin-set price from market
    const adminPrice = await this.fetchAdminPrice(symbol);
    if (adminPrice) {
      this.priceCache.set(symbol, adminPrice);
      return adminPrice;
    }

    // Fall back to order book mid-price
    if (orderBookBestBid !== undefined && orderBookBestAsk !== undefined) {
      const midPrice = (orderBookBestBid + orderBookBestAsk) / 2;
      const priceInfo: PriceInfo = {
        price: midPrice,
        source: "ORDER_BOOK",
        timestamp: new Date(),
      };
      this.priceCache.set(symbol, priceInfo);
      return priceInfo;
    }

    // If only one side is available, use that
    if (orderBookBestBid !== undefined) {
      const priceInfo: PriceInfo = {
        price: orderBookBestBid,
        source: "ORDER_BOOK",
        timestamp: new Date(),
      };
      this.priceCache.set(symbol, priceInfo);
      return priceInfo;
    }

    if (orderBookBestAsk !== undefined) {
      const priceInfo: PriceInfo = {
        price: orderBookBestAsk,
        source: "ORDER_BOOK",
        timestamp: new Date(),
      };
      this.priceCache.set(symbol, priceInfo);
      return priceInfo;
    }

    return null;
  }

  /**
   * Fetch price from Binance API
   */
  private async fetchBinancePrice(symbol: string): Promise<PriceInfo | null> {
    try {
      // Convert symbol format: BTC/USDT -> BTCUSDT
      const binanceSymbol = symbol.replace("/", "");

      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data?.price) {
        return {
          price: Number.parseFloat(data.price),
          source: "BINANCE",
          timestamp: new Date(),
        };
      }
    } catch {
      // Binance API not available or symbol not found
    }
    return null;
  }

  /**
   * Fetch price from TWD provider if active
   */
  private async fetchTWDPrice(symbol: string): Promise<PriceInfo | null> {
    try {
      // Check if TWD provider is enabled
      const twdProvider = await models.exchangeProvider?.findOne({
        where: { name: "TWD", status: true },
      });

      if (!twdProvider) {
        return null;
      }

      // Get market with TWD provider
      const [currency, pair] = symbol.split("/");
      const market = await models.exchangeMarket.findOne({
        where: { currency, pair },
      });

      if (market?.metadata) {
        const metadata =
          typeof market.metadata === "string"
            ? JSON.parse(market.metadata)
            : market.metadata;

        if (metadata?.price) {
          return {
            price: Number.parseFloat(metadata.price),
            source: "TWD",
            timestamp: new Date(),
          };
        }
      }
    } catch {
      // TWD provider not available
    }
    return null;
  }

  /**
   * Fetch admin-set price from market configuration
   */
  private async fetchAdminPrice(symbol: string): Promise<PriceInfo | null> {
    try {
      const [currency, pair] = symbol.split("/");
      const market = await models.exchangeMarket.findOne({
        where: { currency, pair },
      });

      if (market?.metadata) {
        const metadata =
          typeof market.metadata === "string"
            ? JSON.parse(market.metadata)
            : market.metadata;

        // Check for admin-set price in metadata
        if (metadata?.adminPrice) {
          return {
            price: Number.parseFloat(metadata.adminPrice),
            source: "ADMIN",
            timestamp: new Date(),
          };
        }
      }
    } catch {
      // Admin price not available
    }
    return null;
  }

  /**
   * Get the price for pool trades with spread applied
   * For BUY orders (user buys from pool): use ask price (higher)
   * For SELL orders (user sells to pool): use bid price (lower)
   */
  async getPoolTradePrice(
    symbol: string,
    side: OrderSide,
    orderBookBestBid?: number,
    orderBookBestAsk?: number
  ): Promise<number | null> {
    const pool = this.pools.get(symbol);
    if (!pool?.isActive) {
      return null;
    }

    const marketPrice = await this.getMarketPrice(
      symbol,
      orderBookBestBid,
      orderBookBestAsk
    );

    if (!marketPrice) {
      return null;
    }

    const spreadMultiplier = pool.spreadPercentage / 100;

    if (side === "BUY") {
      // User buys from pool - pool sells at ask price (market + spread)
      return marketPrice.price * (1 + spreadMultiplier);
    }
    // User sells to pool - pool buys at bid price (market - spread)
    return marketPrice.price * (1 - spreadMultiplier);
  }

  /**
   * Clear price cache for a symbol
   */
  clearPriceCache(symbol?: string): void {
    if (symbol) {
      this.priceCache.delete(symbol);
    } else {
      this.priceCache.clear();
    }
  }
}

export default LiquidityPoolManager;
