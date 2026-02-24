import { models } from "@b/db";
// import { futuresMarketAttributes } from "@db/futuresMarket";

export async function getFuturesMarket(
  currency: string,
  pair: string
): Promise<any> {
  const market = await models.futuresMarket.findOne({
    where: {
      currency,
      pair,
    },
  });

  if (!market) {
    throw new Error("Futures market not found");
  }

  return market;
}

import {
  baseBooleanSchema,
  baseNumberSchema,
  baseStringSchema,
} from "@b/utils/schema";

export const baseFuturesMarketSchema = {
  id: baseNumberSchema("Futures Market ID"),
  currency: baseStringSchema("Futures market currency"),
  pair: baseStringSchema("Futures market pair"),
  status: baseBooleanSchema("Futures market status"),
};
