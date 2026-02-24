import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Deletes a liquidity pool",
  operationId: "deleteLiquidityPool",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool to delete",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Liquidity pool deleted successfully",
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
    404: notFoundMetadataResponse("Liquidity Pool"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { params } = data;
  const { id } = params;

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  // Check if pool has any balance
  const hasBalance = pool.baseBalance > 0 || pool.quoteBalance > 0;
  if (hasBalance) {
    throw createError({
      statusCode: 400,
      message:
        "Cannot delete pool with remaining balance. Please withdraw all funds first.",
    });
  }

  await pool.destroy();

  return {
    message: "Liquidity pool deleted successfully",
  };
};
