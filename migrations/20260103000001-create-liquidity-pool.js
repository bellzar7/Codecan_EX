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
    if (await tableExists("liquidity_pool")) {
      console.log("Table liquidity_pool already exists, skipping creation...");
    } else {
      await queryInterface.createTable("liquidity_pool", {
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
        currency: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },
        pair: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },
        base_balance: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        quote_balance: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        base_in_order: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        quote_in_order: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        spread_percentage: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0.1,
        },
        min_order_size: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        max_order_size: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      console.log("Created table liquidity_pool");
    }

    // Add indexes (idempotent)
    await safeAddIndex("liquidity_pool", ["symbol"], {
      name: "idx_liquidity_pool_symbol",
      unique: true,
    });

    await safeAddIndex("liquidity_pool", ["is_active"], {
      name: "idx_liquidity_pool_active",
    });

    await safeAddIndex("liquidity_pool", ["currency", "pair"], {
      name: "idx_liquidity_pool_currency_pair",
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

    if (await tableExists("liquidity_pool")) {
      await safeRemoveIndex("liquidity_pool", "idx_liquidity_pool_symbol");
      await safeRemoveIndex("liquidity_pool", "idx_liquidity_pool_active");
      await safeRemoveIndex(
        "liquidity_pool",
        "idx_liquidity_pool_currency_pair"
      );
      await queryInterface.dropTable("liquidity_pool");
      console.log("Dropped table liquidity_pool");
    } else {
      console.log("Table liquidity_pool does not exist, skipping drop...");
    }
  },
};
