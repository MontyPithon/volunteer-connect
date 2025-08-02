const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserSkills = sequelize.define('UserSkills', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'usercredentials',
      key: 'user_id',
    },
  },
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
}, {
  tableName: 'userskills',
  timestamps: false,
});

module.exports = UserSkills;