const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserProfile = sequelize.define('UserProfile', {
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
  state: {
    type: DataTypes.STRING(2),
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
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserProfile;