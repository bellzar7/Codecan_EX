import { models, sequelize } from "@b/db";
import { createError } from "@b/utils/error";
import { handleNotification } from "@b/utils/notifications";
import {
  getRecord,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { Op } from "sequelize";

export const metadata: OperationObject = {
  summary: "Initiates a new P2P trade",
  description: "Creates a new trade for a specified offer by a user.",
  operationId: "createUserTrade",
  tags: ["P2P", "Trade"],
  requiresAuth: true,
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            offerId: { type: "string", description: "ID of the P2P offer" },
            amount: { type: "number", description: "Amount to trade" },
          },
          required: ["offerId", "amount"],
        },
      },
    },
  },
  responses: {
    201: {
      description: "Trade initiated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Trade ID" },
              status: {
                type: "string",
                description: "Current status of the trade",
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("P2P Trade"),
    500: serverErrorResponse,
  },
};

export default async (data: Handler) => {
  const { body, user } = data;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { offerId, amount, paymentMethodId } = body;

  if (!(offerId && amount)) {
    throw createError({
      statusCode: 400,
      message: "Offer ID and amount are required",
    });
  }

  if (amount <= 0) {
    throw createError({
      statusCode: 400,
      message: "Amount must be greater than 0",
    });
  }

  const newTrade = await sequelize.transaction(async (transaction) => {
    const offer = await models.p2pOffer.findByPk(offerId, {
      transaction,
      include: [
        {
          model: models.p2pPaymentMethod,
          as: "paymentMethod",
          attributes: ["id", "name", "image", "currency"],
        },
      ],
    });
    if (!offer) {
      throw createError({ statusCode: 404, message: "Offer not found" });
    }

    const remainingAmount = offer.amount - offer.inOrder;
    if (amount > remainingAmount) {
      throw createError({
        statusCode: 400,
        message: `Amount exceeds remaining offer amount of ${remainingAmount}`,
      });
    }

    const activeTrades = (await models.p2pTrade.findAll({
      raw: true,
      where: {
        [Op.or]: [{ userId: user.id }, { sellerId: user.id }],
        status: {
          [Op.in]: ["PENDING", "PAID"],
        },
      },
    })) as any;

    const checkIsExistActiveTrades = activeTrades?.length > 0;

    if (checkIsExistActiveTrades) {
      throw createError({
        statusCode: 400,
        message: "You already have an active trade",
      });
    }

    const trade = await models.p2pTrade.create(
      {
        userId: user.id,
        sellerId: offer.userId,
        offerId,
        amount,
        status: "PENDING",
      },
      { transaction }
    );

    let status = offer.status;
    if (offer.amount === offer.inOrder + amount) {
      status = "COMPLETED";
    }

    let updatedAdditionalPaymentMethodIds = [] as any;
    if (offer.additionalPaymentMethodIds?.length > 0) {
      const exists = offer.additionalPaymentMethodIds.some(
        (item) => item.value === paymentMethodId
      );
      if (exists) {
        updatedAdditionalPaymentMethodIds =
          offer.additionalPaymentMethodIds.filter(
            (item) => item.value !== paymentMethodId
          );
      }

      updatedAdditionalPaymentMethodIds.push({
        value: offer.paymentMethod.id,
        label: offer.paymentMethod.name,
      });
    }
    await offer.update(
      {
        status,
        paymentMethodId,
        additionalPaymentMethodIds: updatedAdditionalPaymentMethodIds,
        inOrder: offer.inOrder + amount,
      },
      {
        transaction,
      }
    );

    try {
      const seller = await models.user.findByPk(offer.userId, { transaction });
      if (!seller) {
        throw createError({ statusCode: 404, message: "Seller not found" });
      }
      if (status === "COMPLETED") {
        // await sendP2POfferAmountDepletionEmail(seller, offer, 0);
        await handleNotification({
          userId: seller.id,
          title: "Offer Completed",
          message: `Offer #${offer.id} has been completed`,
          type: "ACTIVITY",
        });
      }

      const _buyer = await models.user.findByPk(user.id, { transaction });

      const admins = await models.user.findAll({
        raw: true,
        where: {
          id: {
            [Op.ne]: 4,
          },
        },
      });

      if (admins && admins?.length > 0) {
        for (const admin of admins) {
          await handleNotification({
            userId: admin.id,
            title: "Trade Initiated",
            message: `New p2p Trade with ${seller.firstName} ${seller.lastName} has been initiated`,
            type: "ACTIVITY",
          });
        }
      }

      // await sendP2PTradeSaleConfirmationEmail(seller, buyer, trade, offer);
      await handleNotification({
        userId: user.id,
        title: "Trade Initiated",
        message: `Trade with ${seller.firstName} ${seller.lastName} has been initiated`,
        type: "ACTIVITY",
      });
    } catch (error) {
      console.error(error);
    }
    return trade;
  });
  if (newTrade) {
    const planedTrade = (await getRecord("p2pTrade", newTrade?.id, [
      {
        model: models.user,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
      {
        model: models.user,
        as: "seller",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
      {
        model: models.p2pOffer,
        as: "offer",
        attributes: ["id", "status", "currency"],
        includeModels: [
          {
            model: models.p2pPaymentMethod,
            as: "paymentMethod",
          },
        ],
      },
    ])) as any;

    if (
      newTrade?.status === "PENDING" &&
      planedTrade?.offer?.paymentMethod?.instructions
    ) {
      console.log("trade?.status === 'PENDING'");
      console.log("trade.id", planedTrade.id);
      // const resp = await $fetch({
      //   url: `/api/ext/p2p/trade/${get().trade?.id}/message`,
      //   method: "POST",
      //   body: { message: messageData, },
      //   silent: true
      // });
      const id = planedTrade.id;

      const _updatedTrade = await models.p2pTrade.update(
        {
          messages: [
            {
              attachment: "",
              text: planedTrade?.offer?.paymentMethod?.instructions,
              time: new Date(),
              type: "seller",
              userId: planedTrade?.seller?.id,
            },
          ],
        },
        { where: { id } }
      );
      return newTrade;
    }
  }
};
