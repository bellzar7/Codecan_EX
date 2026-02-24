// /api/mlm/referralRewards/store.post.ts

import { models } from "@b/db";
import { storeRecord, storeRecordResponses } from "@b/utils/query";
import {
  mlmReferralRewardStoreSchema,
  mlmReferralRewardUpdateSchema,
} from "./utils";

export const metadata: OperationObject = {
  summary: "Stores a new MLM Referral Reward",
  operationId: "storeMlmReferralReward",
  tags: ["Admin", "MLM", "Referral Rewards"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: mlmReferralRewardUpdateSchema,
      },
    },
  },
  responses: storeRecordResponses(
    mlmReferralRewardStoreSchema,
    "MLM Referral Reward"
  ),
  requiresAuth: true,
  permission: "Access MLM Referral Reward Management",
};

export default async (data: Handler) => {
  const { body } = data;
  const { reward, isClaimed, conditionId, referrerId } = body;

  const referrer = await models.user.findOne({ where: { id: referrerId } });
  if (!referrer) {
    throw new Error("Referrer not found");
  }

  return await storeRecord({
    model: "mlmReferralReward",
    data: {
      reward,
      isClaimed,
      conditionId,
      referrerId,
    },
  });
};
