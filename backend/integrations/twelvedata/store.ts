// backend/integrations/twelvedata/store.ts
import { RedisSingleton } from "../../utils/redis";

const redis = RedisSingleton.getInstance();
const TICKER_KEY = (s: string) => `eco:ticker:${s}`;
const TTL_SEC = 90; // тримаємо ~1.5 хв. (під себе підкрутиш)

export async function putTicker(symbol: string, price: number, ts: number) {
  const payload = JSON.stringify({ symbol, price, ts });
  await redis.set(TICKER_KEY(symbol), payload, "EX", TTL_SEC);
}

export async function mgetTickers(symbols: string[]) {
  const keys = symbols.map(TICKER_KEY);
  return await redis.mget(...keys);
}
