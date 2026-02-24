import { updateSpotWalletBalance } from "@b/api/finance/deposit/spot/index.ws";
import { updateTransaction } from "@b/api/finance/utils";
import { models } from "@b/db";
import ExchangeManager from "@b/utils/exchange";
import { subDays } from "date-fns";
import { Op } from "sequelize";
import { MatchingEngine } from "../eco/matchingEngine";
import { logError } from "../logger";
import { handleNotification } from "../notifications";
import { walletPnlTaskQueue } from "./walletTask";

export async function processWalletPnl() {
  try {
    const users = await models.user.findAll({ attributes: ["id"] });

    // Process users by adding tasks to the wallet PnL queue
    for (const user of users) {
      walletPnlTaskQueue.add(() => handlePnl(user));
    }
  } catch (error) {
    logError("processWalletPnl", error, __filename);
    throw error;
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Pre-existing complex logic
const handlePnl = async (user: { id: string }) => {
  try {
    const wallets = await models.wallet.findAll({
      where: { userId: user.id },
      attributes: ["currency", "balance", "type"], // Fetch only necessary fields
    });

    if (!wallets.length) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueCurrencies = Array.from(
      new Set(wallets.map((w) => w.currency))
    );

    const [todayPnl, currencyPrices, exchangePrices, engine] =
      await Promise.all([
        models.walletPnl.findOne({
          where: {
            userId: user.id,
            createdAt: {
              [Op.gte]: today,
            },
          },
          attributes: ["id", "balances"], // Fetch only necessary fields
        }),
        models.currency.findAll({
          where: { id: uniqueCurrencies },
          attributes: ["id", "price"], // Fetch only necessary fields
        }),
        models.exchangeCurrency.findAll({
          where: { currency: uniqueCurrencies },
          attributes: ["currency", "price"], // Fetch only necessary fields
        }),
        MatchingEngine.getInstance(), // Await this separately
      ]);

    const tickers = await engine.getTickers(); // Await the call to getTickers after getting the instance

    const currencyMap = new Map<string, number>(
      currencyPrices.map((item) => [item.id, item.price as number])
    );
    const exchangeMap = new Map<string, number>(
      exchangePrices.map((item) => [item.currency, item.price as number])
    );

    // Initialize balances for all wallet types
    const balances = {
      FIAT: 0,
      SPOT: 0,
      ECO: 0,
      FUTURES: 0,
      FOREX: 0,
      STOCK: 0,
      INDEX: 0,
    };

    for (const wallet of wallets) {
      // Note: TWD_PAPER was a deprecated wallet type that was migrated to SPOT
      // See migrations: 20250125000003 (data migration) and 20250125000004 (enum removal)

      let price: number | undefined;
      if (wallet.type === "FIAT") {
        price = currencyMap.get(wallet.currency);
      } else if (wallet.type === "SPOT") {
        price = exchangeMap.get(wallet.currency);
      } else if (wallet.type === "ECO") {
        price = tickers[wallet.currency]?.last || 0;
      } else if (
        wallet.type === "FUTURES" ||
        wallet.type === "FOREX" ||
        wallet.type === "STOCK" ||
        wallet.type === "INDEX"
      ) {
        // For trading wallets (FUTURES, FOREX, STOCK, INDEX):
        // Try to get price from exchange map first (for USD, USDT, etc.)
        // These wallets typically hold USD or quote currencies
        price =
          exchangeMap.get(wallet.currency) ||
          currencyMap.get(wallet.currency) ||
          1;
      }

      if (price && balances[wallet.type] !== undefined) {
        balances[wallet.type] += price * wallet.balance;
      }
    }

    if (Object.values(balances).some((balance) => balance > 0)) {
      if (todayPnl) {
        await todayPnl.update({ balances });
      } else {
        await models.walletPnl.create({
          userId: user.id,
          balances,
          createdAt: today,
        });
      }
    }
  } catch (error) {
    logError("handlePnl", error, __filename);
    throw error;
  }
};

export async function cleanupOldPnlRecords() {
  try {
    const oneMonthAgo = subDays(new Date(), 30);
    const yesterday = subDays(new Date(), 1);

    // Updated to include all wallet types
    const zeroBalanceString =
      '{"FIAT":0,"SPOT":0,"ECO":0,"FUTURES":0,"FOREX":0,"STOCK":0,"INDEX":0}';
    const zeroBalanceObject = {
      FIAT: 0,
      SPOT: 0,
      ECO: 0,
      FUTURES: 0,
      FOREX: 0,
      STOCK: 0,
      INDEX: 0,
    };

    // Delete PnL records older than 30 days
    await models.walletPnl.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneMonthAgo,
        },
      },
    });

    // Delete zero-balance PnL records older than yesterday
    await models.walletPnl.destroy({
      where: {
        createdAt: {
          [Op.lt]: yesterday,
        },
        [Op.or]: [
          { balances: zeroBalanceString },
          { balances: zeroBalanceObject },
        ],
      },
    });
  } catch (error) {
    logError("cleanupOldPnlRecords", error, __filename);
  }
}

