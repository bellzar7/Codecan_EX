import { models, sequelize } from "@b/db";
import { updateRecordResponses } from "@b/utils/query";
import { Op } from "sequelize";

export const metadata = {
  summary: "Updates the status of a TWD Provider",
  operationId: "updateTwdProviderStatus",
  tags: ["Admin", "TWD", "Provider"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the TWD provider to update",
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
  responses: updateRecordResponses("TWD Provider"),
  requiresAuth: true,
  permission: "Access TWD Provider Management",
};

export default async (data: Handler) => {
  const { body, params } = data;
  const { id } = params;
  const { status } = body;

  const transaction = await sequelize.transaction();

  try {
    // Deactivate all other TWD providers if status is true (only ONE active)
    if (status) {
      await models.twdProvider.update(
        { status: false },
        { where: { id: { [Op.ne]: id } }, transaction }
      );
    }

    // Update the status of the selected provider
    await models.twdProvider.update({ status }, { where: { id }, transaction });

    await transaction.commit();

    return {
      message: "TWD Provider status updated successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Failed to update TWD provider status: ${error.message}`);
  }
};
