import { models } from "@b/db";
import { convertAndSortCounts } from "@b/utils";
import { Op } from "sequelize";

export async function getUserCountsPerDay() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const users = await models.user.findAll({
    where: {
      createdAt: {
        [Op.gte]: startDate, // Sequelize uses Op.gte for "greater than or equal" comparisons
      },
    },
    attributes: ["createdAt", "status", "emailVerified"], // Specify which fields to fetch
  });

  const counts = {
    registrations: {},
    activeUsers: {},
    bannedUsers: {},
    verifiedEmails: {},
  };

  users.forEach((user) => {
    if (!user.createdAt) {
      return;
    }

    const date = user.createdAt.toISOString().split("T")[0];

    counts.registrations[date] = (counts.registrations[date] || 0) + 1;

    if (user.status === "ACTIVE") {
      counts.activeUsers[date] = (counts.activeUsers[date] || 0) + 1;
    }

    if (user.status === "BANNED") {
      counts.bannedUsers[date] = (counts.bannedUsers[date] || 0) + 1;
    }

    if (user.emailVerified) {
      counts.verifiedEmails[date] = (counts.verifiedEmails[date] || 0) + 1;
    }
  });

  return {
    registrations: convertAndSortCounts(counts.registrations),
    activeUsers: convertAndSortCounts(counts.activeUsers),
    bannedUsers: convertAndSortCounts(counts.bannedUsers),
    verifiedEmails: convertAndSortCounts(counts.verifiedEmails),
  };
}

import {
  baseBooleanSchema,
  baseDateTimeSchema,
  baseEnumSchema,
  baseIntegerSchema,
  baseStringSchema,
} from "@b/utils/schema"; // Adjust the import path as necessary

// Basic schema components
const id = baseStringSchema("ID of the user");
const email = baseStringSchema(
  "Email of the user",
  100,
  0,
  false,
  "^[^@]+@[^@]+\\.[^@]+$",
  "example@site.com"
);
const avatar = baseStringSchema("Avatar of the user", 255, 0, true);
const firstName = baseStringSchema("First name of the user", 50);
const lastName = baseStringSchema("Last name of the user", 50);
const emailVerified = baseBooleanSchema("Email verification status");
const phone = baseStringSchema(
  "User's phone number",
  10,
  10,
  true,
  "^[0-9]{10}$",
  "1234567890"
); // Fixed length for phone numbers with pattern
const status = baseEnumSchema("Status of the user", [
  "ACTIVE",
  "INACTIVE",
  "BANNED",
  "SUSPENDED",
]);
const roleId = baseStringSchema("Role ID associated with the user");
const twoFactor = baseBooleanSchema(
  "Whether two-factor authentication is enabled"
);

// Profile related components
const profile = {
  type: "object",
  nullable: true,
  properties: {
    bio: baseStringSchema("Bio", 500),
    location: {
      type: "object",
      properties: {
        address: baseStringSchema("Detailed address of the user"),
        city: baseStringSchema("City"),
        country: baseStringSchema("Country"),
        zip: baseStringSchema("Zip code", 10, 5, false),
      },
    },
    social: {
      type: "object",
      properties: {
        facebook: baseStringSchema(
          "Facebook URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://facebook.com/yourusername"
        ), // URL pattern
        twitter: baseStringSchema(
          "Twitter URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://twitter.com/yourusername"
        ), // URL pattern
        dribbble: baseStringSchema(
          "Dribbble URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://dribbble.com/yourusername"
        ), // URL pattern
        instagram: baseStringSchema(
          "Instagram URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://instagram.com/yourusername"
        ), // URL pattern
        github: baseStringSchema(
          "Github URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://github.com/yourusername"
        ), // URL pattern
        gitlab: baseStringSchema(
          "Gitlab URL",
          255,
          0,
          true,
          "^https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$",
          "http://gitlab.com/yourusername"
        ), // URL pattern
      },
    },
  },
};

const lastLogin = baseDateTimeSchema("Last login date");
const lastFailedLogin = baseDateTimeSchema("Last failed login date");
const failedLoginAttempts = baseIntegerSchema(
  "Number of failed login attempts"
);
const walletAddress = baseStringSchema("Wallet address of the user");
const walletProvider = baseStringSchema("Wallet provider of the user");
const customAddressWalletsPairFields = {
  description: "Custom JSON fields relevant to the deposit wallet address",
  type: "array",
  items: {
    type: "object",
    required: ["currency", "address", "network"],
    properties: {
      currency: {
        type: "string",
        description: "The currency of the address",
      },
      address: {
        type: "string",
        description: "The address of the wallet",
      },
      network: {
        type: "string",
        description: "The network of the wallet",
      },
    },
  },
  nullable: true,
};

const customRestrictionPairFields = {
  description: "Custom JSON fields for user restrictions",
  type: "array",
  items: {
    type: "object",
    required: ["section", "isAllowed", "reason"],
    properties: {
      section: {
        type: "string",
        description: "The section being restricted",
      },
      isAllowed: {
        type: "boolean",
        description: "Whether the user is allowed access",
      },
      reason: {
        type: "string",
        description: "The reason for the restriction",
      },
    },
  },
  nullable: true,
};

// Full user schema
export const userSchema = {
  id,
  email,
  avatar,
  firstName,
  lastName,
  emailVerified,
  phone,
  status,
  roleId,
  twoFactor,
  profile,
  lastLogin,
  lastFailedLogin,
  failedLoginAttempts,
  walletAddress,
  walletProvider,
  customAddressWalletsPairFields,
};

// Schema for updating a user
export const userUpdateSchema: SchemaObject = {
  type: "object",
  properties: {
    avatar,
    firstName,
    lastName,
    email,
    phone,
    password: {
      type: "string",
      description:
        "User password (optional, auto-generated if empty). Must be 8+ chars with upper, lower, digit, and special char.",
      minLength: 8,
    },
    status,
    emailVerified,
    twoFactor,
    profile,
    roleId,
    customAddressWalletsPairFields,
    customRestrictionPairFields,
  },
  required: ["email", "firstName", "lastName", "roleId"], // Ensure these are the fields you want to be required
};

export const userStoreSchema = {
  description: "User created or updated successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: userSchema,
      },
    },
  },
};
