/**
 * TwelveData Exchange Provider Initialization
 * Ensures TWD appears as a provider in the Finance → Exchange list
 */

import { models } from "@b/db";

export async function ensureTwdExchangeProvider() {
  try {
    // Check if TWD exchange provider exists
    const existing = await models.exchange.findOne({
      where: { productId: "twelvedata" },
    });

    if (existing) {
      console.log("[TWD] TwelveData exchange provider already exists");
    } else {
      // Create TWD exchange provider entry
      await models.exchange.create({
        name: "twelvedata",
        title: "TwelveData Paper Trading",
        productId: "twelvedata",
        type: "twd",
        status: false,
        licenseStatus: true, // No license needed for TWD
        version: "1.0.0",
      });

      console.log("[TWD] Created TwelveData exchange provider entry");
    }
  } catch (error) {
    console.error("[TWD] Failed to initialize exchange provider:", error);
  }
}
