// /api/admin/exchange/orders/[id]/update.put.ts
import { models, sequelize } from "@b/db";
import { createError } from "@b/utils/error";
import { updateRecordResponses } from "@b/utils/query";
import { SpotWalletManager } from "@b/utils/spot/walletManager";
import type { Transaction } from "sequelize";
import { exchangeOrderUpdateSchema } from "../utils";

export const metadata = {
  summary: "Updates an existing exchange order",
  operationId: "updateExchangeOrder",
  tags: ["Admin", "Exchange Orders"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      description: "The ID of the exchange order to update",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  requestBody: {
    required: true,
    description: "Updated data for the exchange order",
    content: {
      "application/json": {
        schema: exchangeOrderUpdateSchema,
      },
    },
  },
  responses: updateRecordResponses("Exchange Order"),
  requiresAuth: true,
  permission: "Access Exchange Order Management",
};

interface OrderCompletionParams {
  userId: string;
  baseCurrency: string;
  quoteCurrency: string;
  side: string;
  amount: number;
  price: number;
  fee: number;
  feeCurrency: string;
}

async function handleBuyOrderCompletion(
  params: OrderCompletionParams,
  walletManager: SpotWalletManager,
  transaction: Transaction
): Promise<void> {
  const { userId, baseCurrency, quoteCurrency, amount, price, fee, feeCurrency } = params;
  const cost = amount * price;

  // Release locked quote currency and deduct the actual cost
  await walletManager.releaseFunds(userId, quoteCurrency, cost, transaction);
  await walletManager.deductBalance(userId, quoteCurrency, cost, transaction);

  // Add base currency (minus fee if fee is in base currency)
  const netBaseAmount = feeCurrency === baseCurrency ? amount - fee : amount;
  await walletManager.addBalance(userId, baseCurrency, netBaseAmount, transaction);

  // If fee is in quote currency, deduct it
  const shouldDeductQuoteFee = feeCurrency === quoteCurrency && fee > 0;
  if (shouldDeductQuoteFee) {
    await walletManager.deductBalance(userId, quoteCurrency, fee, transaction);
  }
}

async function handleSellOrderCompletion(
  params: OrderCompletionParams,
  walletManager: SpotWalletManager,
  transaction: Transaction
): Promise<void> {
  const { userId, baseCurrency, quoteCurrency, amount, price, fee, feeCurrency } = params;
  const cost = amount * price;

  // Release locked base currency and deduct the actual amount
  await walletManager.releaseFunds(userId, baseCurrency, amount, transaction);
  await walletManager.deductBalance(userId, baseCurrency, amount, transaction);

  // Add quote currency (minus fee if fee is in quote currency)
  const netQuoteAmount = feeCurrency === quoteCurrency ? cost - fee : cost;
  await walletManager.addBalance(userId, quoteCurrency, netQuoteAmount, transaction);

  // If fee is in base currency, deduct it
  const shouldDeductBaseFee = feeCurrency === baseCurrency && fee > 0;
  if (shouldDeductBaseFee) {
    await walletManager.deductBalance(userId, baseCurrency, fee, transaction);
  }
}

async function recordAdminProfit(
  fee: number,
  feeCurrency: string,
  transaction: Transaction
): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingProfit = await models.adminProfit.findOne({
      where: {
        type: "EXCHANGE_ORDER",
        currency: feeCurrency,
        createdAt: {
          [models.Sequelize.Op.gte]: today,
        },
      },
      transaction,
    });

    if (existingProfit) {
      await models.adminProfit.update(
        {
          amount: sequelize.literal(`amount + ${fee}`),
        },
        {
          where: { id: existingProfit.id },
          transaction,
        }
      );
    } else {
      await models.adminProfit.create(
        {
          type: "EXCHANGE_ORDER",
          amount: fee,
          currency: feeCurrency,
          description: `Exchange order fees collected for ${feeCurrency}`,
        },
        { transaction }
      );
    }
  } catch (profitError) {
    // Log but don't fail the order update if adminProfit table doesn't exist
    console.warn("Could not record admin profit:", profitError.message);
  }
}

async function handleOrderCompletion(
  params: OrderCompletionParams,
  transaction: Transaction
): Promise<void> {
  const walletManager = SpotWalletManager.getInstance();

  if (params.side === "BUY") {
    await handleBuyOrderCompletion(params, walletManager, transaction);
  } else if (params.side === "SELL") {
    await handleSellOrderCompletion(params, walletManager, transaction);
  }

  await recordAdminProfit(params.fee, params.feeCurrency, transaction);
}

async function processOrderUpdate(
  order: Record<string, unknown> & { update: (data: Record<string, unknown>, options: { transaction: Transaction }) => Promise<unknown> },
  body: Record<string, unknown>,
  transaction: Transaction
): Promise<void> {
  const { referenceId, status, side, price, amount, fee, feeCurrency, symbol } = body;
  const previousStatus = order.status as string;
  const newStatus = (status as string) || previousStatus;
  const isClosingOrder = previousStatus !== "CLOSED" && newStatus === "CLOSED";

  if (isClosingOrder) {
    const orderSymbol = (symbol as string) || (order.symbol as string);
    const currencies = orderSymbol.split("/");
    const baseCurrency = currencies[0];
    const quoteCurrency = currencies[1];
    const hasValidCurrencies = Boolean(baseCurrency && quoteCurrency);

    if (!hasValidCurrencies) {
      throw createError({
        statusCode: 400,
        message: "Invalid symbol format. Expected format: BASE/QUOTE",
      });
    }

    const completionParams: OrderCompletionParams = {
      userId: order.userId as string,
      baseCurrency,
      quoteCurrency,
      side: (side as string) || (order.side as string),
      amount: (amount as number) || (order.amount as number),
      price: (price as number) || (order.price as number),
      fee: (fee as number) || (order.fee as number),
      feeCurrency: ((feeCurrency as string) || (order.feeCurrency as string)) as string,
    };

    await handleOrderCompletion(completionParams, transaction);
  }

  await order.update(
    {
      referenceId: referenceId ?? order.referenceId,
      status: newStatus,
      side: side ?? order.side,
      price: price ?? order.price,
      amount: amount ?? order.amount,
      fee: fee ?? order.fee,
      feeCurrency: feeCurrency ?? order.feeCurrency,
      symbol: symbol ?? order.symbol,
    },
    { transaction }
  );
}

export default async (data: Handler) => {
  const { body, params, user } = data;
  const { id } = params;

  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized access" });
  }

  const transaction = await sequelize.transaction();

  try {
    const order = await models.exchangeOrder.findByPk(id, { transaction });

    if (!order) {
      await transaction.rollback();
      throw createError({
        statusCode: 404,
        message: "Exchange order not found",
      });
    }

    await processOrderUpdate(order, body, transaction);
    await transaction.commit();

    return {
      message: "Exchange order updated successfully",
      data: order,
    };
  } catch (error) {
    await transaction.rollback();
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to update exchange order",
    });
  }
};
