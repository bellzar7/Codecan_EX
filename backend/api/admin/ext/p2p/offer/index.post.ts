// /api/p2p/offers/store.post.ts

import { storeRecord, storeRecordResponses } from "@b/utils/query";
import { p2pOfferStoreSchema, p2pOfferUpdateSchema } from "./utils";

export const metadata = {
  summary: "Stores a new P2P Offer",
  operationId: "storeP2POffer",
  tags: ["Admin", "P2P", "Offers"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: p2pOfferUpdateSchema,
      },
    },
  },
  responses: storeRecordResponses(p2pOfferStoreSchema, "P2P Offer"),
  requiresAuth: true,
  permission: "Access P2P Offer Management",
};

export default async (data: Handler) => {
  const { body } = data;
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
  } = body;

  const offer = await storeRecord({
    returnResponse: true,
    model: "p2pOffer",
    data: {
      userId,
      nameToDisplay,
      avatarToDisplay,
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
    },
  });
  if (rating) {
    return await storeRecord({
      model: "p2pReview",
      data: {
        reviewerId: userId,
        reviewedId: userId,
        offerId: offer?.record?.id,
        rating,
        comment: "",
      },
    });
  }
};
