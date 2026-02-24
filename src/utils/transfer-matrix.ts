/**
 * Frontend Transfer Matrix - Matches Backend Transfer Rules
 *
 * This file mirrors the backend transfer matrix defined in:
 * backend/api/finance/transfer/matrix.ts
 *
 * IMPORTANT: Any changes to this matrix MUST be synchronized with the backend.
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
 * Wallet type metadata for UI display.
 */
export interface WalletTypeMetadata {
  value: TransferableWalletType;
  label: string;
  color: string;
  description: string;
  allowDeposit: boolean;
  allowWithdraw: boolean;
  category: "main" | "trading";
}

/**
 * Complete wallet type metadata for UI rendering.
 */
/**
 * Wallet Type Metadata for UI Display
 *
 * Colors (Tag component supports: default, contrast, muted, primary, info, success, warning, danger):
 * - FIAT: warning (yellow/gold) - main wallet for fiat currencies
 * - SPOT: info (blue) - main wallet for cryptocurrencies
 * - ECO/Funding: primary (purple/primary color) - ecosystem wallet
 * - FUTURES: muted (gray) - futures trading
 * - FOREX: success (green) - foreign exchange trading
 * - STOCK: danger (red) - stock trading
 * - INDEX: default (gray, different shade than FUTURES) - index trading
 *
 * Note: Tag pastel variant only has 5 truly distinct colors (primary, info, success, warning, danger).
 * Default/contrast/muted are similar grays but with slight variations.
 * FUTURES and INDEX both use gray tones but are distinguishable.
 */
export const WALLET_TYPE_METADATA: Record<
  TransferableWalletType,
  WalletTypeMetadata
> = {
  FIAT: {
    value: "FIAT",
    label: "Fiat",
    color: "warning", // Yellow/gold badge
    description: "Fiat currency wallets (USD, EUR, etc.)",
    allowDeposit: true,
    allowWithdraw: true,
    category: "main",
  },
  SPOT: {
    value: "SPOT",
    label: "Spot",
    color: "info", // Blue badge
    description: "Cryptocurrency spot trading wallets",
    allowDeposit: true,
    allowWithdraw: true,
    category: "main",
  },
  ECO: {
    value: "ECO",
    label: "Funding",
    color: "primary", // Purple/primary badge
    description: "Ecosystem wallets (transfer-only, fund via FIAT or SPOT)",
    allowDeposit: false,
    allowWithdraw: true,
    category: "main",
  },
  FUTURES: {
    value: "FUTURES",
    label: "Futures",
    color: "muted", // Gray badge
    description: "Futures trading wallets (internal only)",
    allowDeposit: false,
    allowWithdraw: false,
    category: "main",
  },
  FOREX: {
    value: "FOREX",
    label: "Forex",
    color: "success", // Green badge (distinct from STOCK and INDEX)
    description:
      "Foreign exchange trading (EUR/USD, etc.). Fund via transfer from FIAT or SPOT.",
    allowDeposit: false,
    allowWithdraw: false,
    category: "trading",
  },
  STOCK: {
    value: "STOCK",
    label: "Stock",
    color: "danger", // Red badge (distinct from FOREX and INDEX)
    description:
      "Stock trading (AAPL, TSLA, etc.). Fund via transfer from FIAT or SPOT.",
    allowDeposit: false,
    allowWithdraw: false,
    category: "trading",
  },
  INDEX: {
    value: "INDEX",
    label: "Index",
    color: "default", // Gray badge (different from FOREX's green)
    description:
      "Index trading (SPX, NASDAQ, etc.). Fund via transfer from FIAT or SPOT.",
    allowDeposit: false,
    allowWithdraw: false,
    category: "trading",
  },
};

/**
 * Get all transferable wallet types (excludes TWD_PAPER).
 */
export function getAllTransferableWalletTypes(): TransferableWalletType[] {
  return Object.keys(TRANSFER_MATRIX) as TransferableWalletType[];
}

/**
 * Check if a wallet type allows direct deposit/withdraw.
 */
export function allowsDirectDepositWithdraw(
  walletType: TransferableWalletType
): boolean {
  return (
    WALLET_TYPE_METADATA[walletType]?.allowDeposit &&
    WALLET_TYPE_METADATA[walletType]?.allowWithdraw
  );
}

/**
 * Get wallet types grouped by category.
 */
export function getWalletTypesByCategory() {
  const main: WalletTypeMetadata[] = [];
  const trading: WalletTypeMetadata[] = [];

  for (const metadata of Object.values(WALLET_TYPE_METADATA)) {
    if (metadata.category === "main") {
      main.push(metadata);
    } else {
      trading.push(metadata);
    }
  }

  return { main, trading };
}
