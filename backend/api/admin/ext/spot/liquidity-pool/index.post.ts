import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseNumberSchema, baseStringSchema } from "@b/utils/schema";
import { liquidityPoolSchema } from "./utils";

export const metadata = {
  summary: "Creates a new liquidity pool",
  operationId: "createLiquidityPool",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            currency: baseStringSchema("Base currency symbol (e.g., BTC)"),
            pair: baseStringSchema("Quote currency symbol (e.g., USDT)"),
            baseBalance: baseNumberSchema("Initial base currency balance"),
            quoteBalance: baseNumberSchema("Initial quote currency balance"),
            adminPrice: baseNumberSchema("Admin-set price (optional)"),
            priceSource: {
              type: "string",
              enum: ["BINANCE", "TWD", "ADMIN", "ORDERBOOK"],
              description: "Price source for the pool",
            },
            minOrderSize: baseNumberSchema("Minimum order size"),
            maxOrderSize: baseNumberSchema("Maximum order size"),
            spreadPercentage: baseNumberSchema("Spread percentage"),
            status: {
              type: "boolean",
              description: "Pool status (active/inactive)",
            },
          },
          required: ["currency", "pair"],
        },
      },
    },
  },
  responses: {
    200: {
      description: "Liquidity pool created successfully",
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
  const { body } = data;
  const {
    currency,
    pair,
    baseBalance = 0,
    quoteBalance = 0,
    adminPrice,
    priceSource = "BINANCE",
    minOrderSize = 0,
    maxOrderSize,
    spreadPercentage = 0,
    status = true,
  } = body;

  // Check if pool already exists for this pair
  const existingPool = await models.liquidityPool.findOne({
    where: { currency, pair },
  });

  if (existingPool) {
    throw createError({
      statusCode: 400,
      message: `Liquidity pool for ${currency}/${pair} already exists`,
    });
  }

  // Create the pool
  const pool = await models.liquidityPool.create({
    currency,
    pair,
    baseBalance,
    quoteBalance,
    adminPrice,
    priceSource,
    minOrderSize,
    maxOrderSize,
    spreadPercentage,
    status,
  });

  return {
    message: "Liquidity pool created successfully",
    pool,
  };
};
