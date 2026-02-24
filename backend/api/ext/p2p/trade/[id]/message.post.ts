import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata: OperationObject = {
  summary: "Update a P2P trade message",
  description: "Updates the message of a P2P trade.",
  operationId: "updateTradeMessage",
  tags: ["P2P", "Trade"],
  requiresAuth: true,
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", description: "ID of the trade" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            txHash: {
              type: "string",
              description: "Message to be added to the trade",
            },
          },
          required: ["message"],
        },
      },
    },
  },
  responses: {
    200: {
      description: "Trade marked as paid successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID of the trade" },
              status: { type: "string", description: "Status of the trade" },
              txHash: {
                type: "string",
                description: "Message to be added to the trade",
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("P2P Trade"),
    500: serverErrorResponse,
  },
};

export default async (data: Handler) => {
  const { params, body, user } = data;
  console.log("data in message", data);
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const { id } = params;
  console.log("id", id);
  const { message } = body;

  try {
    console.log("before console trade check", id);
    const trade = await models.p2pTrade.findByPk(id, {
      raw: true,
      include: [
        {
          model: models.p2pOffer,
          as: "offer",
          attributes: ["id", "status", "currency"],
          includeModels: [
            {
              model: models.p2pPaymentMethod,
              as: "paymentMethod",
            },
          ],
        },
        {
          model: models.user,
          as: "seller",
          attributes: ["email", "avatar", "firstName", "lastName", "lastLogin"],
        },
        {
          model: models.user,
          as: "user",
          attributes: ["email", "avatar", "firstName", "lastName", "lastLogin"],
        },
      ],
    });
    console.log("trades after check", trade);
    const messages: ChatMessage[] = trade.messages || [];

    messages.push(message);
    trade.messages = messages;

    console.log("trade.messages1", trade.messages);
    try {
      const resp = await models.p2pTrade.update(
        {
          messages: [...messages],
        },
        { where: { id } }
      );
      console.log("trade.messages2", trade);
      if (resp) {
        const updatedTrade = await models.p2pTrade.findByPk(id, {
          raw: true,
          include: [
            {
              model: models.p2pOffer,
              as: "offer",
              attributes: ["id", "status", "currency"],
              includeModels: [
                {
                  model: models.p2pPaymentMethod,
                  as: "paymentMethod",
                },
              ],
            },
            {
              model: models.user,
              as: "seller",
              attributes: [
                "email",
                "avatar",
                "firstName",
                "lastName",
                "lastLogin",
              ],
            },
            {
              model: models.user,
              as: "user",
              attributes: [
                "email",
                "avatar",
                "firstName",
                "lastName",
                "lastLogin",
              ],
            },
          ],
        });
        console.log("updatedTrade", updatedTrade);
      }

      console.log("resp2", resp);
    } catch (e) {
      console.log("resp e", e);
    }

    return trade;
  } catch (error) {
    if (error.statusCode) {
      return { error: error.message };
    }
    return { error: "Failed to mark trade as paid" };
  }
};
