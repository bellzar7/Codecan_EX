import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { liquidityPoolSchema } from "../utils";

export const metadata = {
  summary: "Retrieves a specific liquidity pool by ID",
  operationId: "getLiquidityPoolById",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool to retrieve",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Liquidity pool details",
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
  const { params } = data;
  const { id } = params;

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  return pool;
};
