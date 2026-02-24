import { models } from "@b/db";

/**
 * TWD Wallet Type Mapping:
 * - FOREX markets (EUR/USD, GBP/JPY, etc.) → FOREX wallets
 * - STOCK markets (AAPL, TSLA, AMD, etc.) → STOCK wallets
 * - INDEX markets (SPX, NDX, etc.) → INDEX wallets
 *
 * All TWD wallets (FOREX, STOCK, INDEX) are funded via internal transfer from FIAT or SPOT.
 * No auto-seeding - admin must manually credit balances or user must transfer.
 */

/**
 * Map twdMarket.type to wallet type.
 * This ensures clean separation between asset classes.
 */
export function getTwdWalletType(
  marketType: "forex" | "stocks" | "indices"
): "FOREX" | "STOCK" | "INDEX" {
  switch (marketType) {
    case "forex":
      return "FOREX";
    case "stocks":
      return "STOCK";
    case "indices":
      return "INDEX";
    default:
      throw new Error(`Unknown TWD market type: ${marketType}`);
  }
}

/**
 * Get or create a SPOT wallet for a user and currency.
 * This mirrors Binance SPOT wallet behavior.
 * Wallet is created with 0 balance - admin must credit manually.
 */
export async function getOrCreateSpotWallet(userId: string, currency: string) {
  let wallet = await models.wallet.findOne({
    where: {
      userId,
      type: "SPOT",
      currency: currency.toUpperCase(),
    },
  });

  if (!wallet) {
    // Create wallet with 0 balance - no auto-seeding
    wallet = await models.wallet.create({
      userId,
      type: "SPOT",
      currency: currency.toUpperCase(),
      balance: 0,
      inOrder: 0,
    });
  }

  return wallet;
}

/**
 * Get or create a wallet for TWD trading based on market type.
 * For FOREX markets, creates FOREX wallets.
 * For STOCK/INDEX markets, creates SPOT wallets (backward compatible, will migrate later).
 */
export async function getOrCreateTwdWallet(
  userId: string,
  currency: string,
  marketType: "forex" | "stocks" | "indices"
) {
  const walletType = getTwdWalletType(marketType);

  let wallet = await models.wallet.findOne({
    where: {
      userId,
      type: walletType,
      currency: currency.toUpperCase(),
    },
  });

  if (!wallet) {
    // Create wallet with 0 balance - admin must credit or user must transfer
    wallet = await models.wallet.create({
      userId,
      type: walletType,
      currency: currency.toUpperCase(),
      balance: 0,
      inOrder: 0,
    });
  }

  return wallet;
}

/**
 * Get both base and quote wallets for a TWD trading pair.
 * Uses correct wallet type based on market type (FOREX for forex, SPOT for stocks/indices).
 * Example: EUR/USD with marketType='forex' returns FOREX/EUR and FOREX/USD wallets.
 */
export async function getTwdWalletPair(
  userId: string,
  symbol: string,
  marketType: "forex" | "stocks" | "indices"
) {
  const [baseCurrency, quoteCurrency] = symbol.split("/");

  if (!(baseCurrency && quoteCurrency)) {
    throw new Error(
      `Invalid symbol format: ${symbol}. Expected format: BASE/QUOTE`
    );
  }

  const baseWallet = await getOrCreateTwdWallet(
    userId,
    baseCurrency,
    marketType
  );
  const quoteWallet = await getOrCreateTwdWallet(
    userId,
    quoteCurrency,
    marketType
  );

  return { baseWallet, quoteWallet, baseCurrency, quoteCurrency };
}

/**
 * Update wallet balance with transaction lock.
 * Same as Binance SPOT wallet update logic.
 */
export async function updateWalletBalance(
  walletId: string,
  newBalance: number,
  transaction?: any
) {
  const wallet = await models.wallet.findByPk(walletId, {
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (newBalance < 0) {
    throw new Error("Invalid operation: balance cannot go below zero");
  }

  await wallet.update(
    { balance: newBalance },
    transaction ? { transaction } : {}
  );

  return wallet.get({ plain: true });
}

// /**
//  * Legacy function for backward compatibility.
//  * @deprecated Use getOrCreateSpotWallet instead
//  */
// export async function getOrCreateTwdWallet(userId: string) {
//   // For backward compatibility, return USD wallet
//   return getOrCreateSpotWallet(userId, "USD");
// }
//
// /**
//  * Legacy function for backward compatibility.
//  * @deprecated Use updateWalletBalance instead
//  */
// export async function updateTwdWalletBalance(
//   walletId: string,
//   newBalance: number,
//   transaction?: any
// ) {
//   return updateWalletBalance(walletId, newBalance, transaction);
// }

/**
 * Fetch current price from TwelveData API
 */
export async function fetchTwdPrice(symbol: string): Promise<number> {
  const apiKey = process.env.TWD_API_KEY;
  const baseUrl = process.env.TWD_BASE_URL || "https://api.twelvedata.com";

  if (!apiKey) {
    throw new Error("TWD_API_KEY is not configured");
  }

  try {
    const response = await fetch(
      `${baseUrl}/price?symbol=${symbol}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }

    const data = await response.json();

    if (!data.price) {
      throw new Error(`No price data available for ${symbol}`);
    }

    return Number.parseFloat(data.price);
  } catch (error) {
    throw new Error(
      `Unable to fetch current price for ${symbol}: ${error.message}`
    );
  }
}
