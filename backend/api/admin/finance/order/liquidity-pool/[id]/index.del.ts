import { models } from "@b/db";
import { createError } from "@b/utils/error";
import { deleteRecordResponses } from "@b/utils/query";

export const metadata: OperationObject = {
  summary: "Delete a liquidity pool",
  operationId: "deleteLiquidityPool",
  tags: ["Admin", "Liquidity Pool"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID of the liquidity pool",
      schema: { type: "string" },
    },
  ],
  responses: deleteRecordResponses("Liquidity Pool"),
  requiresAuth: true,
  permission: "Access Liquidity Pool Management",
};

export default async (data: Handler) => {
  const { params, user } = data;
  const { id } = params;

  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized access" });
  }

  const pool = await models.liquidityPool.findByPk(id);

  if (!pool) {
    throw createError({
      statusCode: 404,
      message: "Liquidity pool not found",
    });
  }

  await pool.destroy();

  return {
    message: "Liquidity pool deleted successfully",
  };
};
