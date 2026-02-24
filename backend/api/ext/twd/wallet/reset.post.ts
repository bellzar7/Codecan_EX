import type { Request, Response } from "@b/index";

export const metadata = {
  middleware: ["authenticate"],
};

/**
 * This endpoint has been deprecated.
 * TWD now uses the same SPOT wallet system as Binance.
 * Balances must be credited by admin through existing admin tools.
 */
export default async (_req: Request, res: Response) => {
  return res.status(410).json({
    message:
      "This endpoint has been deprecated. TWD now uses SPOT wallets. " +
      "Please contact your administrator to credit your balance.",
  });
};
