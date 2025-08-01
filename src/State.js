const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const State = sequelize.define('State', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { tableName: 'States', timestamps: false });

module.exports = State;
