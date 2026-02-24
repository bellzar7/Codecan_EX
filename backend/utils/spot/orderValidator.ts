/**
 * SPOT Order Validator
 *
 * Validates order parameters before processing:
 * - Market existence and status
 * - Minimum order size
 * - Price validation for limit orders
 * - User balance verification
 *
 * All validations happen before order is submitted to matching engine.
 */

import { models } from "@b/db";
import { logError } from "@b/utils/logger";
import type { SpotWalletManager } from "./walletManager";

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Order input for validation
 */
export interface OrderInput {
  userId: string;
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  timeInForce?: "GTC" | "IOC" | "FOK" | "PO";
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  market?: MarketInfo;
}

/**
 * Market information
 */
export interface MarketInfo {
  id: string;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  minAmount: number;
  maxAmount: number;
  minPrice: number;
  maxPrice: number;
  minCost: number;
  pricePrecision: number;
  amountPrecision: number;
  takerFee: number;
  makerFee: number;
  status: boolean;
}

/**
 * Price validation options
 */
export interface PriceValidationOptions {
  maxDeviationPercent: number; // Maximum deviation from market price
  useOrderBook: boolean; // Whether to use order book for validation
}

// ============================================================================
// SpotOrderValidator Class
// ============================================================================

export class SpotOrderValidator {
  private static instance: SpotOrderValidator | null = null;
  private readonly marketCache: Map<string, MarketInfo>;
  private readonly cacheExpiry: Map<string, number>;
  private readonly cacheTTL = 60_000; // 1 minute cache
  private walletManager: SpotWalletManager | null = null;
  private readonly defaultMinAmount = 0.000_01;
  private readonly defaultMinCost = 1; // Minimum order value in quote currency
  private readonly maxPriceDeviation = 0.1; // 10% max deviation from market price

