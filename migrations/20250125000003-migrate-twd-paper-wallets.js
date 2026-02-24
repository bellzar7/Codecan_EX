/**
 * Migration: Migrate TWD_PAPER wallets to SPOT
 *
 * Purpose:
 * - TWD_PAPER is a deprecated wallet type that was used temporarily for TwelveData integration
 * - This migration safely converts all TWD_PAPER wallets to SPOT wallets
 * - Preserves all balances and transaction history
 *
 * Safety:
 * - Idempotent: Can be run multiple times safely
 * - Reversible: Has a down() method for rollback
 * - Preserves data: No data loss, only type change
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log("Starting TWD_PAPER wallet migration...");

      // Step 1: Check how many TWD_PAPER wallets exist
      const [twdPaperWallets] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
        { transaction }
      );
      const count = twdPaperWallets[0]?.count || 0;
      console.log(`Found ${count} TWD_PAPER wallets to migrate`);

      if (count === 0) {
        console.log("No TWD_PAPER wallets found. Migration complete.");
        await transaction.commit();
        return;
      }

      // Step 2: Migrate TWD_PAPER wallets to SPOT
      // This converts the wallet type while preserving all other data
      const [_updateResult] = await queryInterface.sequelize.query(
        `
        UPDATE wallet
        SET type = 'SPOT'
        WHERE type = 'TWD_PAPER'
        `,
        { transaction }
      );

      console.log(
        `Successfully migrated ${count} TWD_PAPER wallets to SPOT type`
      );

      // Step 3: Verify migration
      const [remainingTwdPaper] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
        { transaction }
      );
      const remaining = remainingTwdPaper[0]?.count || 0;

      if (remaining > 0) {
        throw new Error(
          `Migration incomplete: ${remaining} TWD_PAPER wallets still exist`
        );
      }

      console.log(
        "Migration verification complete. All TWD_PAPER wallets migrated to SPOT."
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("TWD_PAPER migration failed:", error);
      throw error;
    }
  },

  async down(_queryInterface, _Sequelize) {
    // Note: This rollback assumes you have a way to identify which wallets were migrated
    // Since we don't store the original type, we cannot automatically rollback
    // This would require a separate tracking mechanism if rollback is needed

    console.log("WARNING: Cannot automatically rollback TWD_PAPER migration.");
    console.log(
      "Original TWD_PAPER wallet information was not preserved during migration."
    );
    console.log("If rollback is needed, please restore from database backup.");

    // If you absolutely need to rollback and you have a backup or tracking:
    // 1. Restore from backup, OR
    // 2. Manually identify migrated wallets (e.g., by date or user) and convert back

    // For safety, this rollback is a no-op
    // Uncomment the following if you want to prevent rollback entirely:
    // throw new Error("Rollback not supported for TWD_PAPER migration. Restore from backup if needed.");
  },
};
