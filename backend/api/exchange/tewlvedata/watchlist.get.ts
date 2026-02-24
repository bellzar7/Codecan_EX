// backend/api/exchange/tewlvedata/watchlist.get.ts
import type { Request } from "../../../handler/Request";
import { RedisSingleton } from "../../../utils/redis";

export const metadata = { requiresAuth: false, requiresApi: false };
const redis = RedisSingleton.getInstance();
const KEY = "eco:twd:watchlist";

export default async function handler(_req: Request) {
  const list = await redis.smembers(KEY);
  return { items: list || [] };
}
