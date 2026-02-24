import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { liquidityPoolSchema } from "./utils";

export const metadata = {
  summary: "Lists liquidity pools with pagination and optional filtering",
  operationId: "listLiquidityPools",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: crudParameters,
  responses: {
    200: {
      description: "List of liquidity pools with pagination information",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: liquidityPoolSchema,
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
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { query } = data;

  return await getFiltered({
    model: models.liquidityPool,
    query,
    sortField: query.sortField || "createdAt",
  });
};
