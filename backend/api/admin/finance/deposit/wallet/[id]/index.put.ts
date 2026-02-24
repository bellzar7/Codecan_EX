import { updateRecord, updateRecordResponses } from "@b/utils/query";
import { depositWalletUpdateSchema } from "../utils";

export const metadata = {
  summary: "Updates an existing deposit wallet",
  operationId: "updateDepositWallet",
  tags: ["Admin", "Deposit Wallets"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      description: "ID of the deposit wallet to update",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  requestBody: {
    required: true,
    description: "New data for the deposit wallet",
    content: {
      "application/json": {
        schema: depositWalletUpdateSchema,
      },
    },
  },
  responses: updateRecordResponses("Deposit Wallet"),
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { body, params } = data;
  const { id } = params;
  const {
    image,
    title,
    address,
    network,
    instructions,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    status,
    customFields,
  } = body;

  // Parse customFields if it is a string
  let parsedCustomFields = customFields;
  if (typeof customFields === "string") {
    try {
      parsedCustomFields = JSON.parse(customFields);
    } catch (_error) {
      throw new Error("Invalid JSON format for customFields");
    }
  }

  return await updateRecord("depositWallet", id, {
    image,
    title,
    address,
    network,
    instructions,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    status,
    customFields: parsedCustomFields,
  });
};
