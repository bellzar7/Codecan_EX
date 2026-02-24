import { baseBooleanSchema, baseStringSchema } from "@b/utils/schema";

export const baseTwdMarketSchema = {
  id: baseStringSchema("ID of the TWD market"),
  symbol: baseStringSchema("Symbol of the TWD market"),
  type: {
    type: "string",
    enum: ["forex", "stocks", "indices"],
    description: "Type of the market",
  },
  name: baseStringSchema("Name of the TWD market"),
  currency: baseStringSchema("Base currency"),
  pair: {
    ...baseStringSchema("Quote currency (for forex)"),
    nullable: true,
  },
  exchange: {
    ...baseStringSchema("Exchange (for stocks)"),
    nullable: true,
  },
  isTrending: {
    ...baseBooleanSchema("Trending status"),
    nullable: true,
  },
  isHot: {
    ...baseBooleanSchema("Hot status"),
    nullable: true,
  },
  status: baseBooleanSchema("Market status"),
};
