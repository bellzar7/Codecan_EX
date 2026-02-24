// api/exchange/tewlvedata/ticker.get.ts

import type { Request } from "../../../handler/Request";
import { RedisSingleton } from "../../../utils/redis";

export const metadata = {
  requiresAuth: false,
  requiresApi: false,
};

const redis = RedisSingleton.getInstance();

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

  // якщо хочеш — нормалізуй тут символи (AAPL -> AAPL:NASDAQ тощо)
  const normalized = symbols;

  // Try TWD ticker keys first (new format), fallback to eco ticker keys (old format)
  const twdKeys = normalized.map((s) => `twd:ticker:${s}`);
  const ecoKeys = normalized.map((s) => `eco:ticker:${s}`);

  const twdValues = await redis.mget(...twdKeys);
  const ecoValues = await redis.mget(...ecoKeys);

  // Merge results, preferring TWD keys
  const values = twdValues.map((v, i) => v || ecoValues[i]);

  const items: Array<{ symbol: string; price: number; ts: number }> = [];
  const missing: string[] = [];

  values.forEach((v, i) => {
    if (!v) {
      missing.push(normalized[i]);
      return;
    }
    try {
      const parsed = JSON.parse(v);
      if (
        parsed &&
        typeof parsed.symbol === "string" &&
        typeof parsed.price === "number"
      ) {
        items.push(parsed);
      } else {
        missing.push(normalized[i]);
      }
    } catch {
      missing.push(normalized[i]);
    }
  });

  if (!items.length) {
    const err: any = new Error("No tickers found in cache");
    err.statusCode = 404;
    err.details = { missing };
    throw err;
  }

  return { items, missing };
}
