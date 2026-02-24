/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
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
    if (await tableExists("futures_market")) {
      console.log("Table futures_market already exists, skipping creation...");
    } else {
      await queryInterface.createTable("futures_market", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },
        pair: {
          type: Sequelize.STRING(191),
          allowNull: false,
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
        metadata: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });
      console.log("Created table futures_market");
    }

    // Add unique index on currency and pair combination (idempotent)
    await safeAddIndex("futures_market", ["currency", "pair"], {
      name: "futuresMarketCurrencyPairKey",
      unique: true,
    });
  },

  down: async (queryInterface) => {
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

    if (await tableExists("futures_market")) {
      await safeRemoveIndex("futures_market", "futuresMarketCurrencyPairKey");
      await queryInterface.dropTable("futures_market");
      console.log("Dropped table futures_market");
    } else {
      console.log("Table futures_market does not exist, skipping drop...");
    }
  },
};
