// /server/api/admin/users/[id]/update.put.ts

import { models } from "@b/db";
import { createError } from "@b/utils/error";
import { hashPassword, validatePassword } from "@b/utils/passwords";
import { handleNotification } from "@b/utils/notifications";
import { RedisSingleton } from "@b/utils/redis";
import { updateRecordResponses } from "@b/utils/query";
import { userUpdateSchema } from "../utils";

export const metadata: OperationObject = {
  summary: "Updates a specific user by UUID",
  operationId: "updateUserByUuid",
  tags: ["Admin", "CRM", "User"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the user to update",
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: userUpdateSchema,
      },
    },
  },
  responses: updateRecordResponses("User"),
  requiresAuth: true,
  permission: "Access User Management",
};

export default async (data: Handler) => {
  console.log("data", data);
  const { params, body, user } = data;
  const { id } = params;
  const {
    firstName,
    lastName,
    email,
    roleId,
    avatar,
    phone,
    emailVerified,
    twoFactor,
    status,
    profile,
    password: rawPassword,
    customAddressWalletsPairFields,
    customRestrictionPairFields,
  } = body;

  // Parse customFields if it is a string
  let parsedCustomFields = customAddressWalletsPairFields;
  let parsedCustomRestrictionFields = customRestrictionPairFields;
  if (typeof customAddressWalletsPairFields === "string") {
    try {
      parsedCustomFields = JSON.parse(customAddressWalletsPairFields);
    } catch (_error) {
      throw new Error("Invalid JSON format for customFields");
    }
  }
  if (typeof customRestrictionPairFields === "string") {
    try {
      parsedCustomRestrictionFields = JSON.parse(customRestrictionPairFields);
    } catch (_error) {
      throw new Error("Invalid JSON format for customRestrictionPairFields");
    }
  }
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const userPk = await models.user.findOne({
    where: { id: user.id },
    include: [{ model: models.role, as: "role" }],
  });

  const existingUser = await models.user.findOne({
    where: { id },
    include: [{ model: models.role, as: "role" }],
  });
  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  if (existingUser.id === userPk.id && userPk.role.name !== "Super Admin") {
    throw createError({
      statusCode: 400,
      message: "You cannot update your own account",
    });
  }

  await models.user.update(
    {
      firstName,
      lastName,
      email,
      avatar,
      phone,
      emailVerified,
      status,
      profile,
      customAddressWalletsPairFields: parsedCustomFields,
      customRestrictionPairFields: parsedCustomRestrictionFields,
      ...(userPk.role.name === "Super Admin" && { roleId: roleId?.toString() }),
    },
    {
      where: { id },
    }
  );

  if (twoFactor) {
    await models.twoFactor.update(
      { enabled: false },
      { where: { userId: id } }
    );
  }

  if (rawPassword) {
    if (!validatePassword(rawPassword)) {
      throw createError(
        400,
        "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character"
      );
    }
    const hashedPassword = await hashPassword(rawPassword);
    await models.user.update({ password: hashedPassword }, { where: { id } });

    // Invalidate all user sessions
    const redis = RedisSingleton.getInstance();
    const sessionKeys = await redis.keys(`sessionId:${id}:*`);
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys);
    }

    // Notify the user
    await handleNotification({
      userId: id,
      type: "SECURITY",
      title: "Password Changed",
      message:
        "Your password has been changed by an administrator. If you did not request this, please contact support immediately.",
    });
  }

  return {
    message: "User updated successfully",
  };
};
