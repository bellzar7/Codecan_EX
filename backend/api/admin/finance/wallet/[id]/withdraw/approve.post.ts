// Internal Exchange: Admin approval for withdrawals - no external API calls
import { userInclude } from "@b/api/auth/utils";
import { models, sequelize } from "@b/db";
import { sendSpotWalletWithdrawalConfirmationEmail } from "@b/utils/emails";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Approves a spot wallet withdrawal request",
  operationId: "approveSpotWalletWithdrawal",
  tags: ["Admin", "Wallets"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "The ID of the wallet withdrawal to approve",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Withdrawal request approved successfully",
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
  const { params } = data;
  const { id } = params;

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

  const { amount, fee, userId, walletId } = transaction;
  const metadata = transaction.metadata as Record<string, unknown>;

  // Fetch the user's wallet
  const wallet = await models.wallet.findOne({
    where: { id: walletId },
  });

  if (!wallet) {
    throw createError({ statusCode: 404, message: "Wallet not found" });
  }

  const totalAmount = Number(amount) + Number(fee || 0);

  // Verify funds are locked in inOrder
  if ((wallet.inOrder || 0) < totalAmount) {
    throw createError({
      statusCode: 400,
      message: "Insufficient locked funds for withdrawal",
    });
  }

  // Internal Exchange: Process withdrawal internally (no external API calls)
  // Simply finalize the balance deduction by removing from inOrder
  await sequelize.transaction(async (t) => {
    // Remove locked funds from inOrder (funds already deducted from balance when request was created)
    await wallet.update(
      {
        inOrder: (wallet.inOrder || 0) - totalAmount,
      },
      { transaction: t }
    );

    // Update transaction status to COMPLETED
    await models.transaction.update(
      {
        status: "COMPLETED",
        metadata: {
          ...metadata,
          approvedAt: new Date().toISOString(),
          note: "Withdrawal approved by admin - Internal processing",
        },
      },
      {
        where: { id },
        transaction: t,
      }
    );
  });

  // Fetch updated transaction for email
  const updatedTransaction = await models.transaction.findOne({
    where: { id },
  });

  if (!updatedTransaction) {
    throw createError({ statusCode: 500, message: "Transaction not found" });
  }

  // Send confirmation email
  try {
    const userData = (await getUserById(userId)) as unknown as User;
    const updatedWallet = await models.wallet.findOne({
      where: { id: walletId },
    });
    if (userData && updatedWallet) {
      await sendSpotWalletWithdrawalConfirmationEmail(
        userData,
        updatedTransaction.get({ plain: true }) as Transaction,
        updatedWallet.get({ plain: true }) as Wallet
      );
    }
  } catch (_emailError) {
    // Log but don't fail the operation if email fails
  }

  return {
    message: "Withdrawal approved successfully",
  };
};

// Get user by ID
export const getUserById = async (id: string) => {
  const user = await models.user.findOne({
    where: { id },
    include: userInclude,
  });
  if (!user) {
    throw new Error("User not found");
  }

  return {
    ...user.get({ plain: true }),
    password: undefined,
  };
};
