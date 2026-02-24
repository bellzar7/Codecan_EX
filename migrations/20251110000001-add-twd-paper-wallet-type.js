/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    // Add TWD_PAPER to wallet type enum
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'TWD_PAPER') NOT NULL
    `);
  },

  async down(queryInterface, _Sequelize) {
    // Remove TWD_PAPER from wallet type enum
    // First, remove any TWD_PAPER wallets
    await queryInterface.sequelize.query(`
      DELETE FROM wallet WHERE type = 'TWD_PAPER'
    `);

    // Then modify the enum back
    await queryInterface.sequelize.query(`
      ALTER TABLE wallet
      MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES') NOT NULL
    `);
  },
};
