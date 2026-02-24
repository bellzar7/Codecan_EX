/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    // Add STOCK and INDEX to wallet type enum (keeping TWD_PAPER for backward compatibility during migration)
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER', 'FOREX', 'STOCK', 'INDEX') NOT NULL
    `);
  },

  async down(queryInterface, _Sequelize) {
    // First, migrate any STOCK/INDEX wallets back to SPOT (if rollback needed)
    await queryInterface.sequelize.query(`
      UPDATE wallet SET type = 'SPOT' WHERE type IN ('STOCK', 'INDEX')
    `);

    // Then remove STOCK and INDEX from the enum
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER', 'FOREX') NOT NULL
    `);
  },
};
