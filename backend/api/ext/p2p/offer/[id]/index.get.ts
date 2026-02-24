import { models } from "@b/db";
import {
  getRecord,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseP2pOfferSchema } from "../utils";

export const metadata: OperationObject = {
  summary: "Retrieves detailed information of a specific P2P Offer by ID",
  operationId: "getP2pOfferById",
  tags: ["P2P", "Offer"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the P2P Offer to retrieve",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "P2P Offer details",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseP2pOfferSchema, // Define this schema in your utils if it's not already defined
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("P2P Offer"),
    500: serverErrorResponse,
  },
};

export default async (data) => {
  const { params } = data;
  const formattedData: any = await getRecord("p2pOffer", params.id, [
    {
      model: models.p2pTrade,
      as: "p2pTrades",
      attributes: ["id", "status", "amount"],
    },
    {
      model: models.user,
      as: "user",
      attributes: ["firstName", "lastName", "avatar"],
    },
    {
      model: models.p2pPaymentMethod,
      as: "paymentMethod",
    },
    {
      model: models.p2pReview,
      as: "p2pReviews",
      attributes: ["id", "rating", "comment", "createdAt"],
      includeModels: [
        {
          model: models.user,
          as: "reviewer",
          attributes: ["firstName", "lastName", "avatar", "id"],
        },
      ],
    },
  ]);
  const additionalPaymentMethodIds = [] as any;
  if (formattedData?.additionalPaymentMethodIds?.length > 0) {
    for (const paymentMethodId of formattedData?.additionalPaymentMethodIds) {
      const paymentMethod = await getRecord(
        "p2pPaymentMethod",
        paymentMethodId?.value
      );
      additionalPaymentMethodIds.push(paymentMethod);
    }
  }
  formattedData.additionalPaymentMethodIds = additionalPaymentMethodIds;
  return formattedData;
};
