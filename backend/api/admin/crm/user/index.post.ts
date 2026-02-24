// /server/api/admin/users/index.post.ts

import { models } from "@b/db";
import { createError } from "@b/utils/error";
import {
  hashPassword,
  validatePassword,
  generateNewPassword,
} from "@b/utils/passwords";
import { storeRecordResponses } from "@b/utils/query";
import { userStoreSchema, userUpdateSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "Creates a new user",
  operationId: "createUser",
  tags: ["Admin", "CRM", "User"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: userUpdateSchema,
      },
    },
  },
  responses: storeRecordResponses(userStoreSchema, "Page"),
  requiresAuth: true,
  permission: "Access User Management",
};

export default async (data: Handler) => {
  const { body, user } = data;
  const {
    firstName,
    lastName,
    email,
    roleId,
    avatar,
    avatarToDisplay,
    phone,
    emailVerified,
    status = "ACTIVE",
    profile,
    password: rawPassword,
    customAddressWalletsPairFields,
    customRestrictionPairFields,
  } = body;

  // Ensure customFields is an array
  let parsedCustomFields = Array.isArray(customAddressWalletsPairFields)
    ? customAddressWalletsPairFields
    : [];
  let parsedCustomRestrictionFields = Array.isArray(customRestrictionPairFields)
    ? customRestrictionPairFields
    : [];

  if (typeof customAddressWalletsPairFields === "string") {
    try {
      const parsed = JSON.parse(customAddressWalletsPairFields);
      parsedCustomFields = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      throw new Error("Invalid JSON format for customFields");
    }
  }

  if (typeof customRestrictionPairFields === "string") {
    try {
      const parsed = JSON.parse(customRestrictionPairFields);
      parsedCustomRestrictionFields = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      throw new Error("Invalid JSON format for customRestrictionPairFields");
    }
  }

  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized access" });
  }

  const existingUser = await models.user.findOne({
    where: { email },
    include: [{ model: models.role, as: "role" }],
  });

  if (existingUser) {
    throw createError({ statusCode: 400, message: "User already exists" });
  }

  let password: string;
  let plaintextPassword: string | undefined;

  if (rawPassword) {
    if (!validatePassword(rawPassword)) {
      throw createError({
        statusCode: 400,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character",
      });
    }
    password = await hashPassword(rawPassword);
  } else {
    // Generate a temporary user record to get an ID, then generate password
    // Instead, generate password first, then create user
    const { default: passwordGenerator } = await import("generate-password");
    const generated = passwordGenerator.generate({
      length: 20,
      numbers: true,
      symbols: true,
      strict: true,
    });
    plaintextPassword = generated;
    password = await hashPassword(generated);
  }

  const superAdminRole = await models.role.findOne({
    where: { name: "Super Admin" },
  });

  // prevent making super admin
  if (roleId === superAdminRole?.id) {
    throw createError({
      statusCode: 400,
      message: "You cannot create a Super Admin",
    });
  }

  await models.user.create({
    firstName,
    lastName,
    email,
    roleId: Number(roleId),
    password,
    avatar,
    avatarToDisplay,
    phone,
    emailVerified,
    status,
    profile,
    customAddressWalletsPairFields: parsedCustomFields,
    customRestrictionPairFields: parsedCustomRestrictionFields,
  });

  return {
    message: plaintextPassword
      ? `User created successfully. Generated password: ${plaintextPassword}`
      : "User created successfully",
  };
};
