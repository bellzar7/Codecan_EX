import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Retrieves TwelveData exchange provider details",
  operationId: "getTwelveDataProvider",
  tags: ["Admin", "Exchanges", "TwelveData"],
  responses: {
    200: {
      description: "TwelveData provider details",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              exchange: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  title: { type: "string" },
                  status: { type: "boolean" },
                  version: { type: "string" },
                  productId: { type: "string" },
                  type: { type: "string" },
                },
              },
              result: {
                type: "object",
                properties: {
                  status: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TwelveData Provider"),
    500: serverErrorResponse,
  },
  permission: "Access Exchange Provider Management",
  requiresAuth: true,
};

export default async (data) => {
  const exchange = await models.exchange.findOne({
    where: { productId: "twelvedata" },
  });

  if (!exchange) {
    return data.response.notFound("TwelveData provider not found");
  }

  // Check if TwelveData API key is configured
  const apiKey = process.env.TWD_API_KEY;
  const result = {
    status: !!apiKey,
    message: apiKey
      ? "TwelveData API key is configured"
      : "TWD_API_KEY environment variable is not set. Please configure it in your .env file.",
  };

  return {
    exchange,
    result,
  };
};
