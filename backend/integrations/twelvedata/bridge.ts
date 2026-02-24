// backend/integrations/twelvedata/bridge.ts

import { models } from "@b/db";
import { upsertCandles } from "@b/utils/eco/scylla/writers/candles";
import { RedisSingleton } from "@b/utils/redis";
import WebSocket from "ws";

interface CandleState {
  o: number;
  h: number;
  l: number;
  c: number;
  tOpen: number;
  tClose: number;
}

const minute: Map<string, CandleState> = new Map();
const redis = RedisSingleton.getInstance();

const ECO_WS_URL = process.env.ECO_WS_URL || "ws://127.0.0.1:4002";

let started = false;
let ws: WebSocket | null = null;

const WL_KEY = "eco:twd:watchlist";

async function getWatchlist(): Promise<string[]> {
  try {
    const items = await redis.smembers(WL_KEY);
    return (items || []).map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Load enabled TWD markets from database
 */
async function getEnabledTwdMarkets(): Promise<string[]> {
  try {
    const markets = await models.twdMarket.findAll({
      where: { status: true },
      attributes: ["symbol"],
    });
    return markets.map((m) => m.symbol).filter(Boolean);
  } catch (error) {
    console.error("[eco-bridge] Failed to load TWD markets:", error.message);
    return [];
  }
}

// останній "комплект" символів, на які ми підписались у eco-ws
let lastSubscribed: string[] = [];

async function resubscribeAll() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }

  const wl = await getWatchlist();
  const enabledMarkets = await getEnabledTwdMarkets();
  const all = Array.from(new Set([...enabledMarkets, ...wl]));

  if (all.length === 0) {
    console.log(
      "[eco-bridge] No enabled TWD markets found, skipping subscription"
    );
    return;
  }

  // якщо склад не змінився — нічого не робимо
  if (
    all.length === lastSubscribed.length &&
    all.every((s, i) => s === lastSubscribed[i])
  ) {
    return;
  }

  // надсилаємо SUBSCRIBE на повний список (TwelveData нормально живе з дублями)
  const msg = { type: "subscribe", symbols: all };
  console.log("[eco-bridge] > subscribe", all.join(","));
  ws.send(JSON.stringify(msg));

  lastSubscribed = all;
}

/** оновлюємо хвилинну свічку по тіку */
function ingestTick(symbol: string, price: number, ts: number) {
  const start = Math.floor(ts / 60_000) * 60_000;
  const end = start + 60_000 - 1;
  const cur = minute.get(symbol);

  if (!cur || cur.tOpen !== start) {
    // закриваємо попередню хвилину у Scylla
    if (cur) {
      upsertCandles([
        {
          symbol,
          interval: "1m",
          createdAt: new Date(cur.tOpen),
          open: cur.o,
          high: cur.h,
          low: cur.l,
          close: cur.c,
          volume: null,
        },
      ]).catch((e) => console.error("[eco-bridge][scylla] upsert err", e));
    }
    minute.set(symbol, {
      o: price,
      h: price,
      l: price,
      c: price,
      tOpen: start,
      tClose: end,
    });
  } else {
    cur.c = price;
    if (price > cur.h) {
      cur.h = price;
    }
    if (price < cur.l) {
      cur.l = price;
    }
  }
}

async function setRedisSnapshot(symbol: string, price: number, ts: number) {
  const key = `eco:ticker:${symbol}`;
  const data = JSON.stringify({ symbol, price, ts });
  // TTL 60s
  await redis.set(key, data, "EX", 90);
}

function connect() {
  ws = new WebSocket(ECO_WS_URL);

  ws.on("open", async () => {
    console.log("[eco-bridge] connected to", ECO_WS_URL);
    await resubscribeAll();
  });

  ws.on("close", (code) => {
    console.log("[eco-bridge] closed", code, "— reconnecting in 2s");
    ws = null;
    if (started) {
      setTimeout(connect, 2000);
    }
  });

  ws.on("error", (e) => {
    console.log("[eco-bridge] error", (e as any)?.message || e);
  });

  ws.on("message", async (buf: WebSocket.RawData) => {
    try {
      const text = typeof buf === "string" ? buf : (buf?.toString?.() ?? "");
      if (!text) {
        return;
      }
      const msg = JSON.parse(text);

      // одиночний тік
      if (msg?.t === "price" && msg?.s && msg?.p) {
        const symbol = String(msg.s);
        const price = Number(msg.p);
        const ts = Number(msg.ts) || Date.now();
        if (!Number.isFinite(price)) {
          return;
        }
        ingestTick(symbol, price, ts);
        await setRedisSnapshot(symbol, price, ts);
      }

      // снапшот тiкiв
      if (msg?.t === "snapshot" && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          if (it?.t === "price" && it?.s && it?.p) {
            const symbol = String(it.s);
            const price = Number(it.p);
            const ts = Number(it.ts) || Date.now();
            if (!Number.isFinite(price)) {
              continue;
            }
            ingestTick(symbol, price, ts);
            await setRedisSnapshot(symbol, price, ts);
          }
        }
      }
    } catch {
      // ignore
    }
  });
}

/** Публічний стартер — викликається з server.ts */
export function startEcoBridge() {
  if (started) {
    console.log("[eco-bridge] already started");
    return;
  }
  started = true;
  connect();

  setInterval(() => {
    resubscribeAll().catch(() => {});
  }, 60_000);
}

/** Не обов'язково, але хай буде для акуратного стопа */
export function stopEcoBridge() {
  started = false;
  try {
    ws?.close();
  } catch {}
  ws = null;
}
