const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const State = require('./State');
const User = require('./User');
const EventDetails = require('./EventDetails');

const VolunteerHistory = sequelize.define('VolunteerHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  volunteerId: { type: DataTypes.INTEGER, allowNull: false },
  eventId: { type: DataTypes.INTEGER, allowNull: false },
  stateId: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'VolunteerHistories', timestamps: false });

VolunteerHistory.belongsTo(User, { foreignKey: 'volunteerId' });
VolunteerHistory.belongsTo(EventDetails, { foreignKey: 'eventId' });
VolunteerHistory.belongsTo(State, { foreignKey: 'stateId' });

module.exports = VolunteerHistory;
