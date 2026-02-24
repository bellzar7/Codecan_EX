import { models } from "@b/db";
import { createError } from "@b/utils/error";
import { storeRecordResponses } from "@b/utils/query";
import { poolSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "Creates a new liquidity pool",
  operationId: "createLiquidityPool",
  tags: ["Admin", "Liquidity Pool"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: poolSchema,
          required: ["symbol", "currency", "pair"],
        },
      },
    },
  },
  responses: storeRecordResponses(poolSchema, "Liquidity Pool"),
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { body, user } = data;

  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized access" });
  }

  const {
    symbol,
    currency,
    pair,
    baseBalance = 0,
    quoteBalance = 0,
    spreadPercentage = 0.1,
    minOrderSize = 0,
    maxOrderSize = 0,
    isActive,
  } = body;

  const isActiveBoolean = isActive === true || isActive === "true";

  const existingPool = await models.liquidityPool.findOne({
    where: { symbol },
  });

  if (existingPool) {
    throw createError({
      statusCode: 400,
      message: "Liquidity pool with this symbol already exists",
    });
  }

  const pool = await models.liquidityPool.create({
    symbol,
    currency,
    pair,
    baseBalance,
    quoteBalance,
    baseInOrder: 0,
    quoteInOrder: 0,
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive: isActiveBoolean,
  });

  return {
    message: "Liquidity pool created successfully",
    data: pool,
  };
};
