/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    // Add FOREX to wallet type enum (keeping TWD_PAPER for backward compatibility during migration)
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER', 'FOREX') NOT NULL
    `);
  },

  async down(queryInterface, _Sequelize) {
    // First, migrate any FOREX wallets back to SPOT (if rollback needed)
    await queryInterface.sequelize.query(`
      UPDATE wallet SET type = 'SPOT' WHERE type = 'FOREX'
    `);

    // Then remove FOREX from the enum
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER') NOT NULL
    `);
  },
};
