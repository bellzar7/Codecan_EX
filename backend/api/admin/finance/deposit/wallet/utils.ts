import {
  baseBooleanSchema,
  baseNumberSchema,
  baseStringSchema,
} from "@b/utils/schema";

// Basic component definitions
const id = {
  ...baseStringSchema("ID of the deposit wallet"),
  nullable: true,
};
const title = baseStringSchema("Title of the deposit wallet");
const address = baseStringSchema("Address of the deposit wallet");
const instructions = baseStringSchema(
  "Instructions for using the deposit wallet",
  5000,
  10
);
const image = {
  ...baseStringSchema("URL to an image representing the deposit wallet"),
  nullable: true,
};
const fixedFee = {
  ...baseNumberSchema("Fixed transaction fee for the wallet"),
  nullable: true,
};
const percentageFee = {
  ...baseNumberSchema("Percentage fee of the transaction amount"),
  nullable: true,
};
const minAmount = baseNumberSchema(
  "Minimum amount that can be deposited using this wallet"
);

const maxAmount = baseNumberSchema(
  "Maximum amount that can be deposited using this wallet"
);

const customFields = {
  description: "Custom JSON fields relevant to the deposit wallet",
  type: "array",
  items: {
    type: "object",
    required: ["title", "type"],
    properties: {
      title: {
        type: "string",
        description: "The title of the field",
      },
      type: {
        type: "string",
        description: "The type of the field (e.g., input)",
        enum: ["input", "textarea"],
      },
      required: {
        type: "boolean",
        description: "Whether the field is required or not",
        default: false,
      },
    },
  },
  nullable: true,
};

const status = baseBooleanSchema(
  "Current status of the deposit wallet (active or inactive)"
);

export const baseDepositWalletSchema = {
  id,
  title,
  address,
  instructions,
  image,
  fixedFee,
  percentageFee,
  minAmount,
  maxAmount,
  customFields,
  status,
};

export const DepositWalletSchema = {
  description: "Deposit wallet created successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: baseDepositWalletSchema,
      },
    },
  },
};

export const depositWalletUpdateSchema = {
  type: "object",
  properties: {
    title,
    address,
    instructions,
    image,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    status,
    customFields,
  },
  required: [
    "title",
    "address",
    "instructions",
    "fixedFee",
    "percentageFee",
    "minAmount",
    "maxAmount",
    "status",
  ],
};

export const walletSchema = {
  type: "object",
  properties: { ...baseDepositWalletSchema },
};
