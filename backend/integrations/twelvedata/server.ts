// backend/integrations/twelvedata/server.ts
import "../../../module-alias-setup";
import WebSocket from "ws";
import { models } from "../../db";
import { RedisSingleton } from "../../utils/redis";
import { TwelveDataProvider } from "./provider";

const redis = RedisSingleton.getInstance();
const WL_KEY = "eco:twd:watchlist";

async function getWatchlist(): Promise<string[]> {
  try {
    const items = await redis.smembers(WL_KEY);
    return (items || []).map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// Fetch enabled TWD markets from database
async function getEnabledTwdSymbols(): Promise<string[]> {
  try {
    const markets = await models.twdMarket.findAll({
      where: { status: true },
      attributes: ["symbol", "type", "name"],
    });
    console.log(
      `[eco-ws] Found ${markets.length} enabled TWD markets in database`
    );

    if (markets.length > 0) {
      console.log(
        "[eco-ws] First 10 enabled markets:",
        markets.slice(0, 10).map((m) => ({
          symbol: m.symbol,
          type: m.get("type"),
          name: m.get("name"),
        }))
      );
    }

    return markets.map((m) => m.symbol);
  } catch (error) {
    console.error(
      "[eco-ws] Failed to fetch enabled TWD symbols from DB:",
      error
    );
    return [];
  }
}

const PORT = Number(process.env.ECO_WS_PORT || 4002);

// Configuration
const TWD_REST_URL =
  process.env.TWD_REST_URL || "https://api.twelvedata.com/price";
const TWD_API_KEY = process.env.TWD_API_KEY || "";
const TWD_MAX_SYMBOLS = Number(process.env.TWD_MAX_SYMBOLS || 3); // Limit concurrent WS subscriptions
const TWD_DISABLE_REST = process.env.TWD_DISABLE_REST === "true"; // Disable REST calls to save API credits

console.log("[eco-ws] Configuration:");
console.log(`  - Port: ${PORT}`);
console.log(`  - API Key length: ${TWD_API_KEY?.length || 0}`);
console.log(`  - Max symbols: ${TWD_MAX_SYMBOLS}`);
console.log(`  - REST disabled: ${TWD_DISABLE_REST}`);

if (!TWD_API_KEY) {
  console.warn("[eco-ws] WARNING: TWD_API_KEY is empty, WebSocket will fail");
}

// Сумісно з різними версіями ws
const WSAny = WebSocket as any;
const WebSocketServerCtor = WSAny.WebSocketServer || WSAny.Server;
const wss = new WebSocketServerCtor({ port: PORT });

console.log(`[eco-ws] listening on :${PORT}`);
console.log(`[eco-ws] TWD_WS_URL = ${process.env.TWD_WS_URL}`);
console.log(`[eco-ws] TWD_API_KEY length = ${TWD_API_KEY?.length || 0}`);

type Client = WebSocket;
type SubSet = Set<string>;

const subsByClient = new Map<Client, SubSet>();
const lastBySymbol = new Map<string, { price: number; ts: number }>();

// допоміжне: визначимо "схоже на акцію"
function looksLikeEquity(sym: string) {
  // дуже грубо: форекс/крипта мають '/', індекси типу SPX без суфікса — теж equity-like,
  // але нас цікавить саме праймити те, що зазвичай не тече поза сесією
  // Праймити будемо все, що НЕ має '/' (AAPL, AAPL:NASDAQ, TSLA:NASDAQ, QQQ тощо)
  return !sym.includes("/");
}

// Підключаємось до TwelveData
const provider = new TwelveDataProvider(
  process.env.TWD_WS_URL!,
  process.env.TWD_API_KEY!
);
provider.connect();

// Initialize default subscriptions from database
(async () => {
  const dbSymbols = await getEnabledTwdSymbols();
  if (dbSymbols.length) {
    // Limit to TWD_MAX_SYMBOLS to avoid overwhelming free tier
    const symbolsToSubscribe = dbSymbols.slice(0, TWD_MAX_SYMBOLS);

    if (dbSymbols.length > TWD_MAX_SYMBOLS) {
      console.warn(
        `[eco-ws] ⚠️  Found ${dbSymbols.length} enabled symbols, but TWD_MAX_SYMBOLS=${TWD_MAX_SYMBOLS}`
      );
      console.warn(
        `[eco-ws] ⚠️  Only subscribing to first ${TWD_MAX_SYMBOLS} symbols`
      );
      console.warn(
        "[eco-ws] ⚠️  Skipped symbols:",
        dbSymbols.slice(TWD_MAX_SYMBOLS).join(", ")
      );
    }

    console.log(
      "[eco-ws] Subscribing to",
      symbolsToSubscribe.length,
      "symbols:",
      symbolsToSubscribe.join(", ")
    );

    // Prime tickers with 24h data immediately (only if REST enabled)
    if (!TWD_DISABLE_REST) {
      console.log("[eco-ws] Initial priming of tickers with 24h data...");
      await primeTickersWithQuote(symbolsToSubscribe).catch((err) => {
        console.error("[eco-ws] Error during initial ticker priming:", err);
      });
    }

    provider.subscribe(symbolsToSubscribe);
  } else {
    console.log("[eco-ws] No enabled TWD markets found in database");
  }
})();

// every 60s refresh subscriptions and optionally prime via REST
setInterval(async () => {
  try {
    const dbSymbols = await getEnabledTwdSymbols();
    const wl = await getWatchlist();
    const all = [...new Set([...dbSymbols, ...wl])];

    if (all.length) {
      // Limit to TWD_MAX_SYMBOLS
      const symbolsToSubscribe = all.slice(0, TWD_MAX_SYMBOLS);

      // Only prime via REST if enabled (saves API credits in dev)
      if (!TWD_DISABLE_REST) {
        // Use quote endpoint to get full 24h stats
        await primeTickersWithQuote(symbolsToSubscribe);
      }

      provider.subscribe(symbolsToSubscribe);
    }
  } catch (e) {
    console.log("[eco-ws] Periodic refresh error:", (e as any)?.message || e);
  }
}, 60_000);

// ---- REST PRIMING ----
async function fetchPriceOnce(
  symbol: string
): Promise<{ symbol: string; price: number; ts: number } | null> {
  try {
    const url = `${TWD_REST_URL}?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TWD_API_KEY)}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      return null;
    }
    const data = await resp.json();
    const priceRaw = (data && (data.price ?? data?.data?.price)) as any;
    if (priceRaw == null) {
      return null;
    }
    const price = Number(priceRaw);
    if (!Number.isFinite(price)) {
      return null;
    }
    return { symbol, price, ts: Date.now() };
  } catch {
    return null;
  }
}

// Fetch full quote data (24h stats) from TwelveData REST API
async function fetchQuoteOnce(symbol: string): Promise<any | null> {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TWD_API_KEY)}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      return null;
    }
    const data = await resp.json();

    if (data.status === "error" || data.code) {
      console.error(
        `[eco-ws] Quote API error for ${symbol}:`,
        data.message || data.code
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error(`[eco-ws] Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
}

/** Prime tickers with full 24h stats from quote endpoint */
async function primeTickersWithQuote(symbols: string[]) {
  if (!symbols.length) {
    return;
  }

  for (const symbol of symbols) {
    try {
      const quote = await fetchQuoteOnce(symbol);
      if (!quote) {
        continue;
      }

      // Extract data from quote response
      const price = Number(quote.close || quote.price);
      const open = Number(quote.open);
      const high = Number(quote.high);
      const low = Number(quote.low);
      const volume = Number(quote.volume || 0);
      const previousClose = Number(quote.previous_close);

      // Validate all values
      if (!Number.isFinite(price)) {
        continue;
      }

      // Calculate change from previous close if available
      const change = Number.isFinite(previousClose) ? price - previousClose : 0;
      const changePercent =
        Number.isFinite(previousClose) && previousClose !== 0
          ? (change / previousClose) * 100
          : 0;

      const tickerKey = `twd:ticker:${symbol}`;
      const tickerData = {
        symbol,
        price,
        open: Number.isFinite(open) ? open : price,
        high: Number.isFinite(high) ? high : price,
        low: Number.isFinite(low) ? low : price,
        volume,
        change,
        changePercent,
        lastUpdate: Date.now(),
      };

      await redis.setex(tickerKey, 86_400, JSON.stringify(tickerData));
      console.log(`[eco-ws] 📊 Primed ticker with quote data: ${symbol}`, {
        price,
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        volume,
      });

      // Update lastBySymbol for WebSocket clients
      lastBySymbol.set(symbol, { price, ts: Date.now() });
    } catch (err) {
      console.error(`[eco-ws] Error priming ticker for ${symbol}:`, err);
    }
  }
}

/** Праймимо акції (та інші «не через /») і одразу розкладаємо в lastBySymbol + пушимо клієнтам */
async function primeEquitySymbols(symbols: string[]) {
  const targets = symbols.filter(looksLikeEquity);
  if (!targets.length) {
    return;
  }

  // тягнемо послідовно, щоб не душити апі
  for (const s of targets) {
    // якщо вже є свіже значення — пропускаємо
    if (lastBySymbol.has(s)) {
      continue;
    }

    const item = await fetchPriceOnce(s);
    if (!item) {
      continue;
    }

    // покладемо в lastBySymbol
    lastBySymbol.set(s, { price: item.price, ts: item.ts });

    // і «проактивно» розішлемо тік усім, хто вже підписаний на цей символ
    const payload = JSON.stringify({
      t: "price",
      s,
      p: item.price,
      ts: item.ts,
    });
    wss.clients.forEach((client: Client) => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }
      const subs = subsByClient.get(client);
      if (subs?.has(s)) {
        client.send(payload);
      }
    });
  }
}

// Розсилаємо тики клієнтам
provider.on("event", async (ev: any) => {
  if (ev?.kind === "price") {
    console.log("[eco-ws] ✅ Price event received:", {
      symbol: ev.symbol,
      price: ev.price,
      ts: ev.ts,
    });

    lastBySymbol.set(ev.symbol, { price: ev.price, ts: ev.ts });

    // Persist to Redis for ticker API
    try {
      const tickerKey = `twd:ticker:${ev.symbol}`;
      const existing = await redis.get(tickerKey);

      let tickerData;
      if (existing) {
        // Update existing ticker - preserve volume and properly calculated change
        tickerData = JSON.parse(existing);
        const _oldPrice = tickerData.price;
        tickerData.price = ev.price;
        tickerData.lastUpdate = ev.ts;

        // Update 24h high/low
        if (ev.price > tickerData.high) {
          tickerData.high = ev.price;
        }
        if (ev.price < tickerData.low) {
          tickerData.low = ev.price;
        }

        // Recalculate change from open (which was set by quote endpoint)
        if (
          tickerData.open &&
          Number.isFinite(tickerData.open) &&
          tickerData.open !== 0
        ) {
          tickerData.change = ev.price - tickerData.open;
          tickerData.changePercent =
            (tickerData.change / tickerData.open) * 100;
        }

        console.log("[eco-ws] 💾 Updated ticker in Redis:", tickerKey, {
          price: tickerData.price,
          change: tickerData.change?.toFixed(2),
          changePercent: tickerData.changePercent?.toFixed(2),
          volume: tickerData.volume,
        });
      } else {
        // Create new ticker with minimal data - will be enriched by next quote fetch
        tickerData = {
          symbol: ev.symbol,
          price: ev.price,
          open: ev.price,
          high: ev.price,
          low: ev.price,
          volume: 0,
          change: 0,
          changePercent: 0,
          lastUpdate: ev.ts,
        };
        console.log(
          "[eco-ws] 📝 Created new ticker in Redis:",
          tickerKey,
          "(will be enriched on next quote fetch)"
        );
      }

      // Store with 24h expiry
      await redis.setex(tickerKey, 86_400, JSON.stringify(tickerData));
    } catch (err) {
      console.error("[eco-ws] ❌ Failed to persist ticker to Redis:", err);
    }

    const payload = JSON.stringify({
      t: "price",
      s: ev.symbol,
      p: ev.price,
      ts: ev.ts,
    });
    wss.clients.forEach((client: Client) => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }
      const subs = subsByClient.get(client);
      if (subs?.has(ev.symbol)) {
        client.send(payload);
      }
    });
  }

  if (ev?.kind === "subscribed") {
    console.log("[eco-ws] ✅ Subscription confirmed for symbols:", ev.symbols);
    // Prime all symbols with full quote data for 24h stats (only if REST is enabled)
    if (TWD_DISABLE_REST) {
      console.log(
        "[eco-ws] REST priming disabled (TWD_DISABLE_REST=true), relying on WebSocket for all prices"
      );
    } else {
      primeTickersWithQuote(ev.symbols).catch((err) => {
        console.error("[eco-ws] Error priming tickers with quote data:", err);
      });
    }
  }

  if (ev?.kind === "subscribe-status") {
    if (ev.status === "ok" && ev.success && ev.success.length > 0) {
      console.log(
        "[eco-ws] ✅ Subscribe SUCCESS for",
        ev.success.length,
        "symbols:"
      );
      ev.success.forEach((s: any) => {
        console.log(`  ✅ ${s.symbol || JSON.stringify(s)}`);
      });
    }
    if (ev.status === "error" || (ev.fails && ev.fails.length > 0)) {
      console.error(
        "[eco-ws] ❌ Subscribe FAILED for",
        ev.fails?.length || 0,
        "symbols"
      );
      if (ev.fails && ev.fails.length > 0) {
        ev.fails.forEach((f: any) => {
          const symbol = f.symbol || "unknown";
          const msg = f.msg || f.message || "no error message provided";
          console.error(`  ❌ ${symbol}: ${msg}`);
        });
      }
      if (ev.message) {
        console.error("[eco-ws] Global error message:", ev.message);
      }
      console.error(
        "[eco-ws] Full subscribe-status event:",
        JSON.stringify(ev, null, 2)
      );
    }
  }
});

