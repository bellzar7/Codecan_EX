import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Deletes a specific TWD market",
  operationId: "deleteTwdMarket",
  tags: ["Admin", "TWD", "Market"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the TWD market to delete",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "TWD market deleted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Market"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access TWD Market Management",
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

  // Delete related orders first
  await models.twdOrder.destroy({
    where: { symbol: market.symbol },
  });

  // Delete the market
  await models.twdMarket.destroy({
    where: { id },
  });

  return {
    message: "TWD Market deleted successfully",
  };
};
