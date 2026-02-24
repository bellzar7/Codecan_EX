/**
 * SPOT Trading Utilities
 *
 * Internal matching engine and supporting utilities for SPOT trading.
 * All trades happen internally - NO external API calls.
 *
 * Components:
 * - SpotMatchingEngine: Core order matching with price-time priority
 * - SpotWalletManager: Wallet operations (lock, release, transfer)
 * - SpotOrderValidator: Order validation before processing
 * - LiquidityPoolManager: Admin liquidity pool management
 *
 * Usage:
 * ```typescript
 * import {
 *   SpotMatchingEngine,
 *   SpotWalletManager,
 *   SpotOrderValidator,
 *   LiquidityPoolManager,
 *   initializeSpotEngine
 * } from '@b/utils/spot';
 *
 * // Initialize the engine (call once at startup)
 * await initializeSpotEngine();
 *
 * // Get instances
 * const engine = SpotMatchingEngine.getInstance();
 * const walletManager = SpotWalletManager.getInstance();
 * const validator = SpotOrderValidator.getInstance();
 * const poolManager = LiquidityPoolManager.getInstance();
 *
 * // Process an order
 * const result = await engine.processOrder({
 *   userId: 'user-uuid',
 *   symbol: 'BTC/USDT',
 *   type: 'LIMIT',
 *   side: 'BUY',
 *   price: 50000,
 *   amount: 0.1
 * });
 * ```
 */

// ============================================================================
// Exports
// ============================================================================

/* biome-ignore-all lint/performance/noBarrelFile: Intentional barrel file for clean SPOT module API surface */

export type {
  CreatePoolInput,
  LiquidityPoolInfo,
  PoolPriceConfig,
  PoolStats,
  PoolTradeResult,
  PriceInfo,
  PriceProviderConfig,
  UpdatePoolInput,
} from "./liquidityPoolManager";
export { LiquidityPoolManager } from "./liquidityPoolManager";
export type {
  MatchResult,
  Order,
  OrderBook,
  OrderInput,
  OrderSide,
  OrderStatus,
  OrderType,
  TimeInForce,
  Trade,
} from "./matchingEngine";
export { SpotMatchingEngine } from "./matchingEngine";
export type {
  MarketInfo,
  OrderInput as ValidatorOrderInput,
  PriceValidationOptions,
  ValidationResult,
} from "./orderValidator";
export { SpotOrderValidator } from "./orderValidator";
export type {
  BalanceCheckResult,
  WalletInfo,
} from "./walletManager";
export { SpotWalletManager } from "./walletManager";

// ============================================================================
// Initialization Helper
// ============================================================================

import { LiquidityPoolManager } from "./liquidityPoolManager";
import { SpotMatchingEngine } from "./matchingEngine";
import { SpotOrderValidator } from "./orderValidator";
import { SpotWalletManager } from "./walletManager";

let initialized = false;

/**
 * Initialize the SPOT trading engine
 *
 * This should be called once at application startup.
 * It initializes all components and loads open orders into memory.
 */
export async function initializeSpotEngine(): Promise<void> {
  if (initialized) {
    console.log("SPOT engine already initialized");
    return;
  }

  console.log("Initializing SPOT trading engine...");

  try {
    // Get singleton instances
    const walletManager = SpotWalletManager.getInstance();
    const orderValidator = SpotOrderValidator.getInstance();
    const matchingEngine = SpotMatchingEngine.getInstance();
    const liquidityPoolManager = LiquidityPoolManager.getInstance();

    // Initialize validator with wallet manager
    orderValidator.initialize(walletManager);

    // Initialize liquidity pool manager
    await liquidityPoolManager.initialize();
    console.log("Liquidity pool manager initialized");

    // Initialize matching engine with dependencies (including pool manager)
    await matchingEngine.initialize(
      walletManager,
      orderValidator,
      liquidityPoolManager
    );

    initialized = true;
    console.log("SPOT trading engine initialized successfully");
  } catch (error) {
    console.error("Failed to initialize SPOT trading engine:", error);
    throw error;
  }
}

/**
 * Check if the SPOT engine is initialized
 */
export function isSpotEngineInitialized(): boolean {
  return initialized;
}

/**
 * Get all SPOT engine instances
 *
 * Convenience function to get all instances at once.
 * Throws if engine is not initialized.
 */
export function getSpotEngineInstances(): {
  matchingEngine: SpotMatchingEngine;
  walletManager: SpotWalletManager;
  orderValidator: SpotOrderValidator;
  liquidityPoolManager: LiquidityPoolManager;
} {
  if (!initialized) {
    throw new Error(
      "SPOT engine not initialized. Call initializeSpotEngine() first."
    );
  }

  return {
    matchingEngine: SpotMatchingEngine.getInstance(),
    walletManager: SpotWalletManager.getInstance(),
    orderValidator: SpotOrderValidator.getInstance(),
    liquidityPoolManager: LiquidityPoolManager.getInstance(),
  };
}

/**
 * Get liquidity pool manager instance
 */
export function getLiquidityPoolManager(): LiquidityPoolManager {
  if (!initialized) {
    throw new Error(
      "SPOT engine not initialized. Call initializeSpotEngine() first."
    );
  }
  return LiquidityPoolManager.getInstance();
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Place a new order
 *
 * Convenience function that validates and processes an order.
 */
export async function placeOrder(input: {
  userId: string;
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  timeInForce?: "GTC" | "IOC" | "FOK" | "PO";
}): Promise<MatchResult> {
  const { matchingEngine } = getSpotEngineInstances();
  return await matchingEngine.processOrder(input);
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  userId: string
): Promise<boolean> {
  const { matchingEngine } = getSpotEngineInstances();
  return await matchingEngine.cancelOrder(orderId, userId);
}

/**
 * Get order book for a symbol
 */
export function getOrderBook(symbol: string): {
  bids: Array<{ price: number; amount: number; count: number }>;
  asks: Array<{ price: number; amount: number; count: number }>;
} {
  const { matchingEngine } = getSpotEngineInstances();
  return matchingEngine.getOrderBook(symbol);
}

/**
 * Get user's open orders
 */
export async function getUserOpenOrders(
  userId: string,
  symbol?: string
): Promise<Order[]> {
  const { matchingEngine } = getSpotEngineInstances();
  return await matchingEngine.getUserOpenOrders(userId, symbol);
}

/**
 * Get user's wallet balances
 */
export async function getUserBalances(userId: string): Promise<WalletInfo[]> {
  const { walletManager } = getSpotEngineInstances();
  return await walletManager.getUserBalances(userId);
}

/**
 * Get active markets
 */
export async function getActiveMarkets(): Promise<MarketInfo[]> {
  const { orderValidator } = getSpotEngineInstances();
  return await orderValidator.getActiveMarkets();
}

/**
 * Validate an order without placing it
 */
export async function validateOrder(input: {
  userId: string;
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  timeInForce?: "GTC" | "IOC" | "FOK" | "PO";
}): Promise<ValidationResult> {
  const { orderValidator } = getSpotEngineInstances();
  return await orderValidator.validateOrder(input);
}

// Re-export types for convenience
import type { MatchResult, Order } from "./matchingEngine";
import type { MarketInfo, ValidationResult } from "./orderValidator";
import type { WalletInfo } from "./walletManager";
