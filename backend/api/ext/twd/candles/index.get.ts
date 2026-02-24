// backend/api/ext/twd/candles/index.get.ts

import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { RedisSingleton } from "@b/utils/redis";

const redis = RedisSingleton.getInstance();

export const metadata: OperationObject = {
  summary: "Get TWD Market Candles",
  operationId: "getTwdCandles",
  tags: ["TWD", "Candles"],
  description:
    "Retrieves OHLCV candles for TWD markets from TwelveData API with caching",
  parameters: [
    {
      name: "symbol",
      in: "query",
      description: "Market symbol (e.g., EUR/USD)",
      schema: { type: "string" },
      required: true,
    },
    {
      name: "interval",
      in: "query",
      description: "Candle interval (e.g., 1m, 5m, 15m, 1h, 4h, 1day)",
      schema: { type: "string" },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "Candles retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              symbol: { type: "string" },
              interval: { type: "string" },
              candles: {
                type: "array",
                items: {
                  type: "array",
                  items: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    400: { description: "Invalid parameters" },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Candles"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

const TWD_API_KEY = process.env.TWD_API_KEY!;
const TWD_BASE_URL = process.env.TWD_BASE_URL || "https://api.twelvedata.com";
const CACHE_TTL = 60; // Cache for 60 seconds to avoid burning credits

export default async (data: Handler) => {
  const { query } = data;
  const symbol = String(query?.symbol || "").trim();
  const interval = String(query?.interval || "1h").trim();

  if (!symbol) {
    throw createError({ statusCode: 400, message: "symbol is required" });
  }

  if (!TWD_API_KEY) {
    throw createError({
      statusCode: 500,
      message: "TWD_API_KEY is not configured",
    });
  }

  // Check cache first
  const cacheKey = `twd:candles:${symbol}:${interval}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      console.log(`[TWD Candles] Cache HIT for ${symbol} ${interval}`);
      return cachedData;
    }
  } catch (err) {
    console.error("[TWD Candles] Cache read error:", err);
  }

  // Cache miss - fetch from TwelveData
  console.log(
    `[TWD Candles] Cache MISS for ${symbol} ${interval}, fetching from TwelveData...`
  );

  try {
    const url = `${TWD_BASE_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=500&apikey=${encodeURIComponent(TWD_API_KEY)}`;

    console.log("[TWD Candles] Fetching:", {
      symbol,
      interval,
      url: url.replace(/apikey=[^&]+/, "apikey=***"),
    });

    const response = await fetch(url);
    console.log(
      "[TWD Candles] Response status:",
      response.status,
      response.statusText
    );

    const json: any = await response.json();
    console.log(
      "[TWD Candles] Response body snippet:",
      JSON.stringify(json).slice(0, 300)
    );

    if (!response.ok) {
      console.error("[TWD Candles] TwelveData API HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: json,
      });
      return {
        symbol,
        interval,
        candles: [],
        error: json.message || json.code || `HTTP ${response.status}`,
      };
    }

    // Check for API error in response
    if (json.status === "error" || json.code) {
      console.error("[TWD Candles] TwelveData returned error:", {
        status: json.status,
        code: json.code,
        message: json.message,
        fullResponse: json,
      });
      return {
        symbol,
        interval,
        candles: [],
        error: json.message || json.code || "API error",
      };
    }

    const values = Array.isArray(json?.values) ? json.values : [];

    if (!values.length) {
      console.warn(
        `[TWD Candles] No candles data returned for ${symbol} ${interval}`,
        {
          hasValues: !!json?.values,
          valuesType: typeof json?.values,
          valuesIsArray: Array.isArray(json?.values),
          responseKeys: Object.keys(json || {}),
        }
      );
      return {
        symbol,
        interval,
        candles: [],
        error: "No candle data available",
      };
    }

    console.log(
      `[TWD Candles] Processing ${values.length} candles from TwelveData`
    );

    // TwelveData returns newest-first, reverse to oldest-first
    // Format: [timestamp, open, high, low, close, volume]
    const candles = values
      .map((v: any) => {
        const timestamp = Date.parse(v.datetime);
        const open = Number(v.open);
        const high = Number(v.high);
        const low = Number(v.low);
        const close = Number(v.close);
        const volume = v.volume ? Number(v.volume) : 0;

        // Validate all values are finite
        if (
          !(
            Number.isFinite(timestamp) &&
            Number.isFinite(open) &&
            Number.isFinite(high) &&
            Number.isFinite(low) &&
            Number.isFinite(close)
          )
        ) {
          return null;
        }

        return [timestamp, open, high, low, close, volume];
      })
      .filter((c: any) => c !== null)
      .reverse(); // Reverse to oldest-first

    console.log(
      `[TWD Candles] Successfully processed ${candles.length} valid candles (from ${values.length} raw)`
    );

    const result = {
      symbol,
      interval,
      candles,
    };

    // Store in cache
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      console.log(
        `[TWD Candles] ✅ Cached ${candles.length} candles for ${symbol} ${interval} (TTL: ${CACHE_TTL}s)`
      );
    } catch (err) {
      console.error("[TWD Candles] Cache write error:", err);
    }

    return result;
  } catch (error: any) {
    console.error(
      `[TWD Candles] Error fetching candles for ${symbol}:`,
      error.message || error
    );
    return {
      symbol,
      interval,
      candles: [],
    };
  }
};
