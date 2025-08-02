const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserCredentials = sequelize.define('UserCredentials', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verification_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'usercredentials',
  timestamps: false,
});

module.exports = UserCredentials;