// INTERNAL EXCHANGE MODE: processSpotPendingDeposits has been removed
// Deposits are now approved manually by admin through the transaction management interface
// The external API verification logic was disabled in Phase 4

export async function getPendingSpotTransactionsQuery(type) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return await models.transaction.findAll({
      where: {
        status: "PENDING",
        type,
        createdAt: {
          [Op.between]: [oneHourAgo, new Date()],
        },
        [Op.and]: [
          {
            referenceId: { [Op.ne]: null }, // Not equal to null
          },
          {
            referenceId: { [Op.ne]: "" }, // Not equal to empty string
          },
        ],
      },
      include: [
        {
          model: models.wallet,
          as: "wallet",
          attributes: ["id", "currency"], // Specify the fields to include from the wallet model
        },
      ],
    });
  } catch (error) {
    logError("getPendingSpotTransactionsQuery", error, __filename);
    throw error;
  }
}

export async function processPendingWithdrawals() {
  try {
    const transactions = (await getPendingSpotTransactionsQuery(
      "WITHDRAW"
    )) as unknown as Transaction[];

    for (const transaction of transactions) {
      const userId = transaction.userId;
      const trx = transaction.referenceId;
      if (!trx) {
        continue;
      }

      const exchange = await ExchangeManager.startExchange();
      try {
        const withdrawals = await exchange.fetchWithdrawals(
          transaction.wallet?.currency
        );
        const withdrawData = withdrawals.find((w) => w.id === trx);
        let withdrawStatus: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED" =
          "PENDING";
        if (withdrawData) {
          switch (withdrawData.status) {
            case "ok":
              withdrawStatus = "COMPLETED";
              break;
            case "canceled":
              withdrawStatus = "CANCELLED";
              break;
            case "failed":
              withdrawStatus = "FAILED";
              break;
            default:
              break;
          }
        }
        if (!withdrawStatus) {
          continue;
        }
        if (transaction.status === withdrawStatus) {
          continue;
        }
        await updateTransaction(transaction.id, { status: withdrawStatus });
        if (withdrawStatus === "FAILED" || withdrawStatus === "CANCELLED") {
          await updateSpotWalletBalance(
            userId,
            transaction.wallet?.currency,
            Number(transaction.amount),
            Number(transaction.fee),
            "REFUND_WITHDRAWAL"
          );
          await handleNotification({
            userId,
            title: "Withdrawal Failed",
            message: `Your withdrawal of ${transaction.amount} ${transaction.wallet?.currency} has failed.`,
            type: "ACTIVITY",
          });
        }
      } catch (error) {
        logError(
          `processPendingWithdrawals - transaction ${transaction.id}`,
          error,
          __filename
        );
      }
    }
  } catch (error) {
    logError("processPendingWithdrawals", error, __filename);
    throw error;
  }
}
