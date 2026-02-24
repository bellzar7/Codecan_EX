/**
 * Transfer Matrix - Centralized Wallet Transfer Rules
 *
 * This file defines the ONLY valid transfer paths between wallet types.
 * All transfer operations MUST follow these rules.
 *
 * Design Principles:
 * - No recursion: Transfers must be direct (A → B only)
 * - No auto-conversion: Currency conversion must be explicit
 * - Strict validation: Invalid paths return error immediately
 * - Atomic operations: All transfers use DB transactions
 *
 * Wallet Type Hierarchy:
 * - FIAT: Fiat currency wallets (USD, EUR, etc.)
 * - SPOT: Cryptocurrency spot trading wallets
 * - ECO: Ecosystem wallets (with blockchain ledger)
 * - FUTURES: Futures trading wallets
 * - FOREX: Foreign exchange trading wallets (EUR/USD, etc.)
 * - STOCK: Stock trading wallets (AAPL, TSLA, etc.)
 * - INDEX: Index trading wallets (SPX, NDX, etc.)
 *
 * Note: TWD_PAPER is deprecated and excluded from transfers
 */

/**
 * Valid wallet types for transfers.
 * TWD_PAPER is intentionally excluded as it's deprecated.
 */
export type TransferableWalletType =
  | "FIAT"
  | "SPOT"
  | "ECO"
  | "FUTURES"
  | "FOREX"
  | "STOCK"
  | "INDEX";

/**
 * Transfer Matrix: Defines all valid wallet-to-wallet transfer paths.
 *
 * Structure:
 * {
 *   FROM_WALLET_TYPE: [ALLOWED_TO_WALLET_TYPES]
 * }
 *
 * Transfer Rules:
 *
 * FIAT (Hub for funding all trading types):
 *   → SPOT: Fund cryptocurrency trading
 *   → ECO: Fund ecosystem wallets
 *   → FOREX: Fund foreign exchange trading
 *   → STOCK: Fund stock trading
 *   → INDEX: Fund index trading
 *
 * SPOT (Bridge between fiat and all trading types):
 *   → FIAT: Withdraw to fiat
 *   → ECO: Move to ecosystem
 *   → FUTURES: Fund futures trading
 *   → FOREX: Fund forex trading
 *   → STOCK: Fund stock trading
 *   → INDEX: Fund index trading
 *
 * ECO (Ecosystem with blockchain ledger):
 *   → FIAT: Withdraw to fiat
 *   → SPOT: Move to spot trading
 *   → FUTURES: Fund futures trading
 *
 * FUTURES (Futures trading):
 *   → SPOT: Withdraw to spot
 *   → ECO: Move to ecosystem
 *
 * FOREX (Foreign exchange trading - isolated):
 *   → FIAT: Withdraw profits to fiat
 *   → SPOT: Withdraw to spot for other trading
 *
 * STOCK (Stock trading - isolated):
 *   → FIAT: Withdraw profits to fiat
 *   → SPOT: Withdraw to spot for other trading
 *
 * INDEX (Index trading - isolated):
 *   → FIAT: Withdraw profits to fiat
 *   → SPOT: Withdraw to spot for other trading
 */
export const TRANSFER_MATRIX: Record<
  TransferableWalletType,
  TransferableWalletType[]
> = {
  FIAT: ["SPOT", "ECO", "FOREX", "STOCK", "INDEX"],
  SPOT: ["FIAT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX"],
  ECO: ["FIAT", "SPOT", "FUTURES"],
  FUTURES: ["SPOT", "ECO"],
  FOREX: ["FIAT", "SPOT"],
  STOCK: ["FIAT", "SPOT"],
  INDEX: ["FIAT", "SPOT"],
};

/**
 * Validates if a transfer path is allowed according to the transfer matrix.
 *
 * @param fromType - Source wallet type
 * @param toType - Destination wallet type
 * @returns true if transfer is allowed, false otherwise
 *
 * @example
 * isValidTransferPath("FIAT", "FOREX") // true
 * isValidTransferPath("FOREX", "ECO") // false
 * isValidTransferPath("SPOT", "STOCK") // true
 */
export function isValidTransferPath(fromType: string, toType: string): boolean {
  // Cannot transfer to same wallet type
  if (fromType === toType) {
    return false;
  }

  // Check if fromType exists in matrix
  if (!TRANSFER_MATRIX[fromType as TransferableWalletType]) {
    return false;
  }

  // Check if toType is in allowed destinations
  return TRANSFER_MATRIX[fromType as TransferableWalletType].includes(
    toType as TransferableWalletType
  );
}

/**
 * Gets all valid destination wallet types for a given source wallet type.
 *
 * @param fromType - Source wallet type
 * @returns Array of allowed destination wallet types, or empty array if invalid
 *
 * @example
 * getValidDestinations("FIAT") // ["SPOT", "ECO", "FOREX", "STOCK", "INDEX"]
 * getValidDestinations("FOREX") // ["FIAT", "SPOT"]
 */
export function getValidDestinations(
  fromType: string
): TransferableWalletType[] {
  return TRANSFER_MATRIX[fromType as TransferableWalletType] || [];
}

/**
 * Gets a human-readable error message for an invalid transfer path.
 *
 * @param fromType - Source wallet type
 * @param toType - Destination wallet type
 * @returns Error message explaining why the transfer is not allowed
 */
export function getTransferErrorMessage(
  fromType: string,
  toType: string
): string {
  if (fromType === toType) {
    return "Cannot transfer to the same wallet type";
  }

  if (!TRANSFER_MATRIX[fromType as TransferableWalletType]) {
    return `Invalid source wallet type: ${fromType}`;
  }

  const validDestinations = TRANSFER_MATRIX[fromType as TransferableWalletType];

  if (validDestinations.length === 0) {
    return `${fromType} wallet cannot transfer to any other wallet type`;
  }

  return (
    `Invalid transfer path: ${fromType} → ${toType}. ` +
    `${fromType} can only transfer to: ${validDestinations.join(", ")}`
  );
}

/**
 * Validates if a wallet type is transferable (not deprecated).
 *
 * @param walletType - Wallet type to check
 * @returns true if wallet type can be used for transfers
 */
export function isTransferableWalletType(walletType: string): boolean {
  // TWD_PAPER is excluded from transfers (deprecated)
  if (walletType === "TWD_PAPER") {
    return false;
  }

  return Object.keys(TRANSFER_MATRIX).includes(walletType);
}
