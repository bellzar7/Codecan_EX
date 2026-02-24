import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { twdMarketSchema } from "./utils";

export const metadata = {
  summary: "Lists all TWD markets with pagination and optional filtering",
  operationId: "listTwdMarkets",
  tags: ["Admin", "TWD", "Market"],
  parameters: [
    ...crudParameters,
    {
      name: "symbol",
      in: "query",
      description: "Filter TWD markets by symbol",
      schema: { type: "string" },
      required: false,
    },
    {
      name: "type",
      in: "query",
      description: "Filter TWD markets by type (forex, stocks, indices)",
      schema: { type: "string", enum: ["forex", "stocks", "indices"] },
      required: false,
    },
    {
      name: "status",
      in: "query",
      description: "Filter TWD markets by status (active or not)",
      schema: { type: "boolean" },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "List of TWD markets with detailed information",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: twdMarketSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Markets"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access TWD Market Management",
};

export default async (data: Handler) => {
  const { query } = data;

  return getFiltered({
    model: models.twdMarket,
    query,
    sortField: query.sortField || "symbol",
    paranoid: false,
  });
};
