// /api/admin/deposit/wallets/store.post.ts

import { storeRecord, storeRecordResponses } from "@b/utils/query";
import { DepositWalletSchema, depositWalletUpdateSchema } from "./utils";

export const metadata = {
  summary: "Stores a new deposit wallet",
  operationId: "storeDepositWallet",
  tags: ["Admin", "Deposit Wallets"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: depositWalletUpdateSchema,
      },
    },
  },
  responses: storeRecordResponses(DepositWalletSchema, "Deposit Wallet"),
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { body } = data;
  const {
    title,
    address,
    network,
    instructions,
    image,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    customFields,
    status,
  } = body;

  // Ensure customFields is an array
  let parsedCustomFields = Array.isArray(customFields) ? customFields : [];
  if (typeof customFields === "string") {
    try {
      const parsed = JSON.parse(customFields);
      parsedCustomFields = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      throw new Error("Invalid JSON format for customFields");
    }
  }

  return await storeRecord({
    model: "depositWallet",
    data: {
      title,
      address,
      network,
      instructions,
      image,
      fixedFee,
      percentageFee,
      minAmount,
      maxAmount,
      customFields: parsedCustomFields,
      status,
    },
  });
};
