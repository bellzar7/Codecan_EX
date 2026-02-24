import { useRouter } from "next/router";
import { memo, useEffect } from "react";
import { Chart } from "@/components/pages/trade/chart";
import { Markets } from "@/components/pages/trade/markets";
import { Order } from "@/components/pages/trade/order";
import { Orderbook } from "@/components/pages/trade/orderbook/Orderbook";
import { Orders } from "@/components/pages/trade/orders";
import { Ticker } from "@/components/pages/trade/ticker";
import { Trades } from "@/components/pages/trade/trades";
import Layout from "@/layouts/Nav";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";

// Quote currencies that indicate a crypto trading pair (stablecoins and major cryptos)
// If a symbol has one of these as the quote currency, it's likely a crypto pair
const CRYPTO_QUOTE_CURRENCIES = new Set([
  "USDT",
  "USDC",
  "BUSD",
  "BTC",
  "ETH",
  "BNB",
  "TUSD",
  "DAI",
  "FDUSD",
]);

// TwelveData-specific symbols that should NOT be treated as crypto
// These are forex pairs or indices that might look like crypto
const TWD_SPECIFIC_QUOTES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "NZD",
]);

// Regex for validating crypto base currency format (moved to top level for performance)
const CRYPTO_BASE_REGEX = /^[A-Z0-9]{2,10}$/i;

/**
 * Check if a symbol looks like a crypto pair (e.g., BTC/USDT, ETH/BTC)
 * Crypto pairs should use Binance/CCXT, not TwelveData
 *
 * Logic:
 * - If quote currency is a crypto stablecoin (USDT, USDC, BUSD, etc.) -> crypto pair
 * - If quote currency is BTC, ETH, BNB -> crypto pair
 * - If quote currency is fiat (USD, EUR, etc.) -> could be forex, let TwelveData handle it
 */
const isCryptoPair = (symbol: string): boolean => {
  const parts = symbol.split("/");
  if (parts.length !== 2) {
    return false;
  }

  const [base, quote] = parts;
  const upperQuote = quote.toUpperCase();
  const upperBase = base.toUpperCase();

  // If quote is a TwelveData-specific currency (fiat), it's NOT a crypto pair
  // These should go to TwelveData for forex data
  if (TWD_SPECIFIC_QUOTES.has(upperQuote)) {
    return false;
  }

  // If quote is a crypto stablecoin or major crypto, and base looks like a crypto ticker
  const isCryptoQuote = CRYPTO_QUOTE_CURRENCIES.has(upperQuote);
  const isValidCryptoBase = CRYPTO_BASE_REGEX.test(upperBase);

  return isCryptoQuote && isValidCryptoBase;
};

const TradePage = () => {
  const {
    market,
    setWithEco,
    setExternalTwdMarket,
    setExternalCryptoMarket,
    marketData,
    setMarket,
  } = useMarketStore();
  const { hasExtension, extensions } = useDashboardStore();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && extensions) {
      setWithEco(hasExtension("ecosystem"));
    }
  }, [router.isReady, extensions, hasExtension, setWithEco]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const raw = String(router.query.symbol || "");
    if (!raw) {
      return;
    }

    const sym = raw.includes("_") ? raw.replace("_", "/") : raw;

    // If symbol exists in internal markets, use it directly
    const existsInternal = marketData?.some((m: unknown) => {
      const marketItem = m as { symbol?: string };
      return marketItem.symbol === sym;
    });
    if (existsInternal) {
      setMarket(sym);
      return;
    }

    // Check if it's a crypto pair - use Binance/CCXT, NOT TwelveData
    if (isCryptoPair(sym)) {
      setExternalCryptoMarket(sym);
      return;
    }

    // Otherwise, it's an external TwelveData market (forex, stocks, indices)
    setExternalTwdMarket(sym);
  }, [
    router.isReady,
    router.query.symbol,
    marketData,
    setMarket,
    setExternalTwdMarket,
    setExternalCryptoMarket,
  ]);

  return (
    <Layout
      color="muted"
      darker
      horizontal
      title={market?.symbol || "Connecting..."}
    >
      <div className="relative mt-1 mb-5 grid grid-cols-1 gap-1 md:grid-cols-12">
        <div className="col-span-1 grid grid-cols-1 gap-1 md:col-span-12 md:grid-cols-9 lg:col-span-9">
          <div className="order-1 col-span-1 min-h-[8vh] border-thin bg-white md:col-span-9 dark:bg-muted-900">
            <Ticker />
          </div>
          <div className="order-3 col-span-1 min-h-[50vh] border-thin bg-white md:order-2 md:col-span-3 md:min-h-[100vh] dark:bg-muted-900">
            <Orderbook />
          </div>
          <div className="order-2 col-span-1 flex h-full w-full flex-col gap-1 md:order-3 md:col-span-6">
            <div className="h-full min-h-[60vh] border-thin bg-white dark:bg-muted-900">
              <Chart />
            </div>
            <div className="h-full min-h-[40vh] border-thin bg-white dark:bg-muted-900">
              <Order />
            </div>
          </div>
        </div>
        <div className="order-4 col-span-1 flex flex-col gap-1 sm:flex-row md:col-span-12 lg:col-span-3 lg:flex-col">
          <div className="h-full min-h-[55vh] w-full border-thin bg-white dark:bg-muted-900">
            <Markets />
          </div>
          <div className="h-full min-h-[45vh] w-full min-w-[220px] border-thin bg-white dark:bg-muted-900">
            <Trades />
          </div>
        </div>
        <div className="order-5 col-span-1 min-h-[40vh] border-thin bg-white md:col-span-12 dark:bg-muted-900">
          <Orders />
        </div>
      </div>
    </Layout>
  );
};

export default memo(TradePage);
