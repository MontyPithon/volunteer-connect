const UserCredentials = require('./UserCredentials');
const UserProfile = require('./UserProfile');
const UserSkills = require('./UserSkills');
const UserAvailability = require('./UserAvailability');

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

module.exports = {
  UserCredentials,
  UserProfile,
  UserSkills,
  UserAvailability,
};