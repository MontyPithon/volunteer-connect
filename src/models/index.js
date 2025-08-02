const UserCredentials = require('./UserCredentials');
const UserProfile = require('./UserProfile');
const UserSkills = require('./UserSkills');
const UserAvailability = require('./UserAvailability');
const Skills = require('./Skills');
const State = require('./State');

// Define associations
UserCredentials.hasOne(UserProfile, { 
  foreignKey: 'user_id',
  sourceKey: 'user_id',
  onDelete: 'CASCADE'
});

UserCredentials.hasMany(UserSkills, { 
  foreignKey: 'user_id',
  sourceKey: 'user_id',
  onDelete: 'CASCADE'
});

UserCredentials.hasMany(UserAvailability, { 
  foreignKey: 'user_id',
  sourceKey: 'user_id',
  onDelete: 'CASCADE'
});

UserProfile.belongsTo(UserCredentials, { 
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

UserSkills.belongsTo(UserCredentials, { 
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

UserAvailability.belongsTo(UserCredentials, { 
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

// Direct associations for easier querying
UserProfile.hasMany(UserSkills, { 
  foreignKey: 'user_id',
  sourceKey: 'user_id'
});

UserProfile.hasMany(UserAvailability, { 
  foreignKey: 'user_id',
  sourceKey: 'user_id'
});

UserSkills.belongsTo(UserProfile, { 
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

UserAvailability.belongsTo(UserProfile, { 
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

// Skills associations
Skills.hasMany(UserSkills, {
  foreignKey: 'skill_id',
  sourceKey: 'skill_id',
  onDelete: 'CASCADE'
});

UserSkills.belongsTo(Skills, {
  foreignKey: 'skill_id',
  targetKey: 'skill_id'
});

// State associations
State.hasMany(UserProfile, {
  foreignKey: 'state_code',
  sourceKey: 'state_code'
});

UserProfile.belongsTo(State, {
  foreignKey: 'state_code',
  targetKey: 'state_code'
});

module.exports = {
  UserCredentials,
  UserProfile,
  UserSkills,
  UserAvailability,
  Skills,
  State,
};