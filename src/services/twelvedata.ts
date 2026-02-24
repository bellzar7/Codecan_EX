// src/services/twelvedata.ts
import $fetch from "@/utils/api";

export type TWDPrice = { symbol: string; price: number; ts: number };

export async function getTwdTickers(symbols: string[]) {
  if (!symbols?.length)
    return { items: [] as TWDPrice[], missing: [] as string[] };

  const qs = symbols.map(encodeURIComponent).join(",");
  const res = await $fetch<{ items: TWDPrice[]; missing: string[] }>({
    url: `/api/exchange/tewlvedata/ticker?symbols=${qs}`,
    method: "GET",
    silent: true,
    errorMessage: "No tickers",
  });

  if (res.error || !res.data) {
    return { items: [] as TWDPrice[], missing: symbols };
  }
  return res.data;
}

export async function twdGetDefaults(): Promise<string[]> {
  const res = await $fetch<{ defaults: string[] }>({
    url: "/api/exchange/tewlvedata/defaults",
    method: "GET",
    silent: true,
  });
  return res.data?.defaults || [];
}

export async function twdGetWatchlist(): Promise<string[]> {
  const res = await $fetch<{ items: string[] }>({
    url: "/api/exchange/tewlvedata/watchlist",
    method: "GET",
    silent: true,
  });
  return res.data?.items || [];
}

export async function twdUpdateWatchlist(
  action: "add" | "remove",
  symbols: string[]
): Promise<string[]> {
  const res = await $fetch<{ items: string[] }>({
    url: "/api/exchange/tewlvedata/watchlist",
    method: "POST",
    body: { action, symbols },
    silent: true,
  });
  return res.data?.items || [];
}

export async function twdGetCandles(
  symbol: string,
  interval = "1m",
  fromMs: number,
  toMs: number
): Promise<{ candles: number[][]; error?: string }> {
  const params = new URLSearchParams({
    symbol,
    interval,
  });

  const res = await $fetch<{
    symbol: string;
    interval: string;
    candles: number[][];
    error?: string;
  }>({
    url: `/api/ext/twd/candles?${params.toString()}`,
    method: "GET",
    silent: true,
  });

  return {
    candles: res.data?.candles || [],
    error: res.data?.error,
  };
}

/** Допоміжний парсер символу у { currency, pair } */
function parseSymbol(sym: string): { currency: string; pair: string } {
  // Forex / Crypto формату BASE/QUOTE
  if (sym.includes("/")) {
    const [base, quote] = sym.split("/");
    return {
      currency: (base || "").trim() || sym,
      pair: (quote || "").trim(),
    };
  }
  // Біржовий суфікс (AAPL:NASDAQ) — беремо тикер як currency
  if (sym.includes(":")) {
    const [ticker] = sym.split(":");
    return {
      currency: (ticker || "").trim() || sym,
      pair: "", // для таблиці не критично
    };
  }
  // Простий тикер (SPX, NDX, DJI, AAPL) — вважай це currency
  return { currency: sym, pair: "" };
}

/**
 * Мапер під MarketsTable/MarketRow.
 * Тут гарантовано віддаємо currency і pair, щоби не падало на .toLowerCase().
 */
export function mapTwdToMarketItems(items: TWDPrice[]) {
  return items.map((it) => {
    const { currency, pair } = parseSymbol(it.symbol);

    return {
      id: it.symbol,
      symbol: it.symbol,

      // важливо для MarketRow (іконка + відображення)
      currency,
      pair,

      price: it.price,
      change: 0,
      baseVolume: 0,
      quoteVolume: 0,
      high: it.price,
      low: it.price,
      percentage: 0,
      precision: { price: 6, amount: 6 },
      icon: null, // MarketRow сам підставляє /img/crypto/${currency}.webp
      isEco: true,
      ts: it.ts,
    };
  });
}

export async function twdGetSummary(symbols: string[]) {
  if (!symbols?.length) return {};
  const qs = symbols.map(encodeURIComponent).join(",");
  const res = await $fetch<{
    items: Record<
      string,
      { change: number; percentage: number; high: number; low: number }
    >;
  }>({
    url: `/api/exchange/tewlvedata/summary?symbols=${qs}`,
    method: "GET",
    silent: true,
  });
  return res.data?.items || {};
}

export type TwdCatalogKind = "forex" | "indices" | "stocks";

export async function twdListCatalog(kind: TwdCatalogKind) {
  const res = await $fetch<{ kind: string; items: string[] }>({
    url: `/api/exchange/tewlvedata/catalog?kind=${encodeURIComponent(kind)}`,
    method: "GET",
    silent: true,
  });
  return res.data?.items || [];
}
