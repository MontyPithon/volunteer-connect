const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Skills = sequelize.define('Skills', {
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'skills',
  timestamps: false,
});

module.exports = Skills;
