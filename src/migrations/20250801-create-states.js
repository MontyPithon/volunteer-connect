'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('States', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true }
    });
    await queryInterface.bulkInsert('States', [
      { name: 'requested' },
      { name: 'assigned' },
      { name: 'completed' }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('States');
  }
};
