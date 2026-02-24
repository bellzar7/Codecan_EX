/**
 * SPOT Wallet Manager
 *
 * Handles wallet operations for SPOT trading:
 * - Lock funds when order is placed
 * - Release locked funds when order is cancelled
 * - Transfer funds between users on trade execution
 * - Check user balance availability
 *
 * All operations use database transactions for atomicity.
 */

import { models, sequelize } from "@b/db";
import { logError } from "@b/utils/logger";
import type { Transaction } from "sequelize";

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Result of a balance check
 */
export interface BalanceCheckResult {
  hasBalance: boolean;
  available: number;
  inOrder: number;
  total: number;
}

/**
 * Wallet information
 */
export interface WalletInfo {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  inOrder: number;
}

// ============================================================================
// SpotWalletManager Class
// ============================================================================

export class SpotWalletManager {
  private static instance: SpotWalletManager | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SpotWalletManager {
    if (!SpotWalletManager.instance) {
      SpotWalletManager.instance = new SpotWalletManager();
    }
    return SpotWalletManager.instance;
  }

  /**
   * Get or create a SPOT wallet for a user
   */
  async getOrCreateWallet(
    userId: string,
    currency: string,
    transaction?: Transaction
  ): Promise<WalletInfo> {
    let wallet = await models.wallet.findOne({
      where: {
        userId,
        currency,
        type: "SPOT",
      },
      transaction,
    });

    if (!wallet) {
      wallet = await models.wallet.create(
        {
          userId,
          currency,
          type: "SPOT",
          balance: 0,
          inOrder: 0,
          status: true,
        },
        { transaction }
      );
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      currency: wallet.currency,
      balance: wallet.balance,
      inOrder: wallet.inOrder || 0,
    };
  }

  /**
   * Check if user has sufficient balance
   */
  async checkBalance(
    userId: string,
    currency: string,
    amount: number
  ): Promise<BalanceCheckResult> {
    const wallet = await models.wallet.findOne({
      where: {
        userId,
        currency,
        type: "SPOT",
      },
    });

    if (!wallet) {
      return {
        hasBalance: false,
        available: 0,
        inOrder: 0,
        total: 0,
      };
    }

    const available = wallet.balance - (wallet.inOrder || 0);

    return {
      hasBalance: available >= amount,
      available,
      inOrder: wallet.inOrder || 0,
      total: wallet.balance,
    };
  }

