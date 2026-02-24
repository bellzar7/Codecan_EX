// /server/api/admin/deposit/wallets/[id].get.ts

import {
  getRecord,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { walletSchema } from "../utils"; // Ensure the schema is adjusted to include only the fields needed.

export const metadata = {
  summary: "Retrieves detailed information of a specific deposit wallet by ID",
  operationId: "getDepositWalletById",
  tags: ["Admin", "Deposit Wallets"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the deposit wallet to retrieve",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Deposit wallet details",
      content: {
        "application/json": {
          schema: walletSchema,
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Deposit Wallet"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { params } = data;

  return await getRecord("depositWallet", params.id);
};
