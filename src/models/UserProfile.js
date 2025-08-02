const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserProfile = sequelize.define('UserProfile', {
  profile_id: {
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
  full_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  address1: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  address2: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state_code: {
    type: DataTypes.CHAR(2),
    allowNull: false,
  },
  zip_code: {
    type: DataTypes.STRING(9),
    allowNull: false,
  },
  preferences: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'userprofile',
  timestamps: false,
});

module.exports = UserProfile;