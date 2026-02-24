/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to check if table exists
    const tableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch {
        return false;
      }
    };

    // Helper function to safely add an index
    const safeAddIndex = async (tableName, columns, options) => {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexExists = indexes.some((idx) => idx.name === options.name);
        if (indexExists) {
          console.log(
            `Index ${options.name} already exists on ${tableName}, skipping...`
          );
          return false;
        }
        await queryInterface.addIndex(tableName, columns, options);
        console.log(`Created index ${options.name} on ${tableName}`);
        return true;
      } catch (error) {
        console.log(`Error adding index ${options.name}: ${error.message}`);
        return false;
      }
    };

    // Check if table already exists
    if (await tableExists("liquidity_pool_transaction")) {
      console.log(
        "Table liquidity_pool_transaction already exists, skipping creation..."
      );
    } else {
      await queryInterface.createTable("liquidity_pool_transaction", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        pool_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "liquidity_pool",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        type: {
          type: Sequelize.ENUM(
            "DEPOSIT",
            "WITHDRAW",
            "TRADE_BUY",
            "TRADE_SELL",
            "ADJUSTMENT"
          ),
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },
        amount: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        balance_before: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        balance_after: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        order_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: "exchange_order",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: "user",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      console.log("Created table liquidity_pool_transaction");
    }

    // Add indexes (idempotent)
    await safeAddIndex("liquidity_pool_transaction", ["pool_id"], {
      name: "idx_lp_transaction_pool",
    });

    await safeAddIndex("liquidity_pool_transaction", ["type"], {
      name: "idx_lp_transaction_type",
    });

    await safeAddIndex("liquidity_pool_transaction", ["created_at"], {
      name: "idx_lp_transaction_created",
    });

    await safeAddIndex("liquidity_pool_transaction", ["order_id"], {
      name: "idx_lp_transaction_order",
    });

    await safeAddIndex("liquidity_pool_transaction", ["user_id"], {
      name: "idx_lp_transaction_user",
    });
  },

  async down(queryInterface) {
    // Helper function to check if table exists
    const tableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch {
        return false;
      }
    };

    // Helper function to safely remove an index
    const safeRemoveIndex = async (tableName, indexName) => {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        console.log(`Removed index ${indexName} from ${tableName}`);
      } catch (error) {
        console.log(`Skipping removal of index ${indexName}: ${error.message}`);
      }
    };

    if (await tableExists("liquidity_pool_transaction")) {
      await safeRemoveIndex(
        "liquidity_pool_transaction",
        "idx_lp_transaction_pool"
      );
      await safeRemoveIndex(
        "liquidity_pool_transaction",
        "idx_lp_transaction_type"
      );
      await safeRemoveIndex(
        "liquidity_pool_transaction",
        "idx_lp_transaction_created"
      );
      await safeRemoveIndex(
        "liquidity_pool_transaction",
        "idx_lp_transaction_order"
      );
      await safeRemoveIndex(
        "liquidity_pool_transaction",
        "idx_lp_transaction_user"
      );
      await queryInterface.dropTable("liquidity_pool_transaction");
      console.log("Dropped table liquidity_pool_transaction");
    } else {
      console.log(
        "Table liquidity_pool_transaction does not exist, skipping drop..."
      );
    }
  },
};