  /**
   * Lock funds when order is placed
   * Moves funds from available balance to inOrder
   */
  async lockFunds(
    userId: string,
    currency: string,
    amount: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const wallet = await models.wallet.findOne({
        where: {
          userId,
          currency,
          type: "SPOT",
        },
        lock: true,
        transaction: useTransaction,
      });

      if (!wallet) {
        if (shouldCommit) {
          await useTransaction.rollback();
        }
        return false;
      }

      const available = wallet.balance - (wallet.inOrder || 0);

      if (available < amount) {
        if (shouldCommit) {
          await useTransaction.rollback();
        }
        return false;
      }

      // Update inOrder amount (ensure it never goes negative)
      await models.wallet.update(
        {
          inOrder: sequelize.literal(
            `GREATEST(COALESCE("inOrder", 0) + ${amount}, 0)`
          ),
        },
        {
          where: { id: wallet.id },
          transaction: useTransaction,
        }
      );

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      return false;
    }
  }

  /**
   * Release locked funds when order is cancelled
   * Moves funds from inOrder back to available balance
   */
  async releaseFunds(
    userId: string,
    currency: string,
    amount: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const wallet = await models.wallet.findOne({
        where: {
          userId,
          currency,
          type: "SPOT",
        },
        lock: true,
        transaction: useTransaction,
      });

      if (!wallet) {
        if (shouldCommit) {
          await useTransaction.rollback();
        }
        return false;
      }

      // Always use GREATEST to ensure inOrder never goes negative
      // This handles edge cases where the amount to release exceeds current inOrder
      await models.wallet.update(
        {
          inOrder: sequelize.literal(
            `GREATEST(COALESCE("inOrder", 0) - ${amount}, 0)`
          ),
        },
        {
          where: { id: wallet.id },
          transaction: useTransaction,
        }
      );

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      return false;
    }
  }

  /**
   * Execute trade - transfer funds between buyer and seller
   *
   * For a BUY order:
   * - Buyer pays quote currency (e.g., USDT) and receives base currency (e.g., BTC)
   * - Seller pays base currency and receives quote currency
   *
   * @param buyerId - User ID of the buyer
   * @param sellerId - User ID of the seller
   * @param baseCurrency - Base currency (e.g., BTC in BTC/USDT)
   * @param quoteCurrency - Quote currency (e.g., USDT in BTC/USDT)
   * @param baseAmount - Amount of base currency being traded
   * @param quoteAmount - Amount of quote currency being traded (price * baseAmount)
   * @param buyerFee - Fee charged to buyer (in quote currency)
   * @param sellerFee - Fee charged to seller (in quote currency)
   * @param transaction - Optional database transaction
   */
  async executeTrade(
    buyerId: string,
    sellerId: string,
    baseCurrency: string,
    quoteCurrency: string,
    baseAmount: number,
    quoteAmount: number,
    buyerFee: number,
    sellerFee: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      // Get all required wallets with locks
      const buyerBaseWallet = await this.getOrCreateWallet(
        buyerId,
        baseCurrency,
        useTransaction
      );
      const buyerQuoteWallet = await this.getOrCreateWallet(
        buyerId,
        quoteCurrency,
        useTransaction
      );
      const sellerBaseWallet = await this.getOrCreateWallet(
        sellerId,
        baseCurrency,
        useTransaction
      );
      const sellerQuoteWallet = await this.getOrCreateWallet(
        sellerId,
        quoteCurrency,
        useTransaction
      );

      // Lock wallets for update
      await models.wallet.findOne({
        where: { id: buyerBaseWallet.id },
        lock: true,
        transaction: useTransaction,
      });
      await models.wallet.findOne({
        where: { id: buyerQuoteWallet.id },
        lock: true,
        transaction: useTransaction,
      });
      await models.wallet.findOne({
        where: { id: sellerBaseWallet.id },
        lock: true,
        transaction: useTransaction,
      });
      await models.wallet.findOne({
        where: { id: sellerQuoteWallet.id },
        lock: true,
        transaction: useTransaction,
      });

      // 1. Buyer: Deduct quote currency (was locked in inOrder)
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance - ${quoteAmount + buyerFee}`),
          inOrder: sequelize.literal(
            `GREATEST(COALESCE("inOrder", 0) - ${quoteAmount + buyerFee}, 0)`
          ),
        },
        {
          where: { id: buyerQuoteWallet.id },
          transaction: useTransaction,
        }
      );

      // 2. Buyer: Add base currency
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance + ${baseAmount}`),
        },
        {
          where: { id: buyerBaseWallet.id },
          transaction: useTransaction,
        }
      );

      // 3. Seller: Deduct base currency (was locked in inOrder)
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance - ${baseAmount}`),
          inOrder: sequelize.literal(
            `GREATEST(COALESCE("inOrder", 0) - ${baseAmount}, 0)`
          ),
        },
        {
          where: { id: sellerBaseWallet.id },
          transaction: useTransaction,
        }
      );

      // 4. Seller: Add quote currency (minus fee)
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance + ${quoteAmount - sellerFee}`),
        },
        {
          where: { id: sellerQuoteWallet.id },
          transaction: useTransaction,
        }
      );

      // Record admin profit from fees
      await this.recordAdminProfit(
        buyerFee + sellerFee,
        quoteCurrency,
        useTransaction
      );

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      throw error;
    }
  }

  /**
   * Record admin profit from trading fees
   */
  private async recordAdminProfit(
    amount: number,
    currency: string,
    transaction: Transaction
  ): Promise<void> {
    try {
      // Find or create admin profit record for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingProfit = await models.adminProfit.findOne({
        where: {
          type: "EXCHANGE_ORDER",
          currency,
          createdAt: {
            [models.Sequelize.Op.gte]: today,
          },
        },
        transaction,
      });

      if (existingProfit) {
        await models.adminProfit.update(
          {
            amount: sequelize.literal(`amount + ${amount}`),
          },
          {
            where: { id: existingProfit.id },
            transaction,
          }
        );
      } else {
        await models.adminProfit.create(
          {
            type: "EXCHANGE_ORDER",
            amount,
            currency,
            description: `Trading fees collected for ${currency}`,
          },
          { transaction }
        );
      }
    } catch (error) {
      // Log but don't fail the trade
      logError("spot_wallet_manager", error, __filename);
    }
  }

  /**
   * Get user's wallet balances for all SPOT wallets
   */
  async getUserBalances(userId: string): Promise<WalletInfo[]> {
    const wallets = await models.wallet.findAll({
      where: {
        userId,
        type: "SPOT",
      },
    });

    return wallets.map((w) => ({
      id: w.id,
      userId: w.userId,
      currency: w.currency,
      balance: w.balance,
      inOrder: w.inOrder || 0,
    }));
  }

  /**
   * Get user's wallet balance for a specific currency
   */
  async getUserBalance(
    userId: string,
    currency: string
  ): Promise<WalletInfo | null> {
    const wallet = await models.wallet.findOne({
      where: {
        userId,
        currency,
        type: "SPOT",
      },
    });

    if (!wallet) {
      return null;
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      currency: wallet.currency,
      balance: wallet.balance,
      inOrder: wallet.inOrder || 0,
    };
  }

  /**
   * Transfer funds between wallets (internal transfer)
   */
  async transferFunds(
    fromUserId: string,
    toUserId: string,
    currency: string,
    amount: number,
    description?: string
  ): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      // Get source wallet
      const sourceWallet = await models.wallet.findOne({
        where: {
          userId: fromUserId,
          currency,
          type: "SPOT",
        },
        lock: true,
        transaction,
      });

      if (!sourceWallet) {
        await transaction.rollback();
        throw new Error("Source wallet not found");
      }

      const available = sourceWallet.balance - (sourceWallet.inOrder || 0);

      if (available < amount) {
        await transaction.rollback();
        throw new Error("Insufficient funds");
      }

      // Get or create destination wallet
      const destWallet = await this.getOrCreateWallet(
        toUserId,
        currency,
        transaction
      );

      // Deduct from source
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance - ${amount}`),
        },
        {
          where: { id: sourceWallet.id },
          transaction,
        }
      );

      // Add to destination
      await models.wallet.update(
        {
          balance: sequelize.literal(`balance + ${amount}`),
        },
        {
          where: { id: destWallet.id },
          transaction,
        }
      );

      // Record transactions
      await models.transaction.create(
        {
          userId: fromUserId,
          walletId: sourceWallet.id,
          type: "OUTGOING_TRANSFER",
          status: "COMPLETED",
          amount: -amount,
          fee: 0,
          description: description || `Transfer to user ${toUserId}`,
        },
        { transaction }
      );

      await models.transaction.create(
        {
          userId: toUserId,
          walletId: destWallet.id,
          type: "INCOMING_TRANSFER",
          status: "COMPLETED",
          amount,
          fee: 0,
          description: description || `Transfer from user ${fromUserId}`,
        },
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      logError("spot_wallet_manager", error, __filename);
      throw error;
    }
  }

  /**
   * Deposit funds to a user's SPOT wallet
   */
  async deposit(
    userId: string,
    currency: string,
    amount: number,
    referenceId?: string,
    description?: string
  ): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      const wallet = await this.getOrCreateWallet(
        userId,
        currency,
        transaction
      );

      await models.wallet.update(
        {
          balance: sequelize.literal(`balance + ${amount}`),
        },
        {
          where: { id: wallet.id },
          transaction,
        }
      );

      await models.transaction.create(
        {
          userId,
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount,
          fee: 0,
          description: description || `Deposit of ${amount} ${currency}`,
          referenceId,
        },
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      logError("spot_wallet_manager", error, __filename);
      throw error;
    }
  }

  /**
   * Withdraw funds from a user's SPOT wallet
   */
  async withdraw(
    userId: string,
    currency: string,
    amount: number,
    fee: number,
    referenceId?: string,
    description?: string
  ): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      const wallet = await models.wallet.findOne({
        where: {
          userId,
          currency,
          type: "SPOT",
        },
        lock: true,
        transaction,
      });

      if (!wallet) {
        await transaction.rollback();
        throw new Error("Wallet not found");
      }

      const available = wallet.balance - (wallet.inOrder || 0);
      const totalAmount = amount + fee;

      if (available < totalAmount) {
        await transaction.rollback();
        throw new Error("Insufficient funds");
      }

      await models.wallet.update(
        {
          balance: sequelize.literal(`balance - ${totalAmount}`),
        },
        {
          where: { id: wallet.id },
          transaction,
        }
      );

      await models.transaction.create(
        {
          userId,
          walletId: wallet.id,
          type: "WITHDRAW",
          status: "COMPLETED",
          amount: -amount,
          fee,
          description: description || `Withdrawal of ${amount} ${currency}`,
          referenceId,
        },
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      logError("spot_wallet_manager", error, __filename);
      throw error;
    }
  }

  /**
   * Add balance to a user's wallet (for pool trades)
   * Does not create transaction record - caller should handle that
   */
  async addBalance(
    userId: string,
    currency: string,
    amount: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction ?? (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const wallet = await this.getOrCreateWallet(
        userId,
        currency,
        useTransaction
      );

      await models.wallet.update(
        {
          balance: sequelize.literal(`balance + ${amount}`),
        },
        {
          where: { id: wallet.id },
          transaction: useTransaction,
        }
      );

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      return false;
    }
  }

  /**
   * Deduct balance from a user's wallet (for pool trades)
   * Does not create transaction record - caller should handle that
   */
  async deductBalance(
    userId: string,
    currency: string,
    amount: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction ?? (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const wallet = await models.wallet.findOne({
        where: {
          userId,
          currency,
          type: "SPOT",
        },
        lock: true,
        transaction: useTransaction,
      });

      if (!wallet) {
        if (shouldCommit) {
          await useTransaction.rollback();
        }
        return false;
      }

      await models.wallet.update(
        {
          balance: sequelize.literal(`GREATEST(balance - ${amount}, 0)`),
        },
        {
          where: { id: wallet.id },
          transaction: useTransaction,
        }
      );

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      return false;
    }
  }

  /**
   * Execute a pool trade - transfer funds between user and pool
   * This is a simplified version for pool trades where the pool doesn't have a wallet
   *
   * @param userId - User ID
   * @param baseCurrency - Base currency (e.g., BTC)
   * @param quoteCurrency - Quote currency (e.g., USDT)
   * @param side - BUY or SELL from user's perspective
   * @param baseAmount - Amount of base currency
   * @param quoteAmount - Amount of quote currency
   * @param fee - Fee charged to user
   * @param transaction - Optional database transaction
   */
  async executePoolTrade(
    userId: string,
    baseCurrency: string,
    quoteCurrency: string,
    side: "BUY" | "SELL",
    baseAmount: number,
    quoteAmount: number,
    fee: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const useTransaction = transaction ?? (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      // Get or create user wallets
      const baseWallet = await this.getOrCreateWallet(
        userId,
        baseCurrency,
        useTransaction
      );
      const quoteWallet = await this.getOrCreateWallet(
        userId,
        quoteCurrency,
        useTransaction
      );

      // Lock wallets for update
      await models.wallet.findOne({
        where: { id: baseWallet.id },
        lock: true,
        transaction: useTransaction,
      });
      await models.wallet.findOne({
        where: { id: quoteWallet.id },
        lock: true,
        transaction: useTransaction,
      });

      if (side === "BUY") {
        // User buys base currency from pool
        // Deduct quote currency (was locked in inOrder) and add base currency
        await models.wallet.update(
          {
            balance: sequelize.literal(`balance - ${quoteAmount + fee}`),
            inOrder: sequelize.literal(
              `GREATEST(COALESCE("inOrder", 0) - ${quoteAmount + fee}, 0)`
            ),
          },
          {
            where: { id: quoteWallet.id },
            transaction: useTransaction,
          }
        );

        await models.wallet.update(
          {
            balance: sequelize.literal(`balance + ${baseAmount}`),
          },
          {
            where: { id: baseWallet.id },
            transaction: useTransaction,
          }
        );
      } else {
        // User sells base currency to pool
        // Deduct base currency (was locked in inOrder) and add quote currency
        await models.wallet.update(
          {
            balance: sequelize.literal(`balance - ${baseAmount}`),
            inOrder: sequelize.literal(
              `GREATEST(COALESCE("inOrder", 0) - ${baseAmount}, 0)`
            ),
          },
          {
            where: { id: baseWallet.id },
            transaction: useTransaction,
          }
        );

        await models.wallet.update(
          {
            balance: sequelize.literal(`balance + ${quoteAmount - fee}`),
          },
          {
            where: { id: quoteWallet.id },
            transaction: useTransaction,
          }
        );
      }

      // Record admin profit from fee
      await this.recordAdminProfit(fee, quoteCurrency, useTransaction);

      if (shouldCommit) {
        await useTransaction.commit();
      }
      return true;
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logError("spot_wallet_manager", error, __filename);
      throw error;
    }
  }
}

export default SpotWalletManager;
