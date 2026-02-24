// /server/api/p2p/trades/status.get.ts

import { models } from "@b/db";

import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { Op } from "sequelize";
import { p2pTradeSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "Active P2P trades",
  operationId: "listP2PTrades",
  tags: ["P2P", "Trades"],
  parameters: crudParameters,
  responses: {
    200: {
      description: "List of active P2P trades",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: p2pTradeSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("P2P Trades"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, query } = data;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Call the generic fetch function
  return getFiltered({
    model: models.p2pTrade,
    query,
    where: {
      [Op.or]: [{ userId: user.id }, { sellerId: user.id }],
      status: {
        [Op.in]: ["PENDING", "PAID"],
      },
    },
    sortField: query.sortField || "createdAt",
    includeModels: [
      {
        model: models.user,
        as: "user",
        attributes: ["firstName", "lastName", "email", "avatar"],
      },
      {
        model: models.user,
        as: "seller",
        attributes: ["firstName", "lastName", "email", "avatar"],
      },
      {
        model: models.p2pOffer,
        as: "offer",
        attributes: ["id", "status", "currency", "chain", "walletType"],
      },
      {
        model: models.p2pDispute,
        as: "p2pDisputes",
        attributes: ["id", "status"],
      },
    ],
    numericFields: ["amount"],
  });
};
