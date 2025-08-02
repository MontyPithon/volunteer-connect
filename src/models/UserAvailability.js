const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserAvailability = sequelize.define('UserAvailability', {
  availability_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usercredentials',
      key: 'user_id',
    },
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'useravailability',
  timestamps: false,
});

module.exports = UserAvailability;