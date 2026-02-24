import { baseBooleanSchema, baseStringSchema } from "@b/utils/schema";

const id = baseStringSchema("ID of the TWD market");
const symbol = baseStringSchema("Symbol of the TWD market", 191);
const type = {
  type: "string",
  enum: ["forex", "stocks", "indices"],
  description: "Type of the TWD market (forex, stocks, or indices)",
};
const name = baseStringSchema("Name of the TWD market", 191);
const currency = baseStringSchema("Base currency of the TWD market", 191);
const pair = {
  ...baseStringSchema("Quote currency (for forex pairs)", 191),
  nullable: true,
};
const exchange = {
  ...baseStringSchema("Exchange name (for stocks)", 50),
  nullable: true,
};
const metadata = {
  type: "object",
  nullable: true,
  description: "Additional metadata for the market",
};
const isTrending = {
  ...baseBooleanSchema("Indicates if the market is currently trending"),
  nullable: true,
};
const isHot = {
  ...baseBooleanSchema("Indicates if the market is considered 'hot'"),
  nullable: true,
};
const status = baseBooleanSchema("Operational status of the market");

export const twdMarketSchema = {
  id,
  symbol,
  type,
  name,
  currency,
  pair,
  exchange,
  metadata,
  isTrending,
  isHot,
  status,
};

export const baseTwdMarketSchema = {
  id,
  symbol,
  type,
  name,
  currency,
  pair,
  exchange,
  metadata,
  isTrending,
  isHot,
  status,
};

export const TwdMarketUpdateSchema = {
  type: "object",
  properties: {
    name,
    isTrending,
    isHot,
    metadata,
  },
};

export const TwdMarketStoreSchema = {
  description: "TWD Market created or updated successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: baseTwdMarketSchema,
      },
    },
  },
};
