// backend/api/exchange/tewlvedata/summary.get.ts
import type { Request } from "../../../handler/Request";
import { getHistoricalCandles } from "../../../utils/eco/scylla/queries";

// returns per-symbol: { change, percentage, high, low }
export const metadata = { requiresAuth: false, requiresApi: false };

export default async function handler(req: Request) {
  const raw = (req.query?.symbols as string) || "";
  const symbols = raw
    .split(",")
    .map((s) => decodeURIComponent(s).trim())
    .filter(Boolean);
  if (!symbols.length) {
    const err: any = new Error("symbols required");
    err.statusCode = 400;
    throw err;
  }

  const to = Date.now();
  const from = to - 24 * 60 * 60 * 1000;

  const out: Record<
    string,
    {
      change: number;
      percentage: number;
      high: number;
      low: number;
    }
  > = {};

  for (const s of symbols) {
    // rows: [ [ts, o, h, l, c, v], ... ] у вашій реалізації
    const rows = await getHistoricalCandles(s, "1m", from, to);
    if (!rows?.length) {
      continue;
    }

    const firstClose = Number(rows[0][4]);
    const lastClose = Number(rows.at(-1)![4]);
    if (
      !(Number.isFinite(firstClose) && Number.isFinite(lastClose)) ||
      firstClose === 0
    ) {
      continue;
    }

    let dayHigh = Number.MIN_SAFE_INTEGER;
    let dayLow = Number.MAX_SAFE_INTEGER;
    for (const r of rows) {
      const h = Number(r[2]);
      const l = Number(r[3]);
      if (Number.isFinite(h) && h > dayHigh) {
        dayHigh = h;
      }
      if (Number.isFinite(l) && l < dayLow) {
        dayLow = l;
      }
    }

    const change = lastClose - firstClose;
    const percentage = (change / firstClose) * 100;

    out[s] = {
      change,
      percentage,
      high: Number.isFinite(dayHigh) ? dayHigh : lastClose,
      low: Number.isFinite(dayLow) ? dayLow : lastClose,
    };
  }

  return { items: out };
}
