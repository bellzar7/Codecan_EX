import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import { createError } from "@b/utils/error";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { liquidityPoolTransactionSchema } from "../utils";

export const metadata = {
  summary: "Lists transactions for a specific liquidity pool",
  operationId: "listLiquidityPoolTransactions",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool",
      schema: { type: "string" },
    },
    ...crudParameters,
  ],
  responses: {
    200: {
      description: "List of pool transactions with pagination information",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: liquidityPoolTransactionSchema,
                },
              },
              pagination: paginationSchema,
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
  const { params, query } = data;
  const { id } = params;

  // Verify pool exists
  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  return await getFiltered({
    model: models.liquidityPoolTransaction,
    query: {
      ...query,
      filter: JSON.stringify({ poolId: id }),
    },
    sortField: query.sortField || "createdAt",
  });
};
