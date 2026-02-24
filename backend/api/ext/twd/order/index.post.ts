import { models, sequelize } from "@b/db";
import { createRecordResponses } from "@b/utils/query";
import { RedisSingleton } from "@b/utils/redis";
import { getTwdWalletPair, updateWalletBalance } from "../utils";
import { calculateTwdFee } from "./utils";

const redis = RedisSingleton.getInstance();

/**
 * Normalize TWD order data to match SPOT order format
 * Converts DECIMAL string fields to JavaScript numbers for UI compatibility
 */
function normalizeTwdOrder(order: any) {
  return {
    ...order,
    price: order.price ? Number(order.price) : null,
    amount: order.amount ? Number(order.amount) : null,
    filled: order.filled ? Number(order.filled) : null,
    remaining: order.remaining ? Number(order.remaining) : null,
    cost: order.cost ? Number(order.cost) : null,
    fee: order.fee ? Number(order.fee) : null,
  };
}

export const metadata: OperationObject = {
  summary: "Create TWD Paper Trading Order",
  operationId: "createTwdOrder",
  tags: ["TWD", "Orders"],
  description:
    "Creates a new paper trading order for TWD markets (forex, stocks, indices).",
  requestBody: {
    description: "Order creation data",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "Trading symbol (e.g., EUR/USD, AAPL, SPX)",
            },
            type: {
              type: "string",
              enum: ["MARKET", "LIMIT"],
              description: "Order type",
            },
            side: {
              type: "string",
              enum: ["BUY", "SELL"],
              description: "Order side",
            },
            amount: {
              type: "number",
              description:
                "Amount to trade (in base currency for forex, shares for stocks)",
            },
            price: {
              type: "number",
              description: "Limit price (required for LIMIT orders)",
            },
          },
          required: ["symbol", "type", "side", "amount"],
        },
      },
    },
    required: true,
  },
  responses: createRecordResponses("TWD Order"),
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, body } = data;

  if (!user) {
    throw new Error("User not found");
  }

  try {
    // Step 1: Validate input
    const { symbol, type, side, amount, price } = body;

    if (!(symbol && type && side) || amount == null) {
      throw new Error("Missing required parameters");
    }

    const orderType = type.toUpperCase();
    const orderSide = side.toUpperCase();

    if (!["MARKET", "LIMIT"].includes(orderType)) {
      throw new Error("Invalid order type. Must be MARKET or LIMIT");
    }

    if (!["BUY", "SELL"].includes(orderSide)) {
      throw new Error("Invalid order side. Must be BUY or SELL");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    if (orderType === "LIMIT" && (price == null || price <= 0)) {
      throw new Error("Price must be greater than zero for LIMIT orders");
    }

    // Step 2: Check if market exists and is enabled
    const market = await models.twdMarket.findOne({
      where: { symbol, status: true },
    });

    if (!market) {
      throw new Error(`Market ${symbol} not found or not enabled`);
    }

    // Step 3: Get wallets for base and quote currencies
    // FOREX markets → FOREX wallets, STOCK markets → STOCK wallets, INDEX markets → INDEX wallets
    const { baseWallet, quoteWallet, baseCurrency, quoteCurrency } =
      await getTwdWalletPair(user.id, symbol, market.type);

    // Step 4: Determine execution price
    let executionPrice: number;
    let orderStatus: string;

    if (orderType === "MARKET") {
      // MARKET orders: fetch current price from Redis ticker cache (updated by eco-ws)
      const tickerKey = `twd:ticker:${symbol}`;
      const cached = await redis.get(tickerKey);

      if (!cached) {
        throw new Error(
          `Price not available for ${symbol}. Market data is not streaming. Please try again in a few moments.`
        );
      }

      try {
        const ticker = JSON.parse(cached);
        executionPrice = ticker.price;

        if (
          !executionPrice ||
          Number.isNaN(executionPrice) ||
          executionPrice <= 0
        ) {
          throw new Error(`Invalid price data for ${symbol}`);
        }

        console.log(
          `[TWD Order] Using cached price for ${symbol}: ${executionPrice}`
        );
      } catch (_parseError) {
        throw new Error(`Failed to parse price data for ${symbol}`);
      }

      orderStatus = "CLOSED"; // Market orders execute immediately
    } else {
      // LIMIT orders: use specified price, will execute later via cron
      executionPrice = price;
      orderStatus = "OPEN";
    }

    // Step 5: Calculate cost and fee
    const cost = amount * executionPrice;
    const fee = calculateTwdFee(amount, executionPrice);
    const feeCurrency = quoteCurrency; // Fee is always in quote currency

    // Step 6: Check wallet balance (same logic as Binance SPOT)
    if (orderSide === "BUY") {
      // BUY: need quote currency (e.g., USD for EUR/USD)
      const totalCost = cost + fee;
      if (quoteWallet.balance < totalCost) {
        throw new Error(
          `Insufficient ${quoteCurrency} balance. You need at least ${totalCost.toFixed(2)} ${quoteCurrency}. ` +
            `Current balance: ${quoteWallet.balance.toFixed(2)} ${quoteCurrency}`
        );
      }
    } else {
      // SELL: need base currency (e.g., EUR for EUR/USD)
      if (baseWallet.balance < amount) {
        throw new Error(
          `Insufficient ${baseCurrency} balance. You need at least ${amount.toFixed(6)} ${baseCurrency}. ` +
            `Current balance: ${baseWallet.balance.toFixed(6)} ${baseCurrency}`
        );
      }
    }

    // Step 7: Execute order in transaction (same as Binance SPOT)
    const result = await sequelize.transaction(async (transaction) => {
      if (orderSide === "BUY") {
        // BUY: Deduct from quote wallet
        const totalCost = cost + fee;
        await updateWalletBalance(
          quoteWallet.id,
          quoteWallet.balance - totalCost,
          transaction
        );

        // If MARKET order (immediate execution), credit base wallet
        if (orderType === "MARKET") {
          await updateWalletBalance(
            baseWallet.id,
            baseWallet.balance + amount,
            transaction
          );
        }
      } else {
        // SELL: Deduct from base wallet
        await updateWalletBalance(
          baseWallet.id,
          baseWallet.balance - amount,
          transaction
        );

        // If MARKET order (immediate execution), credit quote wallet
        if (orderType === "MARKET") {
          const proceeds = cost - fee;
          await updateWalletBalance(
            quoteWallet.id,
            quoteWallet.balance + proceeds,
            transaction
          );
        }
      }

      // Create order record
      const order = await models.twdOrder.create(
        {
          userId: user.id,
          symbol,
          type: orderType,
          side: orderSide,
          status: orderStatus,
          price: executionPrice,
          amount,
          filled: orderType === "MARKET" ? amount : 0,
          remaining: orderType === "MARKET" ? 0 : amount,
          cost,
          fee,
          feeCurrency,
        },
        { transaction }
      );

      return order.get({ plain: true });
    });

    // Normalize DECIMAL fields to numbers for UI compatibility
    const normalizedResult = normalizeTwdOrder(result);

    return {
      message: `${orderType} order ${orderStatus === "CLOSED" ? "executed" : "created"} successfully`,
      order: normalizedResult,
    };
  } catch (error) {
    console.error("Error creating TWD order:", {
      userId: user.id,
      body,
      error: error.message,
    });
    throw new Error(error.message);
  }
};
