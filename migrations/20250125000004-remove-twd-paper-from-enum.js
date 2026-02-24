/**
 * Migration: Remove TWD_PAPER from wallet type enum
 *
 * Purpose:
 * - TWD_PAPER is a deprecated wallet type that has been migrated to SPOT
 * - This migration removes TWD_PAPER from the wallet.type ENUM column
 * - Must be run AFTER migration 20250125000003-migrate-twd-paper-wallets.js
 *
 * Safety:
 * - Verifies no TWD_PAPER wallets exist before removing from enum
 * - Reversible: Can re-add TWD_PAPER to enum if needed
 * - Uses transactions for atomic operations
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log("Starting TWD_PAPER enum removal...");

      // Step 1: Verify no TWD_PAPER wallets exist
      const [twdPaperWallets] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
        { transaction }
      );
      const count = twdPaperWallets[0]?.count || 0;

      if (count > 0) {
        throw new Error(
          `Cannot remove TWD_PAPER from enum: ${count} TWD_PAPER wallets still exist. ` +
            "Please run migration 20250125000003-migrate-twd-paper-wallets.js first."
        );
      }

      console.log("No TWD_PAPER wallets found. Proceeding with enum update...");

      // Step 2: Remove TWD_PAPER from wallet.type ENUM
      // This updates the enum to only include the 7 supported wallet types
      await queryInterface.sequelize.query(
        `
        ALTER TABLE wallet
        MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'FOREX', 'STOCK', 'INDEX') NOT NULL
        `,
        { transaction }
      );

      console.log(
        "Successfully removed TWD_PAPER from wallet.type enum. " +
          "Supported types: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX"
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("TWD_PAPER enum removal failed:", error);
      throw error;
    }
  },

  async down(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log("Rolling back TWD_PAPER enum removal...");

      // Re-add TWD_PAPER to wallet.type ENUM
      await queryInterface.sequelize.query(
        `
        ALTER TABLE wallet
        MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER', 'FOREX', 'STOCK', 'INDEX') NOT NULL
        `,
        { transaction }
      );

      console.log(
        "Successfully restored TWD_PAPER to wallet.type enum. " +
          "Note: This does NOT restore any migrated TWD_PAPER wallet data."
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("TWD_PAPER enum rollback failed:", error);
      throw error;
    }
  },
};
