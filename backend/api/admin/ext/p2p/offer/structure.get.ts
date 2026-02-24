// /api/p2pOffers/structure.get.ts

import { models } from "@b/db";
import { CacheManager } from "@b/utils/cache";
import { structureSchema } from "@b/utils/constants";
import { getCurrencyConditions } from "@b/utils/currency";
import {
  userAvatarSchema,
  userFullNameSchema,
} from "@b/utils/schema/structure";
import { Op } from "sequelize";

export const metadata = {
  summary: "Get form structure for P2P Offers",
  operationId: "getP2pOfferStructure",
  tags: ["Admin", "P2P Offers"],
  responses: {
    200: {
      description: "Form structure for managing P2P Offers",
      content: structureSchema,
    },
  },
  permission: "Access P2P Offer Management",
};

export const p2pOfferStructure = async () => {
  const paymentMethods = await models.p2pPaymentMethod.findAll({
    where: { status: true },
  });

  const users = await models.user.findAll({
    raw: true,
    attributes: {
      exclude: [
        "password",
        "failedLoginAttempts",
        "metadata",
        "lastFailedLogin",
        "walletAddress",
        "walletProvider",
        "updatedAt",
      ],
    },
    include: [
      {
        model: models.role,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
    where: {
      "$role.name$": { [Op.ne]: "Super Admin" },
    },
  });

  const userIds = {
    type: "select",
    label: "Users",
    multiple: true,
    name: "userIds",
    structure: {
      value: "value",
      label: "label",
    },
    options:
      users?.length > 0
        ? users?.map((user) => ({
            value: user?.id,
            label: `${user?.firstName} ${user?.lastName}`,
          }))
        : [],
    placeholder: "Select users",
  };

  const rating = {
    label: "Rating",
    type: "select",
    name: "rating",
    options: [
      { value: 0, label: "0" },
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
    ].map((method) => ({
      value: method.value,
      label: method.label,
    })),
  };

  const userId = {
    type: "input",
    label: "User",
    name: "userId",
    placeholder: "Enter the user ID",
    icon: "lets-icons:user-duotone",
  };

  const paymentMethodId = {
    type: "select",
    label: "Payment Method ID",
    name: "paymentMethodId",
    options: paymentMethods.map((method) => ({
      value: method.id,
      label: method.name,
    })),
    placeholder: "Select main payment method",
  };

  const additionalPaymentMethodIds = {
    type: "select",
    label: "Additional payment Method IDS",
    name: "additionalPaymentMethodIds",
    multiple: true,
    structure: {
      value: "value",
      label: "label",
    },
    options:
      paymentMethods?.length > 0
        ? paymentMethods?.map((method) => ({
            value: method?.id,
            label: method?.name,
          }))
        : [{ value: null, label: "select payment method" }],
    placeholder: "Select additional payment methods",
  };

  const walletType = {
    type: "select",
    label: "Wallet Type",
    name: "walletType",
    options: [
      { value: "FIAT", label: "Fiat" },
      { value: "SPOT", label: "Spot" },
    ],
    placeholder: "Select wallet type",
  };

  const currencyConditions = await getCurrencyConditions();
  const cacheManager = CacheManager.getInstance();
  const extensions = await cacheManager.getExtensions();
  if (extensions.has("ecosystem")) {
    walletType.options.push({ value: "ECO", label: "Funding" });
  }
  const currency = {
    type: "select",
    label: "Currency",
    name: "currency",
    options: [],
    conditions: {
      walletType: currencyConditions,
    },
  };

  const nameToDisplay = {
    type: "input",
    label: "Name to Display",
    name: "nameToDisplay",
    placeholder: "Name to display in the offer list",
  };

  const avatarToDisplay = {
    type: "file",
    label: "avatarToDisplay",
    name: "avatarToDisplay",
    fileType: "avatar",
    className: "rounded-full",
    width: 64,
    height: 64,
    maxSize: 1,
  };

  const chain = {
    type: "input",
    label: "Chain",
    name: "chain",
    placeholder: "Blockchain network (optional)",
    condition: { walletType: "ECO" },
  };

  const amount = {
    type: "input",
    label: "Total Amount",
    name: "amount",
    placeholder: "Total amount for the offer",
    ts: "number",
  };

  const minAmount = {
    type: "input",
    label: "Minimum Amount",
    name: "minAmount",
    placeholder: "Minimum transaction amount",
    ts: "number",
  };

  const maxAmount = {
    type: "input",
    label: "Maximum Amount",
    name: "maxAmount",
    placeholder: "Maximum transaction amount",
    ts: "number",
  };

  const inOrder = {
    type: "input",
    label: "In Order",
    name: "inOrder",
    placeholder: "Amount currently in order",
    ts: "number",
  };

  const price = {
    type: "input",
    label: "Price per Unit",
    name: "price",
    placeholder: "Set price per unit of currency",
    ts: "number",
  };

  const status = {
    type: "select",
    label: "Status",
    name: "status",
    options: [
      { value: "PENDING", label: "Pending" },
      { value: "ACTIVE", label: "Active" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
    placeholder: "Select the offer status",
  };

  return {
    userId,
    nameToDisplay,
    avatarToDisplay,
    rating,
    userIds,
    walletType,
    currency,
    chain,
    amount,
    minAmount,
    maxAmount,
    inOrder,
    price,
    paymentMethodId,
    additionalPaymentMethodIds,
    status,
  };
};

export default async () => {
  const {
    userId,
    nameToDisplay,
    avatarToDisplay,
    rating,
    userIds,
    walletType,
    currency,
    chain,
    amount,
    minAmount,
    maxAmount,
    inOrder,
    price,
    paymentMethodId,
    additionalPaymentMethodIds,
    status,
  } = await p2pOfferStructure();

  return {
    get: [
      {
        fields: [
          userAvatarSchema,
          {
            fields: [
              userFullNameSchema,
              {
                type: "input",
                component: "InfoBlock",
                label: "Payment Method",
                name: "paymentMethod.name",
                icon: "ph:wallet-light",
              },
            ],
            grid: "column",
          },
        ],
        className: "card-dashed mb-5 items-center",
      },
      nameToDisplay,
      avatarToDisplay,
      rating,
      [userIds, additionalPaymentMethodIds],
      [walletType, currency, chain],
      [amount, price],
      [minAmount, maxAmount],
      inOrder,
      status,
    ],
    set: [
      nameToDisplay,
      avatarToDisplay,
      rating,
      [userId, paymentMethodId],
      [userIds, additionalPaymentMethodIds],
      [walletType, currency, chain],
      [amount, price],
      [minAmount, maxAmount],
      inOrder,
      status,
    ],
  };
};
