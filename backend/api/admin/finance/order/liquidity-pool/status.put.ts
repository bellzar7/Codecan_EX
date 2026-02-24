import { updateRecordResponses, updateStatus } from "@b/utils/query";

export const metadata = {
  summary: "Bulk updates the status of liquidity pools",
  operationId: "bulkUpdateLiquidityPoolStatus",
  tags: ["Admin", "Liquidity Pool"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              description: "Array of liquidity pool IDs to update",
              items: { type: "string" },
            },
            status: {
              type: "boolean",
              description:
                "New status to apply to the liquidity pools (true for active, false for inactive)",
            },
          },
          required: ["ids", "status"],
        },
      },
    },
  },
  responses: updateRecordResponses("Liquidity Pool"),
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { body } = data;
  const { ids, status } = body;
  return await updateStatus(
    "liquidityPool",
    ids,
    status === true || status === "true",
    "isActive"
  );
};