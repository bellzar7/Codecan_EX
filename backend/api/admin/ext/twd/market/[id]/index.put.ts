import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { TwdMarketStoreSchema, TwdMarketUpdateSchema } from "../utils";

export const metadata = {
  summary: "Updates a specific TWD market",
  operationId: "updateTwdMarket",
  tags: ["Admin", "TWD", "Market"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the TWD market to update",
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: TwdMarketUpdateSchema,
      },
    },
  },
  responses: {
    200: TwdMarketStoreSchema,
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Market"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access TWD Market Management",
};

export default async (data: Handler) => {
  const { body, params } = data;
  const { id } = params;
  const { name, isTrending, isHot, metadata } = body;

  const market = await models.twdMarket.findOne({
    where: { id },
  });

  if (!market) {
    throw new Error("TWD Market not found");
  }

  const updateData: any = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (isTrending !== undefined) {
    updateData.isTrending = isTrending;
  }

  if (isHot !== undefined) {
    updateData.isHot = isHot;
  }

  if (metadata !== undefined) {
    updateData.metadata = JSON.stringify(metadata);
  }

  await models.twdMarket.update(updateData, {
    where: { id },
  });

  const updatedMarket = await models.twdMarket.findOne({
    where: { id },
  });

  return updatedMarket?.get({ plain: true });
};
