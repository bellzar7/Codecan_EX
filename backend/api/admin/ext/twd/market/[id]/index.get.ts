import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdMarketSchema } from "../utils";

export const metadata = {
  summary: "Retrieves detailed information of a specific TWD market by ID",
  operationId: "getTwdMarketById",
  tags: ["Admin", "TWD", "Market"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the TWD market to retrieve",
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
  permission: "Access TWD Market Management",
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { params } = data;
  const { id } = params;

  const market = await models.twdMarket.findOne({
    where: { id },
  });

  if (!market) {
    throw new Error("TWD Market not found");
  }

  return market.get({ plain: true });
};
