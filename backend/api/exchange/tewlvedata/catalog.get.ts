import type { Request } from "../../../handler/Request";

export const metadata = { requiresAuth: false, requiresApi: false };

const BASE = process.env.TWD_BASE_URL || "https://api.twelvedata.com";
const KEY = process.env.TWD_API_KEY || "";

async function twdFetch(path: string) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${encodeURIComponent(KEY)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const err: any = new Error(`TWD ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Повертає масив symbol'ів залежно від kind:
 * - forex   -> ["EUR/USD", "USD/JPY", ...]
 * - indices -> ["SPX", "NDX", "DJI", ...]
 * - stocks  -> ["AAPL:NASDAQ", "TSLA:NASDAQ", ...] (біржа з суфіксом, якщо є)
 */
export default async function handler(req: Request) {
  const kind = String(req.query?.kind || "")
    .trim()
    .toLowerCase();
  if (!KEY) {
    const err: any = new Error("TWD_API_KEY is empty");
    err.statusCode = 500;
    throw err;
  }
  if (!["forex", "indices", "stocks"].includes(kind)) {
    const err: any = new Error("kind must be one of: forex|indices|stocks");
    err.statusCode = 400;
    throw err;
  }

  let symbols: string[] = [];

  if (kind === "forex") {
    // https://api.twelvedata.com/forex_pairs
    const data = await twdFetch("/forex_pairs");
    // формат: { data: [{symbol:"EUR/USD", ...}, ...] }
    const list = Array.isArray(data?.data) ? data.data : [];
    symbols = list
      .map((x: any) => x?.symbol)
      .filter((s: any) => typeof s === "string" && s.includes("/"));
  }

  if (kind === "indices") {
    // https://api.twelvedata.com/indices
    const data = await twdFetch("/indices");
    // { data: [{symbol:"SPX", ...}, ...] }
    const list = Array.isArray(data?.data) ? data.data : [];
    symbols = list
      .map((x: any) => x?.symbol)
      .filter((s: any) => typeof s === "string" && s && !s.includes("/"));
  }

  if (kind === "stocks") {
    // https://api.twelvedata.com/stocks
    // Повертає: { data: [{symbol:"AAPL", exchange:"NASDAQ", ...}, ...] }
    // Збираємо у форматі "AAPL:NASDAQ" якщо є біржа.
    const data = await twdFetch("/stocks");
    const list = Array.isArray(data?.data) ? data.data : [];
    symbols = list
      .map((x: any) => {
        const sym = (x?.symbol || "").trim();
        const ex = (x?.exchange || "").trim();
        if (!sym) {
          return null;
        }
        return ex ? `${sym}:${ex}` : sym;
      })
      .filter((s: any) => typeof s === "string" && s && !s.includes("/"));
  }

  // Приберемо дублікати і відсортуємо
  const uniq = Array.from(new Set(symbols)).sort((a, b) => a.localeCompare(b));
  return { kind, items: uniq };
}
