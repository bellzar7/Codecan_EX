/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Helper function to safely add an index only if the table and columns exist
    const safeAddIndex = async (tableName, columns, options) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        const missingColumns = columns.filter((col) => !tableDescription[col]);

        if (missingColumns.length > 0) {
          console.log(
            `Skipping index ${options.name}: columns [${missingColumns.join(", ")}] not found in ${tableName}`
          );
          return false;
        }

        // Check if index already exists
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
        if (error.message?.includes("doesn't exist")) {
          console.log(
            `Skipping index ${options.name}: table ${tableName} does not exist`
          );
          return false;
        }
        throw error;
      }
    };

    // Index for order lookup by status and symbol - used when loading open orders
    await safeAddIndex("exchange_order", ["status", "symbol"], {
      name: "idx_exchange_order_status_symbol",
    });

    // Index for order lookup by user - used when fetching user's orders
    // Note: Using camelCase 'userId' as defined in the model
    await safeAddIndex("exchange_order", ["userId"], {
      name: "idx_exchange_order_user_id",
    });

    // Index for order lookup by price for matching
    await safeAddIndex("exchange_order", ["price"], {
      name: "idx_exchange_order_price",
    });

    // Composite index for matching queries - optimizes the main matching query
    // Note: Using camelCase 'createdAt' as defined in the model
    await safeAddIndex(
      "exchange_order",
      ["symbol", "side", "status", "price", "createdAt"],
      {
        name: "idx_exchange_order_matching",
      }
    );

    // Index for transaction user/wallet lookup - used for trade history
    // Note: Using camelCase 'userId' and 'walletId' as defined in the model
    await safeAddIndex("transaction", ["userId", "walletId"], {
      name: "idx_transaction_user_wallet",
    });

    // Index for transaction type/status lookup
    await safeAddIndex("transaction", ["type", "status"], {
      name: "idx_transaction_type_status",
    });

    // Index for wallet user/currency lookup - used for balance lookups
    // Note: Using camelCase 'userId' as defined in the model
    await safeAddIndex("wallet", ["userId", "currency"], {
      name: "idx_wallet_user_currency",
    });
  },

  async down(queryInterface) {
    // Helper function to safely remove an index
    const safeRemoveIndex = async (tableName, indexName) => {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        console.log(`Removed index ${indexName} from ${tableName}`);
      } catch (error) {
        console.log(`Skipping removal of index ${indexName}: ${error.message}`);
      }
    };

    await safeRemoveIndex("exchange_order", "idx_exchange_order_status_symbol");
    await safeRemoveIndex("exchange_order", "idx_exchange_order_user_id");
    await safeRemoveIndex("exchange_order", "idx_exchange_order_price");
    await safeRemoveIndex("exchange_order", "idx_exchange_order_matching");
    await safeRemoveIndex("transaction", "idx_transaction_user_wallet");
    await safeRemoveIndex("transaction", "idx_transaction_type_status");
    await safeRemoveIndex("wallet", "idx_wallet_user_currency");
  },
};
