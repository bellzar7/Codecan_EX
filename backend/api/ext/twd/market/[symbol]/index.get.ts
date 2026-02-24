import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdMarketSchema } from "../utils";

export const metadata: OperationObject = {
  summary: "Get TWD Market by Symbol",
  operationId: "getTwdMarketBySymbol",
  tags: ["TWD", "Markets"],
  description: "Retrieves details of a specific TWD market by symbol.",
  parameters: [
    {
      index: 0,
      name: "symbol",
      in: "path",
      required: true,
      description: "Symbol of the TWD market (e.g., EUR/USD, AAPL, SPX)",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "TWD market details",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseTwdMarketSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Market"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { params } = data;
  const { symbol } = params;

  const market = await models.twdMarket.findOne({
    where: {
      symbol,
      status: true, // Only return enabled markets
    },
  });

  if (!market) {
    throw new Error("TWD Market not found or not enabled");
  }

  return market.get({ plain: true });
};
