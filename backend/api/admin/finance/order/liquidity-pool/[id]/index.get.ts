import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { poolSchema } from "../utils";

export const metadata = {
  summary: "Get a liquidity pool by ID",
  operationId: "getLiquidityPool",
  tags: ["Admin", "Liquidity Pool"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Liquidity pool retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: poolSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Liquidity Pool"),
    500: serverErrorResponse,
  },
  permission: "Access Liquidity Pool Management",
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { params } = data;
  const { id } = params;

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw new Error("Liquidity pool not found");
  }

  return {
    ...pool.get({ plain: true }),
    isActive: Boolean(pool.isActive),
  };
};
