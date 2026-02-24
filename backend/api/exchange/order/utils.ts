import { models } from "@b/db";

export interface OrderData {
  status: string;
  filled?: number;
  remaining?: number;
  cost?: number;
  fee?: { cost?: number };
  trades?: unknown;
  average?: number;
}

export interface ExchangeOrder {
  id: string;
  side?: string;
  status?: string;
  symbol?: string;
  price?: number;
  amount: string | number;
  cost: string | number;
  filled?: number;
  remaining?: number;
  timestamp?: number;
  fee?: { cost?: string | number };
  info?: {
    avgPrice?: string;
    executedQty?: string;
  };
}

export interface AdjustedOrder {
  id: string;
  side?: string;
  status?: string;
  symbol?: string;
  price?: number;
  amount: number;
  cost: number;
  filled?: number;
  remaining?: number;
  timestamp?: number;
  fee: number;
  info?: {
    avgPrice?: string;
    executedQty?: string;
  };
}

export async function updateOrderData(id: string, orderData: OrderData) {
  const updateData: Record<string, unknown> = {
    status: orderData.status.toUpperCase(),
    filled: orderData.filled,
    remaining: orderData.remaining,
    cost: orderData.cost,
    fee: orderData.fee?.cost,
    trades: orderData.trades,
    average: orderData.average,
  };

  // Remove undefined properties
  const filteredUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined)
  );

  await models.exchangeOrder.update(filteredUpdateData, {
    where: {
      id,
    },
  });

  const updatedOrder = await models.exchangeOrder.findOne({
    where: {
      id,
    },
  });

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  return updatedOrder.get({ plain: true });
}

import { baseNumberSchema, baseStringSchema } from "@b/utils/schema";

export const baseOrderSchema = {
  id: baseStringSchema("Unique identifier for the order"),
  referenceId: baseStringSchema("External reference ID for the order"),
  userId: baseStringSchema("User ID associated with the order"),
  status: baseStringSchema("Status of the order (e.g., pending, completed)"),
  symbol: baseStringSchema("Trading symbol for the order"),
  type: baseStringSchema("Type of order (e.g., market, limit)"),
  timeInForce: baseStringSchema("Time in force policy for the order"),
  side: baseStringSchema("Order side (buy or sell)"),
  price: baseNumberSchema("Price per unit"),
  average: baseNumberSchema("Average price per unit"),
  amount: baseNumberSchema("Total amount ordered"),
  filled: baseNumberSchema("Amount filled"),
  remaining: baseNumberSchema("Amount remaining"),
  cost: baseNumberSchema("Total cost"),
  trades: {
    type: "object",
    description: "Details of trades executed for this order",
    additionalProperties: true,
  },
  fee: baseNumberSchema("Transaction fee"),
  feeCurrency: baseStringSchema("Currency of the transaction fee"),
  createdAt: baseStringSchema("Creation date of the order"),
  updatedAt: baseStringSchema("Last update date of the order"),
};

function parseNumericValue(value: string | number): number {
  return typeof value === "string" ? Number.parseFloat(value) : Number(value);
}

export function adjustOrderData(
  order: ExchangeOrder,
  provider: string | null,
  feeRate: number
): AdjustedOrder {
  const side = order.side ? order.side.toUpperCase() : null;
  let amount = parseNumericValue(order.amount);
  let cost = parseNumericValue(order.cost);
  let fee = order.fee?.cost ? parseNumericValue(order.fee.cost) : 0;

  if (provider === "xt" && order.info) {
    const info = order.info;
    const avgPrice = info.avgPrice ? Number.parseFloat(info.avgPrice) : 0;
    const executedQty = info.executedQty
      ? Number.parseFloat(info.executedQty)
      : 0;

    if (side === "BUY") {
      amount = avgPrice > 0 ? executedQty / avgPrice : 0;
    } else if (side === "SELL") {
      amount = executedQty;
    }
    cost = amount * avgPrice;

    // Calculate fee based on amount
    const calculatedFee = amount * (feeRate / 100);
    fee = Number.parseFloat(calculatedFee.toFixed(8));
  } else if (amount && feeRate) {
    fee = Number.parseFloat((amount * (feeRate / 100)).toFixed(8));
  }

  return {
    ...order,
    amount,
    cost,
    fee,
  };
}
