import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdOrderSchema } from "../utils";

/**
 * Normalize TWD order data to match SPOT order format
 * Converts DECIMAL string fields to JavaScript numbers for UI compatibility
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
  summary: "Get TWD Order by ID",
  operationId: "getTwdOrderById",
  tags: ["TWD", "Orders"],
  description: "Retrieves details of a specific TWD order.",
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the order to retrieve",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "TWD order details",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseTwdOrderSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Order"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, params } = data;

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const { id } = params;

  const order = await models.twdOrder.findOne({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!order) {
    throw new Error("TWD Order not found");
  }

  // Normalize DECIMAL fields to numbers for UI compatibility
  return normalizeTwdOrder(order.get({ plain: true }));
};
