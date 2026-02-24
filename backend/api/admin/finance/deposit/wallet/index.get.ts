// /server/api/admin/deposit/wallets/index.get.ts

import { models } from "@b/db";
import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseDepositWalletSchema } from "./utils";

export const metadata = {
  summary: "Lists all deposit wallets",
  operationId: "listDepositWallets",
  tags: ["Admin", "Deposit Wallets"],
  parameters: crudParameters,
  responses: {
    200: {
      description: "Paginated list of deposit wallets retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: baseDepositWalletSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Deposit Wallets"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { query } = data;

  return getFiltered({
    model: models.depositWallet,
    query,
    sortField: query.sortField || "createdAt",
    numericFields: ["fixedFee", "percentageFee", "minAmount", "maxAmount"],
  });
};
