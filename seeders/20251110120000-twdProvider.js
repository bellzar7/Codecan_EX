const { v4: uuidv4 } = require("uuid");

const TwdProviders = [
  {
    name: "twelvedata",
    title: "TwelveData",
    status: false, // Admin must enable manually
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Check if twd_provider table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("twd_provider")) {
      console.log("twd_provider table does not exist yet. Skipping seeder.");
      return;
    }

    // Fetch existing TWD providers to prevent duplicates
    const existingProviders = await queryInterface.sequelize.query(
      "SELECT name FROM twd_provider",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingProviderNames = new Set(
      existingProviders.map((provider) => provider.name)
    );

    // Filter out providers that already exist and assign a UUID to each new one
    const newProviders = TwdProviders.filter(
      (provider) => !existingProviderNames.has(provider.name)
    ).map((provider) => ({
      ...provider,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Only proceed with insertion if there are new providers
    if (newProviders.length > 0) {
      await queryInterface.bulkInsert("twd_provider", newProviders, {});
      console.log(`Seeded ${newProviders.length} TWD provider(s)`);
    } else {
      console.log("All TWD providers already exist");
    }
  },

  async down(queryInterface) {
    // Check if twd_provider table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("twd_provider")) {
      return;
    }

    await queryInterface.bulkDelete("twd_provider", null, {});
  },
};
