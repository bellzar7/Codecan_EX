/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("binary_order");

    // Add durationType column if it doesn't exist
    if (!tableDescription.durationType) {
      await queryInterface.addColumn("binary_order", "durationType", {
        type: Sequelize.ENUM("TIME", "TICKS"),
        allowNull: false,
        defaultValue: "TIME",
      });
    }

    // Add barrier column if it doesn't exist
    if (!tableDescription.barrier) {
      await queryInterface.addColumn("binary_order", "barrier", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
    }

    // Add strikePrice column if it doesn't exist
    if (!tableDescription.strikePrice) {
      await queryInterface.addColumn("binary_order", "strikePrice", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
    }

    // Add payoutPerPoint column if it doesn't exist
    if (!tableDescription.payoutPerPoint) {
      await queryInterface.addColumn("binary_order", "payoutPerPoint", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable("binary_order");

    // Remove payoutPerPoint column if it exists
    if (tableDescription.payoutPerPoint) {
      await queryInterface.removeColumn("binary_order", "payoutPerPoint");
    }

    // Remove strikePrice column if it exists
    if (tableDescription.strikePrice) {
      await queryInterface.removeColumn("binary_order", "strikePrice");
    }

    // Remove barrier column if it exists
    if (tableDescription.barrier) {
      await queryInterface.removeColumn("binary_order", "barrier");
    }

    // Remove durationType column if it exists
    if (tableDescription.durationType) {
      await queryInterface.removeColumn("binary_order", "durationType");
      // Also remove the ENUM type
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_binary_order_durationType";'
      );
    }
  },
};
