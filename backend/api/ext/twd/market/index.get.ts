import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdMarketSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "List TWD Markets for Users",
  operationId: "listTwdMarketsUser",
  tags: ["TWD", "Markets"],
  description: "Retrieves a list of all enabled TWD markets for trading.",
  parameters: [
    {
      name: "type",
      in: "query",
      description: "Filter by market type (forex, stocks, indices)",
      schema: { type: "string", enum: ["forex", "stocks", "indices"] },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "A list of enabled TWD markets",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: baseTwdMarketSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Markets"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { query } = data;
  const { type } = query;

  const where: any = {
    status: true, // Only return enabled markets
  };

  if (type) {
    where.type = type;
  }

  const markets = await models.twdMarket.findAll({
    where,
    order: [["symbol", "ASC"]],
  });

  const plainMarkets = markets.map((market) => market.get({ plain: true }));

  // Prioritize configured symbols at the top (e.g., EUR/USD first)
  const enabledSymbolsEnv =
    process.env.TWD_DEFAULT_ENABLED_SYMBOLS || "EUR/USD";
  const prioritySymbols = enabledSymbolsEnv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (prioritySymbols.length > 0) {
    // Sort markets: priority symbols first (in configured order), then others alphabetically
    return plainMarkets.sort((a, b) => {
      const aIndex = prioritySymbols.indexOf(a.symbol);
      const bIndex = prioritySymbols.indexOf(b.symbol);

      if (aIndex !== -1 && bIndex !== -1) {
        // Both are priority: maintain configured order
        return aIndex - bIndex;
      }
      if (aIndex !== -1) {
        // Only A is priority: A comes first
        return -1;
      }
      if (bIndex !== -1) {
        // Only B is priority: B comes first
        return 1;
      }
      // Neither priority: alphabetical order
      return a.symbol.localeCompare(b.symbol);
    });
  }

  return plainMarkets;
};
