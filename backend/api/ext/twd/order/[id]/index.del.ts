import { models, sequelize } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { getTwdWalletPair, updateWalletBalance } from "../../utils";

export const metadata: OperationObject = {
  summary: "Cancel TWD Order",
  operationId: "cancelTwdOrder",
  tags: ["TWD", "Orders"],
  description:
    "Cancels a specific OPEN TWD order and refunds the reserved balance.",
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the order to cancel",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Order canceled successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Order canceled successfully",
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Order"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, params } = data;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const { id } = params;

  try {
    // Find the order
    const order = await models.twdOrder.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!order) {
      throw new Error("TWD Order not found");
    }

    if (order.status !== "OPEN") {
      throw new Error("Only OPEN orders can be canceled");
    }

    // Get market to determine wallet type
    const market = await models.twdMarket.findOne({
      where: { symbol: order.symbol },
    });

    if (!market) {
      throw new Error(`Market ${order.symbol} not found`);
    }

    // Get wallets for the symbol using correct wallet type based on market type
    const { baseWallet, quoteWallet } = await getTwdWalletPair(
      user.id,
      order.symbol,
      market.type
    );

    // Cancel order in transaction
    await sequelize.transaction(async (transaction) => {
      // Refund reserved balance based on order side (same as Binance SPOT)
      if (order.side === "BUY") {
        // BUY orders had quote currency reserved - refund to quote wallet
        const cost = Number(order.amount) * Number(order.price);
        const fee = Number(order.fee);
        const refundAmount = cost + fee;

        await updateWalletBalance(
          quoteWallet.id,
          quoteWallet.balance + refundAmount,
          transaction
        );
      } else {
        // SELL orders had base currency reserved - refund to base wallet
        const refundAmount = Number(order.amount);

        await updateWalletBalance(
          baseWallet.id,
          baseWallet.balance + refundAmount,
          transaction
        );
      }

      // Update order status to CANCELED
      await models.twdOrder.update(
        {
          status: "CANCELED",
        },
        {
          where: { id },
          transaction,
        }
      );
    });

    return {
      message: "Order canceled successfully",
    };
  } catch (error) {
    console.error("Error canceling TWD order:", {
      userId: user.id,
      orderId: id,
      error: error.message,
    });
    throw new Error(error.message);
  }
};