  private constructor() {
    this.marketCache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SpotOrderValidator {
    if (!SpotOrderValidator.instance) {
      SpotOrderValidator.instance = new SpotOrderValidator();
    }
    return SpotOrderValidator.instance;
  }

  /**
   * Initialize with wallet manager dependency
   */
  initialize(walletManager: SpotWalletManager): void {
    this.walletManager = walletManager;
  }

  /**
   * Validate an order
   */
  async validateOrder(order: OrderInput): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic field validation
    const basicValidation = this.validateBasicFields(order);
    if (!basicValidation.valid) {
      return { valid: false, errors: basicValidation.errors, warnings };
    }

    // Validate market exists and is active
    const market = await this.getMarketInfo(order.symbol);
    if (!market) {
      return {
        valid: false,
        errors: [`Market ${order.symbol} not found`],
        warnings,
      };
    }

    if (!market.status) {
      return {
        valid: false,
        errors: [`Market ${order.symbol} is currently disabled`],
        warnings,
      };
    }

    // Validate amount
    const amountValidation = this.validateAmount(order, market);
    errors.push(...amountValidation.errors);
    warnings.push(...amountValidation.warnings);

    // Validate price (for limit orders)
    if (order.type === "LIMIT") {
      const priceValidation = await this.validatePrice(order, market);
      errors.push(...priceValidation.errors);
      warnings.push(...priceValidation.warnings);
    }

    // Validate minimum cost
    const costValidation = this.validateMinimumCost(order, market);
    errors.push(...costValidation.errors);
    warnings.push(...costValidation.warnings);

    // Validate user balance
    if (this.walletManager) {
      const balanceValidation = await this.validateBalance(order, market);
      errors.push(...balanceValidation.errors);
      warnings.push(...balanceValidation.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      market,
    };
  }

  /**
   * Validate basic order fields
   */
  private validateBasicFields(order: OrderInput): ValidationResult {
    const errors: string[] = [];

    if (!order.userId) {
      errors.push("User ID is required");
    }

    if (!order.symbol) {
      errors.push("Symbol is required");
    } else if (!order.symbol.includes("/")) {
      errors.push(
        "Invalid symbol format. Expected format: BASE/QUOTE (e.g., BTC/USDT)"
      );
    }

    if (!(order.type && ["MARKET", "LIMIT"].includes(order.type))) {
      errors.push("Order type must be MARKET or LIMIT");
    }

    if (!(order.side && ["BUY", "SELL"].includes(order.side))) {
      errors.push("Order side must be BUY or SELL");
    }

    if (typeof order.amount !== "number" || order.amount <= 0) {
      errors.push("Amount must be a positive number");
    }

    if (
      order.type === "LIMIT" &&
      (typeof order.price !== "number" || order.price <= 0)
    ) {
      errors.push("Price must be a positive number for limit orders");
    }

    if (
      order.timeInForce &&
      !["GTC", "IOC", "FOK", "PO"].includes(order.timeInForce)
    ) {
      errors.push("Invalid time in force. Must be GTC, IOC, FOK, or PO");
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  /**
   * Validate order amount
   */
  private validateAmount(
    order: OrderInput,
    market: MarketInfo
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (order.amount < market.minAmount) {
      errors.push(
        `Amount ${order.amount} is below minimum ${market.minAmount} ${market.baseCurrency}`
      );
    }

    if (market.maxAmount > 0 && order.amount > market.maxAmount) {
      errors.push(
        `Amount ${order.amount} exceeds maximum ${market.maxAmount} ${market.baseCurrency}`
      );
    }

    // Check precision
    const amountStr = order.amount.toString();
    const decimalPlaces = amountStr.includes(".")
      ? amountStr.split(".")[1].length
      : 0;

    if (decimalPlaces > market.amountPrecision) {
      warnings.push(
        `Amount precision ${decimalPlaces} exceeds market precision ${market.amountPrecision}. Amount will be truncated.`
      );
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate order price
   */
  private async validatePrice(
    order: OrderInput,
    market: MarketInfo
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (order.price <= 0) {
      errors.push("Price must be greater than 0");
      return { valid: false, errors, warnings };
    }

    if (market.minPrice > 0 && order.price < market.minPrice) {
      errors.push(
        `Price ${order.price} is below minimum ${market.minPrice} ${market.quoteCurrency}`
      );
    }

    if (market.maxPrice > 0 && order.price > market.maxPrice) {
      errors.push(
        `Price ${order.price} exceeds maximum ${market.maxPrice} ${market.quoteCurrency}`
      );
    }

    // Check precision
    const priceStr = order.price.toString();
    const decimalPlaces = priceStr.includes(".")
      ? priceStr.split(".")[1].length
      : 0;

    if (decimalPlaces > market.pricePrecision) {
      warnings.push(
        `Price precision ${decimalPlaces} exceeds market precision ${market.pricePrecision}. Price will be truncated.`
      );
    }

    // Check price deviation from market (optional)
    try {
      const marketPrice = await this.getMarketPrice(order.symbol);
      if (marketPrice > 0) {
        const deviation = Math.abs(order.price - marketPrice) / marketPrice;
        if (deviation > this.maxPriceDeviation) {
          warnings.push(
            `Price deviates ${(deviation * 100).toFixed(2)}% from market price ${marketPrice}. This may result in immediate execution or no fills.`
          );
        }
      }
    } catch (_error) {
      // Ignore market price check errors
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate minimum order cost
   */
  private validateMinimumCost(
    order: OrderInput,
    market: MarketInfo
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const cost = order.amount * order.price;
    const minCost = market.minCost || this.defaultMinCost;

    if (cost < minCost) {
      errors.push(
        `Order value ${cost.toFixed(8)} ${market.quoteCurrency} is below minimum ${minCost} ${market.quoteCurrency}`
      );
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate user has sufficient balance
   */
  private async validateBalance(
    order: OrderInput,
    market: MarketInfo
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.walletManager) {
      return { valid: true, errors, warnings };
    }

    try {
      if (order.side === "BUY") {
        // For buy orders, check quote currency balance
        const cost = order.amount * order.price;
        const fee = cost * market.takerFee;
        const totalRequired = cost + fee;

        const balance = await this.walletManager.checkBalance(
          order.userId,
          market.quoteCurrency,
          totalRequired
        );

        if (!balance.hasBalance) {
          errors.push(
            `Insufficient ${market.quoteCurrency} balance. Required: ${totalRequired.toFixed(8)}, Available: ${balance.available.toFixed(8)}`
          );
        }
      } else {
        // For sell orders, check base currency balance
        const balance = await this.walletManager.checkBalance(
          order.userId,
          market.baseCurrency,
          order.amount
        );

        if (!balance.hasBalance) {
          errors.push(
            `Insufficient ${market.baseCurrency} balance. Required: ${order.amount.toFixed(8)}, Available: ${balance.available.toFixed(8)}`
          );
        }
      }
    } catch (error) {
      logError("spot_order_validator", error, __filename);
      errors.push("Failed to verify balance");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Get market information
   */
  async getMarketInfo(symbol: string): Promise<MarketInfo | null> {
    // Check cache
    const cached = this.marketCache.get(symbol);
    const expiry = this.cacheExpiry.get(symbol);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      const [baseCurrency, quoteCurrency] = symbol.split("/");

      const market = await models.exchangeMarket.findOne({
        where: {
          currency: baseCurrency,
          pair: quoteCurrency,
        },
      });

      if (!market) {
        return null;
      }

      const metadata = market.metadata || {};

      const marketInfo: MarketInfo = {
        id: market.id,
        symbol: `${market.currency}/${market.pair}`,
        baseCurrency: market.currency,
        quoteCurrency: market.pair,
        minAmount: metadata.limits?.amount?.min || this.defaultMinAmount,
        maxAmount: metadata.limits?.amount?.max || 0,
        minPrice: metadata.limits?.price?.min || 0,
        maxPrice: metadata.limits?.price?.max || 0,
        minCost: metadata.limits?.cost?.min || this.defaultMinCost,
        pricePrecision: metadata.precision?.price || 8,
        amountPrecision: metadata.precision?.amount || 8,
        takerFee: metadata.taker || 0.001,
        makerFee: metadata.maker || 0.001,
        status: market.status,
      };

      // Cache the result
      this.marketCache.set(symbol, marketInfo);
      this.cacheExpiry.set(symbol, Date.now() + this.cacheTTL);

      return marketInfo;
    } catch (error) {
      logError("spot_order_validator", error, __filename);
      return null;
    }
  }

  /**
   * Validate market exists and is active
   */
  async validateMarket(symbol: string): Promise<boolean> {
    const market = await this.getMarketInfo(symbol);
    return market?.status ?? false;
  }

  /**
   * Validate minimum order size
   */
  async validateMinimumSize(symbol: string, amount: number): Promise<boolean> {
    const market = await this.getMarketInfo(symbol);
    if (!market) {
      return false;
    }
    return amount >= market.minAmount;
  }

  /**
   * Validate price is within acceptable range
   */
  async validatePriceRange(symbol: string, price: number): Promise<boolean> {
    const market = await this.getMarketInfo(symbol);
    if (!market) {
      return false;
    }

    if (market.minPrice > 0 && price < market.minPrice) {
      return false;
    }
    if (market.maxPrice > 0 && price > market.maxPrice) {
      return false;
    }

    return true;
  }

  /**
   * Get current market price (from recent trades or order book)
   */
  private async getMarketPrice(symbol: string): Promise<number> {
    try {
      // Try to get from recent orders
      const recentOrder = await models.exchangeOrder.findOne({
        where: {
          symbol,
          status: "CLOSED",
        },
        order: [["updatedAt", "DESC"]],
      });

      if (recentOrder?.average) {
        return recentOrder.average;
      }

      if (recentOrder?.price) {
        return recentOrder.price;
      }

      return 0;
    } catch (error) {
      logError("spot_order_validator", error, __filename);
      return 0;
    }
  }

  /**
   * Get all active markets
   */
  async getActiveMarkets(): Promise<MarketInfo[]> {
    try {
      const markets = await models.exchangeMarket.findAll({
        where: { status: true },
      });

      const marketInfos: MarketInfo[] = [];

      for (const market of markets) {
        const symbol = `${market.currency}/${market.pair}`;
        const info = await this.getMarketInfo(symbol);
        if (info) {
          marketInfos.push(info);
        }
      }

      return marketInfos;
    } catch (error) {
      logError("spot_order_validator", error, __filename);
      return [];
    }
  }

  /**
   * Clear market cache
   */
  clearCache(): void {
    this.marketCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Truncate value to specified precision
   */
  truncateToPrecision(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.floor(value * multiplier) / multiplier;
  }

  /**
   * Format order for submission (apply precision)
   */
  async formatOrder(order: OrderInput): Promise<OrderInput> {
    const market = await this.getMarketInfo(order.symbol);
    if (!market) {
      return order;
    }

    return {
      ...order,
      amount: this.truncateToPrecision(order.amount, market.amountPrecision),
      price:
        order.type === "LIMIT"
          ? this.truncateToPrecision(order.price, market.pricePrecision)
          : order.price,
    };
  }
}

export default SpotOrderValidator;
