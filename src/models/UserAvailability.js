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
      model: 'usercredentials',
      key: 'id',
    },
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'useravailability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Only track creation for availability
});

module.exports = UserAvailability;