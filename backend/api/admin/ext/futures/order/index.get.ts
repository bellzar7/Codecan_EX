// backend/api/admin/ext/futures/order/index.get.ts

import { crudParameters, paginationSchema } from "@b/utils/constants";
import { scyllaFuturesKeyspace } from "@b/utils/eco/scylla/client";
import { getPaginatedRecords } from "@b/utils/eco/scylla/query";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { orderSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "List all futures orders",
  operationId: "listFuturesOrders",
  tags: ["Admin", "Futures Orders"],
  parameters: crudParameters,
  responses: {
    200: {
      description: "Futures orders retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: orderSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Futures Orders"),
    500: serverErrorResponse,
  },
  permission: "Access Futures Order Management",
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { query } = data;
  return getPaginatedRecords({
    keyspace: scyllaFuturesKeyspace,
    table: "orders",
    query,
    sortField: query.sortField || "createdAt",
  });
};
