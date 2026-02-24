import { baseNumberSchema, baseStringSchema } from "@b/utils/schema";

export const baseTwdOrderSchema = {
  id: baseStringSchema("Order ID"),
  userId: baseStringSchema("User ID"),
  symbol: baseStringSchema("Trading symbol"),
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
  status: {
    type: "string",
    enum: ["OPEN", "CLOSED", "CANCELED", "EXPIRED", "REJECTED"],
    description: "Order status",
  },
  price: baseNumberSchema("Order price"),
  amount: baseNumberSchema("Order amount"),
  filled: baseNumberSchema("Filled amount"),
  remaining: baseNumberSchema("Remaining amount"),
  cost: baseNumberSchema("Total cost"),
  fee: baseNumberSchema("Trading fee"),
  feeCurrency: {
    ...baseStringSchema("Fee currency"),
    nullable: true,
  },
  createdAt: {
    type: "string",
    format: "date-time",
    description: "Creation timestamp",
  },
  updatedAt: {
    type: "string",
    format: "date-time",
    description: "Last update timestamp",
  },
};

/**
 * Calculate trading fee for TWD orders
 * Default fee rate: 0.1% (0.001)
 */
export function calculateTwdFee(amount: number, price: number): number {
  const feeRate = Number.parseFloat(process.env.TWD_FEE_RATE || "0.001"); // 0.1%
  const cost = amount * price;
  return cost * feeRate;
}
