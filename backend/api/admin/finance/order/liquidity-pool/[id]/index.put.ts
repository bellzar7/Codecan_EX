import { models } from "@b/db";
import { createError } from "@b/utils/error";
import { updateRecordResponses } from "@b/utils/query";
import { poolSchema } from "../utils";

export const metadata: OperationObject = {
  summary: "Update a liquidity pool",
  operationId: "updateLiquidityPool",
  tags: ["Admin", "Liquidity Pool"],
  parameters: [
    {
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
          properties: poolSchema,
        },
      },
    },
  },
  responses: updateRecordResponses("Liquidity Pool"),
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { body, params, user } = data;
  const { id } = params;

  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized access" });
  }

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  const {
    symbol,
    currency,
    pair,
    baseBalance,
    quoteBalance,
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive,
  } = body;

  const isActiveBoolean =
    isActive !== undefined
      ? isActive === true || isActive === "true"
      : undefined;

  if (symbol && symbol !== pool.symbol) {
    const existingPool = await models.liquidityPool.findOne({
      where: { symbol },
    });

    if (existingPool) {
      throw createError({
        statusCode: 400,
        message: "Liquidity pool with this symbol already exists",
      });
    }
  }

  await pool.update({
    symbol: symbol ?? pool.symbol,
    currency: currency ?? pool.currency,
    pair: pair ?? pool.pair,
    baseBalance: baseBalance ?? pool.baseBalance,
    quoteBalance: quoteBalance ?? pool.quoteBalance,
    spreadPercentage: spreadPercentage ?? pool.spreadPercentage,
    minOrderSize: minOrderSize ?? pool.minOrderSize,
    maxOrderSize: maxOrderSize ?? pool.maxOrderSize,
    isActive: isActiveBoolean ?? pool.isActive,
  });

  return {
    message: "Liquidity pool updated successfully",
    data: pool,
  };
};
