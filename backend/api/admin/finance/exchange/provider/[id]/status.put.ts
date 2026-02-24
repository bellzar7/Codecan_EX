import { models } from "@b/db";
import { updateRecordResponses } from "@b/utils/query";

export const metadata = {
  summary: "Updates the status of an Exchange",
  operationId: "updateExchangeStatus",
  tags: ["Admin", "Exchanges"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the exchange to update",
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status: {
              type: "boolean",
              description:
                "New status to apply (true for active, false for inactive)",
            },
          },
          required: ["status"],
        },
      },
    },
  },
  responses: updateRecordResponses("Exchange"),
  requiresAuth: true,
  permission: "Access Exchange Provider Management",
};

export default async (data: Handler) => {
  const { body, params } = data;
  const { id } = params;
  const { status } = body;

  try {
    // Update the status of the selected exchange
    // Multiple exchanges can now be active simultaneously
    await models.exchange.update({ status }, { where: { id } });

    return {
      statusCode: 200,
      body: {
        message: "Exchange status updated successfully",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        message: "Failed to update exchange status",
        error: (error as Error).message,
      },
    };
  }
};
