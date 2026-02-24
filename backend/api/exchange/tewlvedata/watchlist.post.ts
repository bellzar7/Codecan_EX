// backend/api/exchange/tewlvedata/watchlist.post.ts
import type { Request } from "../../../handler/Request";
import { RedisSingleton } from "../../../utils/redis";

export const metadata = { requiresAuth: false, requiresApi: false };
const redis = RedisSingleton.getInstance();
const KEY = "eco:twd:watchlist";

export default async function handler(req: Request) {
  const { action, symbols } = req.body || {};
  const list: string[] = Array.isArray(symbols) ? symbols : [];

  if (!(action && list.length)) {
    throw new Error("action & symbols required");
  }

  if (action === "add") {
    await redis.sadd(KEY, ...list);
  } else if (action === "remove") {
    await redis.srem(KEY, ...list);
  } else {
    throw new Error("unknown action");
  }

  const items = await redis.smembers(KEY);
  return { items };
}
