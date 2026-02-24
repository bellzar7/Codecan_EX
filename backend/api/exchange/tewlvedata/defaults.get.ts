// backend/api/exchange/tewlvedata/defaults.get.ts

import { models } from "@b/db";
import type { Request } from "../../../handler/Request";

export const metadata = { requiresAuth: false, requiresApi: false };

export default async function handler(_req: Request) {
  try {
    // Fetch enabled TWD markets from database
    const markets = await models.twdMarket.findAll({
      where: { status: true },
      attributes: ["symbol"],
    });

    const defaults = markets.map((m) => m.symbol);

    return { defaults };
  } catch (error) {
    console.error("Failed to fetch enabled TWD symbols:", error);
    return { defaults: [] };
  }
}
