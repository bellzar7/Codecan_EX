// backend/integrations/twelvedata/provider.ts

import { EventEmitter } from "node:events";
import WebSocket from "ws";

export type ProviderEvent =
  | { kind: "connected" }
  | { kind: "reconnected" }
  | { kind: "disconnected"; reason?: string }
  | { kind: "price"; symbol: string; price: number; ts: number }
  | { kind: "subscribed"; symbols: string[] }
  | {
      kind: "subscribe-status";
      status: string;
      success?: any[];
      fails?: any[];
      message?: string;
    };

interface Pending {
  subs: Set<string>;
}

// невеличкий лог-хелпер
const log = (...args: any[]) => console.log("[twd]", ...args);

export class TwelveDataProvider extends EventEmitter {
  private readonly url: string;
  private readonly apiKey: string;
  private ws?: WebSocket;
  private readonly pending: Pending = { subs: new Set() };
  private readonly wantSubs: Set<string> = new Set();
  private readonly reconnectDelay = 2000;
  private alivePing?: ReturnType<typeof setInterval>;
  private hasEverConnected = false;

  constructor(
    url = process.env.TWD_WS_URL!,
    apiKey = process.env.TWD_API_KEY!
  ) {
    super();
    if (!url) {
      throw new Error("TWD_WS_URL is required");
    }
    if (!apiKey) {
      throw new Error("TWD_API_KEY is required");
    }
    this.url = url;
    this.apiKey = apiKey;
  }

  connect() {
    log("connecting to", this.url);
    this.ws = new WebSocket(this.url);

    this.ws.on("open", () => {
      log(this.hasEverConnected ? "reconnected" : "connected");
      this.emit("event", <ProviderEvent>{
        kind: this.hasEverConnected ? "reconnected" : "connected",
      });
      this.hasEverConnected = true;

      // якщо щось хотіли — відправимо сабскрайб зараз
      if (this.wantSubs.size) {
        this.sendSubscribe(Array.from(this.wantSubs));
      }

      // heartbeat, щоб з’єднання не засинало
      this.alivePing = setInterval(() => {
        try {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: "heartbeat" }));
          }
        } catch {}
      }, 10_000);
    });

    this.ws.on("message", (buf: WebSocket.RawData) => {
      const text = typeof buf === "string" ? buf : (buf?.toString?.() ?? "");
      if (!text) {
        return;
      }

      try {
        const raw = JSON.parse(text);

        // лог корисних службових відповідей
        if (raw?.status === "error" || raw?.message) {
          log("msg", raw);
        }

        // 1) ціна
        const ev = this.parsePrice(raw);
        if (ev) {
          this.emit("event", ev);
          return;
        }

        // 2) підтвердження підписки (success or error)
        if (raw?.event === "subscribe-status") {
          // Emit the full subscribe-status event
          this.emit("event", <ProviderEvent>{
            kind: "subscribe-status",
            status: raw.status,
            success: raw.success,
            fails: raw.fails,
            message: raw.message,
          });

          // If successful, also emit the legacy "subscribed" event
          if (raw?.status === "ok") {
            const success = Array.isArray(raw?.success) ? raw.success : [];
            const symbols: string[] = success
              .map((x: any) => x?.symbol)
              .filter((s: any) => typeof s === "string" && s.trim().length > 0);
            log("< subscribe-status ok", symbols?.join(", ") || "");
            this.emit("event", <ProviderEvent>{ kind: "subscribed", symbols });
          }
          return;
        }

        // 3) heartbeat — ігноруємо
        if (raw?.event === "heartbeat") {
          return;
        }
      } catch (_e) {
        log("bad json", text);
      }
    });

    this.ws.on("close", (code, reason) => {
      log("closed", code, reason?.toString?.());
      this.emit("event", <ProviderEvent>{ kind: "disconnected" });
      if (this.alivePing) {
        clearInterval(this.alivePing);
      }
      setTimeout(() => this.connect(), this.reconnectDelay);
    });

    this.ws.on("error", (err) => {
      log("error", (err as any)?.message || err);
    });
  }

  /** Попросити провайдера почати слати тики по символах */
  subscribe(symbols: string[]) {
    symbols.forEach((s) => this.wantSubs.add(s));
    this.sendSubscribe(symbols);
  }

  /** Відписка від символів у провайдера */
  unsubscribe(symbols: string[]) {
    symbols.forEach((s) => this.wantSubs.delete(s));
    this.sendUnsubscribe(symbols);
  }

  // ---- внутрішнє ----

  private sendSubscribe(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const toSend = symbols
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !this.pending.subs.has(s));

    if (!toSend.length) {
      return;
    }

    const msg = {
      action: "subscribe",
      params: { symbols: toSend.join(",") },
    };
    log("> subscribe", msg);
    this.ws.send(JSON.stringify(msg));
    toSend.forEach((s) => this.pending.subs.add(s));
  }

  private sendUnsubscribe(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const toSend = symbols
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => this.pending.subs.has(s));

    if (!toSend.length) {
      return;
    }

    const msg = {
      action: "unsubscribe",
      params: { symbols: toSend.join(",") },
    };
    log("> unsubscribe", msg);
    this.ws.send(JSON.stringify(msg));
    toSend.forEach((s) => this.pending.subs.delete(s));
  }

  /** Нормалізуємо різні формати подій від TwelveData у єдиний `price` і timestamp(ms) */
  private parsePrice(raw: any) {
    // формат: { event:"price", symbol, price, timestamp }
    if (raw?.event === "price" && raw?.symbol && raw?.price) {
      const price = Number(raw.price);
      const ts = raw.timestamp ? Number(raw.timestamp) * 1000 : Date.now();
      if (!Number.isFinite(price)) {
        return null;
      }
      return <ProviderEvent>{ kind: "price", symbol: raw.symbol, price, ts };
    }

    // формат: { symbol, price, datetime }  (інколи у snapshot)
    if (raw?.symbol && raw?.price && raw?.datetime) {
      const price = Number(raw.price);
      const ts = Date.parse(raw.datetime);
      if (!(Number.isFinite(price) && Number.isFinite(ts))) {
        return null;
      }
      return <ProviderEvent>{ kind: "price", symbol: raw.symbol, price, ts };
    }

    // інколи приходить {symbol,bid,ask,timestamp}
    if (raw?.symbol && raw?.bid && raw?.ask) {
      const bid = Number(raw.bid);
      const ask = Number(raw.ask);
      if (!(Number.isFinite(bid) && Number.isFinite(ask))) {
        return null;
      }
      const price = (bid + ask) / 2;
      const ts = raw.timestamp ? Number(raw.timestamp) * 1000 : Date.now();
      return <ProviderEvent>{ kind: "price", symbol: raw.symbol, price, ts };
    }

    return null;
  }
}
