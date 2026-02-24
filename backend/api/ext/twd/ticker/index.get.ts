import { serverErrorResponse, unauthorizedResponse } from "@b/utils/query";
import { RedisSingleton } from "@b/utils/redis";

const redis = RedisSingleton.getInstance();

export const metadata: OperationObject = {
  summary: "Get TWD Market Tickers",
  operationId: "getTwdTickers",
  tags: ["TWD", "Ticker"],
  description:
    "Retrieves current price, 24h change, and volume for all TWD markets",
  responses: {
    200: {
      description: "Ticker data retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                symbol: { type: "string" },
                price: { type: "number" },
                open: { type: "number" },
                high: { type: "number" },
                low: { type: "number" },
                volume: { type: "number" },
                change: { type: "number" },
                changePercent: { type: "number" },
                lastUpdate: { type: "number" },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (_data: Handler) => {
  try {
    // Get all ticker keys from Redis
    const keys = await redis.keys("twd:ticker:*");

    if (!keys || keys.length === 0) {
      return {};
    }

    // Fetch all ticker data
    const tickers: Record<string, any> = {};

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const ticker = JSON.parse(data);
          tickers[ticker.symbol] = ticker;
        } catch (err) {
          console.error(
            `[TWD Ticker] Failed to parse ticker data for ${key}:`,
            err
          );
        }
      }
    }

    return tickers;
  } catch (error) {
    console.error("[TWD Ticker] Error fetching tickers:", error);
    throw new Error("Failed to fetch TWD tickers");
  }
};
