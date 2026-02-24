// backend/api/exchange/tewlvedata/candles.get.ts
import type { Request } from "../../../handler/Request";
import { getHistoricalCandles } from "../../../utils/eco/scylla/queries";

export const metadata = {
  requiresAuth: false,
  requiresApi: false,
};

const TWD_API_KEY = process.env.TWD_API_KEY!;
const TWD_TS_URL = "https://api.twelvedata.com/time_series";
const TWD_DISABLE_REST = process.env.TWD_DISABLE_REST === "true";

export default async function handler(req: Request) {
  const symbol = String(req.query?.symbol || "").trim();
  const interval = String(req.query?.interval || "1m").trim();
  const from = Number(req.query?.from || 0);
  const to = Number(req.query?.to || Date.now());
  if (!symbol) {
    const e: any = new Error("symbol required");
    e.statusCode = 400;
    throw e;
  }
  if (!(from && to && Number.isFinite(from) && Number.isFinite(to))) {
    const e: any = new Error("from/to required (ms)");
    e.statusCode = 400;
    throw e;
  }

  let rows = await getHistoricalCandles(symbol, interval, from, to);

  // Fallback to REST only if enabled (saves API credits in dev)
  if (!rows?.length && TWD_API_KEY && !TWD_DISABLE_REST) {
    const url = `${TWD_TS_URL}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=500&apikey=${encodeURIComponent(TWD_API_KEY)}`;
    try {
      const r = await fetch(url);
      if (r.ok) {
        const json: any = await r.json();
        const values = Array.isArray(json?.values) ? json.values : [];
        // TwelveData віддає newest-first — розвернемо
        rows = values
          .map((v: any) => [
            Date.parse(v.datetime),
            Number(v.open),
            Number(v.high),
            Number(v.low),
            Number(v.close),
            null,
          ])
          .filter((x: any[]) => x.every((n) => n != null && Number.isFinite(n)))
          .reverse();
      }
    } catch {}
  }

  return { symbol, interval, candles: rows || [] };
}
