/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("twd_market", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      symbol: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM("forex", "stocks", "indices"),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      pair: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      exchange: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isTrending: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      isHot: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex("twd_market", ["symbol"], {
      name: "twdMarketSymbolKey",
      unique: true,
    });

    await queryInterface.addIndex("twd_market", ["type"]);
    await queryInterface.addIndex("twd_market", ["status"]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("twd_market");
  },
};
