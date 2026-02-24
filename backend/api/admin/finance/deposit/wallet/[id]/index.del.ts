import {
  deleteRecordParams,
  deleteRecordResponses,
  handleSingleDelete,
} from "@b/utils/query";

export const metadata = {
  summary: "Deletes a deposit wallet",
  operationId: "deleteDepositWallet",
  tags: ["Admin", "Deposit Wallets"],
  parameters: deleteRecordParams("deposit wallet"),
  responses: deleteRecordResponses("Deposit wallet"),
  requiresAuth: true,
  permission: "Access Deposit Wallet Management",
};

export default async (data: Handler) => {
  const { params, query } = data;
  return handleSingleDelete({
    model: "depositWallet",
    id: params.id,
    query,
  });
};
