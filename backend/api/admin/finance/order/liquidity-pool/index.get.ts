import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { poolSchema } from "./utils";

export const metadata = {
  summary: "List all liquidity pools",
  operationId: "listLiquidityPools",
  tags: ["Admin", "Liquidity Pools"],
  parameters: crudParameters,
  responses: {
    200: {
      description: "Liquidity pools retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: poolSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Liquidity Pools"),
    500: serverErrorResponse,
  },
  permission: "Access Liquidity Pool Management",
  requiresAuth: true,
};

export default (data: Handler) => {
  const { query } = data;
  return getFiltered({
    model: models.liquidityPool,
    query,
    sortField: query.sortField || "createdAt",
    paranoid: false,
  });
};
