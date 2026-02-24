import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdOrderSchema } from "./utils";

/**
 * Normalize TWD order data to match SPOT order format
 * Converts DECIMAL string fields to JavaScript numbers for UI compatibility
 *
 * SPOT orders use DOUBLE type (returned as numbers)
 * TWD orders use DECIMAL(30,15) type (returned as strings by Sequelize)
 * This function ensures both have the same data structure
 */
function normalizeTwdOrder(order: any) {
  return {
    ...order,
    price: order.price ? Number(order.price) : null,
    amount: order.amount ? Number(order.amount) : null,
    filled: order.filled ? Number(order.filled) : null,
    remaining: order.remaining ? Number(order.remaining) : null,
    cost: order.cost ? Number(order.cost) : null,
    fee: order.fee ? Number(order.fee) : null,
  };
}

export const metadata: OperationObject = {
  summary: "List TWD Orders",
  operationId: "listTwdOrders",
  tags: ["TWD", "Orders"],
  description:
    "Retrieves a list of TWD paper trading orders for the authenticated user.",
  parameters: [
    {
      name: "status",
      in: "query",
      description: "Filter by order status (OPEN, CLOSED, CANCELED)",
      schema: { type: "string", enum: ["OPEN", "CLOSED", "CANCELED"] },
      required: false,
    },
    {
      name: "symbol",
      in: "query",
      description: "Filter by trading symbol",
      schema: { type: "string" },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "A list of TWD orders",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: baseTwdOrderSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Orders"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, query } = data;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const { status, symbol } = query;

  const where: any = {
    userId: user.id,
  };

  if (status) {
    where.status = status.toUpperCase();
  }

  if (symbol) {
    where.symbol = symbol;
  }

  const orders = await models.twdOrder.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  // Normalize DECIMAL fields to numbers for UI compatibility
  return orders.map((order) => normalizeTwdOrder(order.get({ plain: true })));
};
