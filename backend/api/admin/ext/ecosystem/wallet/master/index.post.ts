// /api/admin/ecosystem/masterWallets/store.post.ts

import { chainConfigs } from "@b/utils/eco/chains";
import { getMasterWalletByChain } from "@b/utils/eco/wallet";
import { storeRecordResponses } from "@b/utils/query";
import { baseStringSchema } from "@b/utils/schema";
import {
  createAndEncryptWallet,
  createMasterWallet,
  ecosystemMasterWalletStoreSchema,
} from "./utils";

export const metadata: OperationObject = {
  summary: "Stores a new Ecosystem Master Wallet",
  operationId: "storeEcosystemMasterWallet",
  tags: ["Admin", "Ecosystem Master Wallets"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            chain: baseStringSchema(
              "Blockchain chain associated with the master wallet",
              255
            ),
          },
          required: ["chain"],
        },
      },
    },
  },
  responses: storeRecordResponses(
    ecosystemMasterWalletStoreSchema,
    "Ecosystem Master Wallet"
  ),
  requiresAuth: true,
  permission: "Access Ecosystem Master Wallet Management",
};

export default async (data: Handler) => {
  const { body } = data;
  const { chain } = body;

  const existingWallet = await getMasterWalletByChain(chain);
  if (existingWallet) {
    throw new Error(`Master wallet already exists: ${chain}`);
  }

  const walletData = await createAndEncryptWallet(chain);
  return await createMasterWallet(walletData, chainConfigs[chain].currency);
};
