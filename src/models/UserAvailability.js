const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserAvailability = sequelize.define('UserAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_credentials',
      key: 'id',
    },
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'user_availability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Only track creation for availability
});

module.exports = UserAvailability;