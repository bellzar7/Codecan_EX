// /server/api/finance/withdraw/spot/index.post.ts
// Internal Exchange: All withdrawals require admin approval - no external API calls

import { models, sequelize } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata: OperationObject = {
  summary: "Performs a withdraw transaction",
  description:
    "Initiates a withdraw transaction for the currently authenticated user",
  operationId: "createWithdraw",
  tags: ["Wallets"],
  requiresAuth: true,
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "Currency to withdraw",
            },
            chain: {
              type: "string",
              description: "Withdraw method ID",
            },
            amount: {
              type: "number",
              description: "Amount to withdraw",
            },
            toAddress: {
              type: "string",
              description: "Withdraw toAddress",
            },
          },
          required: ["currency", "chain", "amount", "toAddress"],
        },
      },
    },
  },
  responses: {
    200: {
      description: "Withdraw transaction initiated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Success message",
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Withdraw"),
    500: serverErrorResponse,
  },
};

export default async (data: Handler) => {
  const { user, body } = data;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { currency, chain, amount, toAddress, memo } = body;

  // Validate required fields
  if (!(amount && toAddress && currency)) {
    throw createError({ statusCode: 400, message: "Invalid input" });
  }

  const userPk = await models.user.findByPk(user.id);
  if (!userPk) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  const wallet = await models.wallet.findOne({
    where: { userId: user.id, currency, type: "SPOT" },
  });
  if (!wallet) {
    throw createError({ statusCode: 404, message: "Wallet not found" });
  }

  const currencyData = await models.exchangeCurrency.findOne({
    where: { currency: wallet.currency },
  });
  if (!currencyData) {
    throw createError({ statusCode: 404, message: "Currency not found" });
  }

  const parsedAmount = Math.abs(Number.parseFloat(amount));
  const percentageFee = currencyData.fee || 0;

  // Calculate the total fee amount based on the percentage
  const feeAmount = Number.parseFloat(
    Math.max((parsedAmount * percentageFee) / 100, 0).toFixed(
      currencyData.precision || 6
    )
  );

  // Calculate the total amount to lock (amount + fee)
  const totalToLock = parsedAmount + feeAmount;

  if (wallet.balance < totalToLock) {
    throw createError({ statusCode: 400, message: "Insufficient funds" });
  }

  // Internal Exchange: Create pending withdrawal and lock funds
  // All withdrawals require admin approval - no external API calls
  const result = await sequelize.transaction(async (t) => {
    // Lock funds: move from available balance to inOrder
    await wallet.update(
      {
        balance: wallet.balance - totalToLock,
        inOrder: (wallet.inOrder || 0) + totalToLock,
      },
      { transaction: t }
    );

    // Create pending withdrawal transaction
    const dbTransaction = await models.transaction.create(
      {
        userId: user.id,
        walletId: wallet.id,
        type: "WITHDRAW",
        amount: parsedAmount,
        fee: feeAmount,
        status: "PENDING",
        metadata: JSON.stringify({
          chain,
          currency,
          toAddress,
          memo,
        }),
        description: `Withdrawal of ${parsedAmount} ${wallet.currency} - Pending Admin Approval`,
      },
      { transaction: t }
    );

    // Record admin profit (will be finalized on approval)
    const adminProfit = await models.adminProfit.create(
      {
        amount: feeAmount,
        currency: wallet.currency,
        type: "WITHDRAW",
        transactionId: dbTransaction.id,
        chain,
        description: `Admin profit from user (${user.id}) withdrawal fee of ${feeAmount} ${wallet.currency} on ${chain} - Pending`,
      },
      { transaction: t }
    );

    return {
      dbTransaction,
      adminProfit,
      newBalance: wallet.balance - totalToLock,
    };
  });

  return {
    message: "Withdrawal request submitted and pending admin approval",
    transaction: result.dbTransaction,
    currency: wallet.currency,
    method: chain,
    balance: result.newBalance,
  };
};
