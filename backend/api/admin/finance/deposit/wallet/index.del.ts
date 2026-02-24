// /server/api/admin/deposit/wallets/delete.del.ts

import {
  commonBulkDeleteParams,
  commonBulkDeleteResponses,
  handleBulkDelete,
} from "@b/utils/query";

export const metadata = {
  summary: "Bulk deletes deposit wallets by IDs",
  operationId: "bulkDeleteDepositWallets",
  tags: ["Admin", "Deposit Wallets"],
  parameters: commonBulkDeleteParams("Deposit Wallets"),
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of deposit wallet IDs to delete",
            },
          },
          required: ["ids"],
        },
      },
    },
  },
  responses: commonBulkDeleteResponses("Deposit Wallets"),
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { body, query } = data;
  const { ids } = body;
  return handleBulkDelete({
    model: "depositWallet",
    ids,
    query,
  });
};