// Протокол для фронта:
// {type:"subscribe", symbols:["EUR/USD","AAPL"]}
// {type:"unsubscribe", symbols:[...]}
// {type:"ping"}
wss.on("connection", (ws: Client) => {
  subsByClient.set(ws, new Set());

  ws.on("message", (buf: any) => {
    try {
      const text = typeof buf === "string" ? buf : (buf?.toString?.() ?? "");
      if (!text) {
        return;
      }
      const msg = JSON.parse(text);

      if (msg?.type === "ping") {
        ws.send(JSON.stringify({ t: "pong", now: Date.now() }));
        return;
      }

      if (msg?.type === "subscribe" && Array.isArray(msg.symbols)) {
        const want: string[] = msg.symbols
          .map((s: string) => s.trim())
          .filter(Boolean);
        const set = subsByClient.get(ws)!;
        want.forEach((s) => set.add(s));

        // Надішлемо останній снепшот, якщо є
        const snaps = want
          .map((s) => ({ s, tick: lastBySymbol.get(s) }))
          .filter((x) => x.tick)
          .map((x) => ({
            t: "price",
            s: x.s,
            p: x.tick?.price,
            ts: x.tick?.ts,
          }));
        if (snaps.length) {
          ws.send(JSON.stringify({ t: "snapshot", items: snaps }));
        }

        // Prime equity symbols via REST if needed (only if REST is enabled)
        if (!TWD_DISABLE_REST) {
          const needPrime = want
            .filter(looksLikeEquity)
            .filter((s) => !lastBySymbol.has(s));
          if (needPrime.length) {
            primeEquitySymbols(needPrime).catch(() => {});
          }
        }
      }

      if (msg?.type === "unsubscribe" && Array.isArray(msg.symbols)) {
        const set = subsByClient.get(ws)!;
        msg.symbols.forEach((s: string) => set.delete(s));
      }
    } catch {
      // ignore
    }
  });

  ws.on("close", () => {
    subsByClient.delete(ws);
  });
});
