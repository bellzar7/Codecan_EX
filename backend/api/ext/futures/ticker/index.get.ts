import { FuturesMatchingEngine } from "@b/utils/futures/matchingEngine";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { RedisSingleton } from "@b/utils/redis";
import { baseTickerSchema } from "../order/utils";

const _redis = RedisSingleton.getInstance();

export const metadata: OperationObject = {
  summary: "Get All Market Tickers",
  operationId: "getAllMarketTickers",
  tags: ["Exchange", "Markets"],
  description: "Retrieves ticker information for all available market pairs.",
  responses: {
    200: {
      description: "All market tickers information",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseTickerSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Ticker"),
    500: serverErrorResponse,
  },
};

export default async () => {
  const _engine = await FuturesMatchingEngine.getInstance();
  // const tickers = await engine.getTickers();
  // return tickers;
};
