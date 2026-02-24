import { getWallet } from "@b/api/finance/wallet/utils";
import { models } from "@b/db";
import {
  fromBigInt,
  fromBigIntMultiply,
  toBigIntFloat,
} from "@b/utils/eco/blockchain";
import { updateWalletBalance } from "@b/utils/eco/wallet";
import { createError } from "@b/utils/error";
import {
  cancelOrderByUuid,
  createOrder,
  getOrdersByUserId,
} from "@b/utils/futures/queries/order";
import { createRecordResponses } from "@b/utils/query";

export const metadata: OperationObject = {
  summary: "Creates a new futures trading order",
  description: "Submits a new futures trading order for the logged-in user.",
  operationId: "createFuturesOrder",
  tags: ["Futures", "Orders"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "Currency symbol (e.g., BTC)",
            },
            pair: { type: "string", description: "Pair symbol (e.g., USDT)" },
            type: {
              type: "string",
              description: "Order type, e.g., limit, market",
            },
            side: {
              type: "string",
              description: "Order side, either buy or sell",
            },
            amount: { type: "number", description: "Amount of the order" },
            price: {
              type: "number",
              description:
                "Price of the order (not required for market orders)",
            },
            leverage: {
              type: "number",
              description: "Leverage for the futures order",
            },
            stopLossPrice: {
              type: "number",
              description: "Stop loss price for the order",
              nullable: true,
            },
            takeProfitPrice: {
              type: "number",
              description: "Take profit price for the order",
              nullable: true,
            },
          },
          required: ["currency", "pair", "type", "side", "amount", "leverage"],
        },
      },
    },
  },
  responses: createRecordResponses("Order"),
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { body, user } = data;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const {
    currency,
    pair,
    amount,
    price,
    type,
    side,
    leverage,
    stopLossPrice,
    takeProfitPrice,
  } = body;

  console.log("price", price);
  if (!(currency && pair)) {
    throw new Error("Invalid symbol");
  }
  const symbol = `${currency}/${pair}`;

  try {
    const market = (await models.futuresMarket.findOne({
      where: { currency, pair },
    })) as any;

    if (!market) {
      throw new Error("Futures market data not found");
    }

    if (!market.metadata) {
      throw new Error("Futures market metadata not found");
    }

    const minAmount = Number(market.metadata?.limits?.amount?.min || 0);

    if (amount < minAmount) {
      throw new Error(`Amount is too low. You need ${minAmount} ${currency}`);
    }

    const precision =
      Number(
        side === "BUY"
          ? market.metadata.precision.amount
          : market.metadata.precision.price
      ) || 8;
    const feeRate =
      side === "BUY"
        ? Number(market.metadata.taker)
        : Number(market.metadata.maker);

    const feeCalculated = (amount * price * feeRate) / 100;
    const fee = Number.parseFloat(feeCalculated.toFixed(precision));
    const cost = amount * price;

    let pairWallet;
    try {
      pairWallet = await getWallet(user.id, "FUTURES", pair);
    } catch (_error) {}
    if (!pairWallet) {
      throw new Error(`Insufficient balance. You need ${cost + fee} ${pair}`);
    }

    const existingOrders = await getOrdersByUserId(user.id);

    for (const existingOrder of existingOrders) {
      if (
        existingOrder.symbol === symbol &&
        existingOrder.leverage === leverage &&
        fromBigInt(existingOrder.amount) === amount &&
        fromBigInt(existingOrder.price) === price &&
        existingOrder.side !== side &&
        existingOrder.status === "OPEN" &&
        fromBigInt(existingOrder.remaining) === amount
      ) {
        // Cancel the existing order and return the balance to the user's wallet
        await cancelOrderByUuid(
          existingOrder.userId,
          existingOrder.id,
          existingOrder.createdAt.toISOString(), // Convert Date to string
          symbol,
          existingOrder.price,
          existingOrder.side,
          existingOrder.remaining
        );

        // Return the balance to the user's wallet
        const refundAmount = fromBigIntMultiply(
          existingOrder.remaining + existingOrder.fee,
          existingOrder.price
        );

        await updateWalletBalance(pairWallet, refundAmount, "add");

        return {
          message:
            "Counter order detected and existing position closed successfully",
        };
      }
    }

    const newOrder = await createOrder({
      userId: user.id,
      symbol,
      amount: toBigIntFloat(amount),
      price: toBigIntFloat(price),
      cost: toBigIntFloat(cost),
      type,
      side,
      fee: toBigIntFloat(fee),
      feeCurrency: pair,
      leverage,
      stopLossPrice: stopLossPrice ? toBigIntFloat(stopLossPrice) : undefined,
      takeProfitPrice: takeProfitPrice
        ? toBigIntFloat(takeProfitPrice)
        : undefined,
    });

    const order = {
      ...newOrder,
      amount: fromBigInt(newOrder.amount),
      price: fromBigInt(newOrder.price),
      cost: fromBigInt(newOrder.cost),
      fee: fromBigInt(newOrder.fee),
      remaining: fromBigInt(newOrder.remaining),
      leverage,
      stopLossPrice: newOrder.stopLossPrice
        ? fromBigInt(newOrder.stopLossPrice)
        : undefined,
      takeProfitPrice: newOrder.takeProfitPrice
        ? fromBigInt(newOrder.takeProfitPrice)
        : undefined,
      filled: 0,
      average: 0,
    };

    // Subtract the cost and fee from the pair wallet
    await updateWalletBalance(pairWallet, cost + fee, "subtract");

    return {
      message: "Futures order created successfully",
      order,
    };
  } catch (error) {
    console.error("Error creating futures order:", error); // Log the error
    throw createError({
      statusCode: 500,
      message: `Failed to create futures order: ${error.message}`,
    });
  }
};
