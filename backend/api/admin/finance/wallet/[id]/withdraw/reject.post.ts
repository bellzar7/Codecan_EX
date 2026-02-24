// Internal Exchange: Admin rejection for withdrawals - returns locked funds to user
import { models, sequelize } from "@b/db";
import { sendTransactionStatusUpdateEmail } from "@b/utils/emails";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Rejects a spot wallet withdrawal request",
  operationId: "rejectSpotWalletWithdrawal",
  tags: ["Admin", "Wallets"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the withdrawal transaction to reject",
      schema: { type: "string", format: "uuid" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Reason for rejecting the withdrawal request",
            },
          },
          required: ["message"],
        },
      },
    },
  },
  responses: {
    200: {
      description: "Withdrawal request rejected successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Wallet"),
    500: serverErrorResponse,
  },
  permission: "Access Wallet Management",
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { params, body } = data;

  const { id } = params;
  const { message } = body;

  // Find the pending transaction
  const transaction = await models.transaction.findOne({
    where: { id },
  });

  if (!transaction) {
    throw createError({ statusCode: 404, message: "Transaction not found" });
  }

  if (transaction.status !== "PENDING") {
    throw createError({
      statusCode: 400,
      message: "Transaction is not pending",
    });
  }

  const { walletId, amount, fee, userId } = transaction;
  const metadata = transaction.metadata as Record<string, unknown>;
  const totalAmount = Number(amount) + Number(fee || 0);

  // Fetch the wallet
  const wallet = await models.wallet.findOne({
    where: { id: walletId },
  });

  if (!wallet) {
    throw createError({ statusCode: 404, message: "Wallet not found" });
  }

  // Internal Exchange: Return locked funds to user's available balance
  await sequelize.transaction(async (t) => {
    // Return funds from inOrder to available balance
    await wallet.update(
      {
        balance: wallet.balance + totalAmount,
        inOrder: (wallet.inOrder || 0) - totalAmount,
      },
      { transaction: t }
    );

    // Update transaction status to REJECTED
    await models.transaction.update(
      {
        status: "REJECTED",
        metadata: {
          ...metadata,
          rejectedAt: new Date().toISOString(),
          note: message || "Withdrawal request rejected by admin",
        },
      },
      {
        where: { id },
        transaction: t,
      }
    );

    // Remove admin profit record since withdrawal was rejected
    await models.adminProfit.destroy({
      where: { transactionId: id },
      transaction: t,
    });
  });

  // Fetch updated data for email
  const updatedTransaction = await models.transaction.findOne({
    where: { id },
  });

  const updatedWallet = await models.wallet.findOne({
    where: { id: walletId },
  });

  if (!(updatedTransaction && updatedWallet)) {
    throw createError({
      statusCode: 500,
      message: "Failed to update transaction status",
    });
  }

  const trx = updatedTransaction.get({ plain: true }) as Transaction;

  // Send notification email
  try {
    const user = await models.user.findOne({
      where: { id: userId },
    });

    if (user) {
      await sendTransactionStatusUpdateEmail(
        user,
        trx,
        updatedWallet.get({ plain: true }) as Wallet,
        updatedWallet.balance,
        ((trx.metadata as Record<string, unknown>)?.note as string) ||
          "Withdrawal request rejected"
      );
    }
  } catch (_emailError) {
    // Log but don't fail the operation if email fails
  }

  return {
    message: "Withdrawal rejected successfully",
  };
};
