import {
  baseBooleanSchema,
  baseDateTimeSchema,
  baseNumberSchema,
  baseStringSchema,
} from "@b/utils/schema";

// Schema definitions for liquidity pool
const id = baseStringSchema("ID of the liquidity pool");
const symbol = baseStringSchema("Trading pair symbol (e.g., BTC/USDT)");
const currency = baseStringSchema("Base currency of the pool");
const pair = baseStringSchema("Quote currency of the pool");
const baseBalance = baseNumberSchema("Balance of base currency in the pool");
const quoteBalance = baseNumberSchema("Balance of quote currency in the pool");
const baseInOrder = baseNumberSchema("Base currency locked in orders");
const quoteInOrder = baseNumberSchema("Quote currency locked in orders");
const spreadPercentage = baseNumberSchema(
  "Spread percentage applied to pool trades"
);
const minOrderSize = baseNumberSchema("Minimum order size the pool can fill");
const maxOrderSize = baseNumberSchema(
  "Maximum order size the pool can fill (0 = unlimited)"
);
const isActive = baseBooleanSchema("Whether the pool is active");
const createdAt = baseDateTimeSchema("Creation date of the pool");
const updatedAt = baseDateTimeSchema("Last update date of the pool");

export const liquidityPoolSchema = {
  id,
  symbol,
  currency,
  pair,
  baseBalance,
  quoteBalance,
  baseInOrder,
  quoteInOrder,
  spreadPercentage,
  minOrderSize,
  maxOrderSize,
  isActive,
  createdAt,
  updatedAt,
};

export const baseLiquidityPoolSchema = {
  id,
  symbol,
  currency,
  pair,
  baseBalance,
  quoteBalance,
  baseInOrder,
  quoteInOrder,
  spreadPercentage,
  minOrderSize,
  maxOrderSize,
  isActive,
  createdAt,
  updatedAt,
};

export const liquidityPoolCreateSchema = {
  type: "object",
  properties: {
    symbol,
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive,
  },
  required: ["symbol"],
};

export const liquidityPoolUpdateSchema = {
  type: "object",
  properties: {
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive,
  },
};

export const liquidityPoolDepositSchema = {
  type: "object",
  properties: {
    baseAmount: baseNumberSchema("Amount of base currency to deposit"),
    quoteAmount: baseNumberSchema("Amount of quote currency to deposit"),
  },
  required: [],
};

export const liquidityPoolWithdrawSchema = {
  type: "object",
  properties: {
    baseAmount: baseNumberSchema("Amount of base currency to withdraw"),
    quoteAmount: baseNumberSchema("Amount of quote currency to withdraw"),
  },
  required: [],
};

export const liquidityPoolStoreSchema = {
  description: "Liquidity Pool created or updated successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: baseLiquidityPoolSchema,
      },
    },
  },
};

// Transaction schema
const transactionId = baseStringSchema("ID of the transaction");
const poolId = baseStringSchema("ID of the liquidity pool");
const transactionType = baseStringSchema(
  "Type of transaction (DEPOSIT, WITHDRAW, TRADE_BUY, TRADE_SELL, ADJUSTMENT)"
);
const transactionCurrency = baseStringSchema("Currency of the transaction");
const amount = baseNumberSchema("Amount of the transaction");
const balanceBefore = baseNumberSchema("Balance before the transaction");
const balanceAfter = baseNumberSchema("Balance after the transaction");
const orderId = baseStringSchema(
  "Related order ID (if applicable)",
  255,
  0,
  true
);
const userId = baseStringSchema(
  "Related user ID (if applicable)",
  255,
  0,
  true
);
const description = baseStringSchema(
  "Description of the transaction",
  1000,
  0,
  true
);
const transactionCreatedAt = baseDateTimeSchema(
  "Creation date of the transaction"
);

export const liquidityPoolTransactionSchema = {
  id: transactionId,
  poolId,
  type: transactionType,
  currency: transactionCurrency,
  amount,
  balanceBefore,
  balanceAfter,
  orderId,
  userId,
  description,
  createdAt: transactionCreatedAt,
};
