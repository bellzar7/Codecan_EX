/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("twd_order", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      symbol: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("MARKET", "LIMIT"),
        allowNull: false,
      },
      side: {
        type: Sequelize.ENUM("BUY", "SELL"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "OPEN",
          "CLOSED",
          "CANCELED",
          "EXPIRED",
          "REJECTED"
        ),
        allowNull: false,
        defaultValue: "OPEN",
      },
      price: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
      },
      filled: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
        defaultValue: 0,
      },
      remaining: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
      },
      cost: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
      },
      fee: {
        type: Sequelize.DECIMAL(30, 15),
        allowNull: false,
        defaultValue: 0,
      },
      feeCurrency: {
        type: Sequelize.STRING(10),
        allowNull: true,
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
    await queryInterface.addIndex("twd_order", ["userId"], {
      name: "twdOrderUserIdFkey",
    });

    await queryInterface.addIndex("twd_order", ["symbol"], {
      name: "twdOrderSymbol",
    });

    await queryInterface.addIndex("twd_order", ["status"], {
      name: "twdOrderStatus",
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("twd_order");
  },
};
