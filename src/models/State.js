const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const State = sequelize.define('State', {
  state_code: { 
    type: DataTypes.CHAR(2), 
    primaryKey: true 
  },
  state_name: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true 
  }
}, { tableName: 'states', timestamps: false });

module.exports = State;
