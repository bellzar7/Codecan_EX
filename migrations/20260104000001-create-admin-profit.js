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
    if (await tableExists("admin_profit")) {
      console.log("Table admin_profit already exists, skipping creation...");
    } else {
      await queryInterface.createTable("admin_profit", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        transactionId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: "transactionId",
        },
        type: {
          type: Sequelize.ENUM(
            "DEPOSIT",
            "WITHDRAW",
            "TRANSFER",
            "BINARY_ORDER",
            "EXCHANGE_ORDER",
            "INVESTMENT",
            "AI_INVESTMENT",
            "FOREX_DEPOSIT",
            "FOREX_WITHDRAW",
            "FOREX_INVESTMENT",
            "ICO_CONTRIBUTION",
            "STAKING",
            "P2P_TRADE"
          ),
          allowNull: false,
        },
        amount: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },
        chain: {
          type: Sequelize.STRING(191),
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "createdAt",
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "updatedAt",
        },
      });
      console.log("Created table admin_profit");
    }

    // Add indexes (idempotent)
    await safeAddIndex("admin_profit", ["transactionId"], {
      name: "adminProfitTransactionIdForeign",
    });

    await safeAddIndex("admin_profit", ["type"], {
      name: "idx_admin_profit_type",
    });

    await safeAddIndex("admin_profit", ["currency"], {
      name: "idx_admin_profit_currency",
    });

    await safeAddIndex("admin_profit", ["createdAt"], {
      name: "idx_admin_profit_created_at",
    });

    // Add foreign key constraint if transaction table exists
    if (await tableExists("transaction")) {
      try {
        await queryInterface.addConstraint("admin_profit", {
          fields: ["transactionId"],
          type: "foreign key",
          name: "admin_profit_transaction_fk",
          references: {
            table: "transaction",
            field: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
        console.log("Added foreign key constraint to transaction table");
      } catch (error) {
        console.log(
          `Foreign key constraint may already exist: ${error.message}`
        );
      }
    }
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

    if (await tableExists("admin_profit")) {
      // Remove foreign key constraint first
      try {
        await queryInterface.removeConstraint(
          "admin_profit",
          "admin_profit_transaction_fk"
        );
        console.log("Removed foreign key constraint");
      } catch (error) {
        console.log(`Skipping foreign key removal: ${error.message}`);
      }

      // Remove indexes
      await safeRemoveIndex("admin_profit", "adminProfitTransactionIdForeign");
      await safeRemoveIndex("admin_profit", "idx_admin_profit_type");
      await safeRemoveIndex("admin_profit", "idx_admin_profit_currency");
      await safeRemoveIndex("admin_profit", "idx_admin_profit_created_at");

      // Drop table
      await queryInterface.dropTable("admin_profit");
      console.log("Dropped table admin_profit");
    } else {
      console.log("Table admin_profit does not exist, skipping drop...");
    }
  },
};