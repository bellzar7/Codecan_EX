/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("faq");
    if (!tableInfo.videoUrl) {
      await queryInterface.addColumn("faq", "videoUrl", {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, _Sequelize) {
    const tableInfo = await queryInterface.describeTable("faq");
    if (tableInfo.videoUrl) {
      await queryInterface.removeColumn("faq", "videoUrl");
    }
  },
};
