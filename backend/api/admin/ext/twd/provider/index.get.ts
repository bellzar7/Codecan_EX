import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { twdProviderSchema } from "./utils";

export const metadata = {
  summary: "Lists all TWD providers with pagination and optional filtering",
  operationId: "listTwdProviders",
  tags: ["Admin", "TWD", "Provider"],
  parameters: [
    ...crudParameters,
    {
      name: "name",
      in: "query",
      description: "Filter TWD providers by name",
      schema: { type: "string" },
      required: false,
    },
    {
      name: "status",
      in: "query",
      description: "Filter TWD providers by status",
      schema: { type: "boolean" },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "List of TWD providers",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: twdProviderSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Providers"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access TWD Provider Management",
};

export default async (data: Handler) => {
  const { query } = data;

  return getFiltered({
    model: models.twdProvider,
    query,
    sortField: query.sortField || "name",
    paranoid: false,
  });
};
