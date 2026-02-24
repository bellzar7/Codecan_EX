import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseNumberSchema } from "@b/utils/schema";
import { liquidityPoolSchema } from "../utils";

export const metadata = {
  summary: "Updates a liquidity pool",
  operationId: "updateLiquidityPool",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool to update",
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            adminPrice: baseNumberSchema("Admin-set price (optional)"),
            priceSource: {
              type: "string",
              enum: ["BINANCE", "TWD", "ADMIN", "ORDERBOOK"],
              description: "Price source for the pool",
            },
            minOrderSize: baseNumberSchema("Minimum order size"),
            maxOrderSize: baseNumberSchema("Maximum order size"),
            spreadPercentage: baseNumberSchema("Spread percentage"),
            status: {
              type: "boolean",
              description: "Pool status (active/inactive)",
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Liquidity pool updated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: liquidityPoolSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Liquidity Pool"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { params, body } = data;
  const { id } = params;

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  const {
    adminPrice,
    priceSource,
    minOrderSize,
    maxOrderSize,
    spreadPercentage,
    status,
  } = body;

  // Update only provided fields
  const updateData: Record<string, unknown> = {};
  if (adminPrice !== undefined) {
    updateData.adminPrice = adminPrice;
  }
  if (priceSource !== undefined) {
    updateData.priceSource = priceSource;
  }
  if (minOrderSize !== undefined) {
    updateData.minOrderSize = minOrderSize;
  }
  if (maxOrderSize !== undefined) {
    updateData.maxOrderSize = maxOrderSize;
  }
  if (spreadPercentage !== undefined) {
    updateData.spreadPercentage = spreadPercentage;
  }
  if (status !== undefined) {
    updateData.status = status;
  }

  await pool.update(updateData);

  return {
    message: "Liquidity pool updated successfully",
    pool,
  };
};
