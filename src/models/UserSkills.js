const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserSkills = sequelize.define('UserSkills', {
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
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'user_skills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Only track creation for skills
});

module.exports = UserSkills;