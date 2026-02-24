import { models } from "@b/db";
import { sendMessageToRoute } from "@b/handler/Websocket";
import { createError } from "@b/utils/error";

const path = "/api/finance/deposit/spot";
export const metadata = {};

// INTERNAL EXCHANGE MODE: External API verification is disabled
// Deposits are now approved manually by admin through the transaction management interface
// This WebSocket endpoint now only provides status updates for pending deposits

export default async (data: Handler, rawMessage: unknown) => {
  const { user } = data;
  if (!user?.id) {
    throw createError(401, "Unauthorized");
  }
  const message =
    typeof rawMessage === "string"
      ? JSON.parse(rawMessage)
      : (rawMessage as { payload: { trx: string } });
  const { trx } = message.payload;

  const transaction = await models.transaction.findOne({
    where: { referenceId: trx, userId: user.id, type: "DEPOSIT" },
  });

  if (!transaction) {
    return sendMessage(message.payload, {
      status: 404,
      message: "Transaction not found",
    });
  }

  // INTERNAL MODE: Return current transaction status without external API verification
  // Admin will manually approve deposits through the admin panel
  const wallet = await models.wallet.findByPk(transaction.walletId);

  let metadata: Record<string, unknown> = {};
  if (transaction.metadata) {
    try {
      metadata =
        typeof transaction.metadata === "string"
          ? JSON.parse(transaction.metadata)
          : transaction.metadata;
    } catch {
      metadata = {};
    }
  }

  if (transaction.status === "COMPLETED") {
    return sendMessage(message.payload, {
      status: 200,
      message: "Transaction completed",
      transaction,
      balance: wallet?.balance ?? 0,
      currency: wallet?.currency ?? "",
      chain: metadata.chain ?? "",
      method: "Manual Approval",
    });
  }

  // For pending transactions, inform user to wait for admin approval
  return sendMessage(message.payload, {
    status: 202,
    message: "Deposit pending admin approval. Please wait for confirmation.",
    transaction,
    balance: wallet?.balance ?? 0,
    currency: wallet?.currency ?? "",
    chain: metadata.chain ?? "",
    method: "Manual Approval",
  });
};

const sendMessage = (payload: unknown, data: unknown): void => {
  try {
    sendMessageToRoute(path, payload, {
      stream: "verification",
      data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send message: ${errorMessage}`);
  }
};

// INTERNAL EXCHANGE MODE: The following functions are preserved but no longer used
// They are kept for reference in case external API verification needs to be re-enabled

// Helper function to update wallet balance (used by admin approval flow)
export async function updateSpotWalletBalance(
  userId: string,
  currency: string,
  amount: number,
  fee: number,
  type: "DEPOSIT" | "WITHDRAWAL" | "REFUND_WITHDRAWAL"
): Promise<walletAttributes | Error> {
  const wallet = await models.wallet.findOne({
    where: {
      userId,
      currency,
      type: "SPOT",
    },
  });

  if (!wallet) {
    return new Error("Wallet not found");
  }

  let balance: number;
  switch (type) {
    case "WITHDRAWAL":
      balance = wallet.balance - (amount + fee);
      break;
    case "DEPOSIT":
      balance = wallet.balance + (amount - fee);
      break;
    case "REFUND_WITHDRAWAL":
      balance = wallet.balance + amount + fee;
      break;
    default:
      balance = wallet.balance;
      break;
  }

  if (balance < 0) {
    throw new Error("Insufficient balance");
  }

  await models.wallet.update(
    {
      balance,
    },
    {
      where: {
        id: wallet.id,
      },
    }
  );

  const updatedWallet = await models.wallet.findByPk(wallet.id);

  if (!updatedWallet) {
    throw new Error("Wallet not found");
  }

  return updatedWallet.get({ plain: true }) as walletAttributes;
}
