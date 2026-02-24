import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseNumberSchema } from "@b/utils/schema";
import { liquidityPoolSchema } from "../utils";

export const metadata = {
  summary: "Deposits liquidity into a pool",
  operationId: "depositLiquidityPool",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool",
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            baseAmount: baseNumberSchema("Amount of base currency to deposit"),
            quoteAmount: baseNumberSchema(
              "Amount of quote currency to deposit"
            ),
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Liquidity deposited successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: liquidityPoolSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Liquidity Pool"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { params, body } = data;
  const { id } = params;
  const { baseAmount = 0, quoteAmount = 0 } = body;

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  if (baseAmount <= 0 && quoteAmount <= 0) {
    throw createError({
      statusCode: 400,
      message: "At least one amount must be greater than 0",
    });
  }

  // Record transactions and update balances
  interface TransactionRecord {
    poolId: string;
    type: string;
    currency: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
  }
  const transactions: TransactionRecord[] = [];

  if (baseAmount > 0) {
    const baseBefore = pool.baseBalance;
    const baseAfter = baseBefore + baseAmount;

    transactions.push({
      poolId: pool.id,
      type: "DEPOSIT",
      currency: pool.currency,
      amount: baseAmount,
      balanceBefore: baseBefore,
      balanceAfter: baseAfter,
      description: `Admin deposit of ${baseAmount} ${pool.currency}`,
    });

    pool.baseBalance = baseAfter;
  }

  if (quoteAmount > 0) {
    const quoteBefore = pool.quoteBalance;
    const quoteAfter = quoteBefore + quoteAmount;

    transactions.push({
      poolId: pool.id,
      type: "DEPOSIT",
      currency: pool.pair,
      amount: quoteAmount,
      balanceBefore: quoteBefore,
      balanceAfter: quoteAfter,
      description: `Admin deposit of ${quoteAmount} ${pool.pair}`,
    });

    pool.quoteBalance = quoteAfter;
  }

  // Save transactions
  await models.liquidityPoolTransaction.bulkCreate(transactions);

  // Save pool
  await pool.save();

  return {
    message: "Liquidity deposited successfully",
    pool,
  };
};
