'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VolunteerHistories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      volunteerId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      eventId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'EventDetails', key: 'id' } },
      stateId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'States', key: 'id' } },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      notes: { type: Sequelize.TEXT }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('VolunteerHistories');
  }
};
