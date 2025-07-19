const users = require('./users');
const { validateProfile, validateProfileUpdate } = require('./profileValidation');

/**
 * Get user profile by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.profile) {
      return res.status(409).json({ error: 'Profile already exists for this user' });
    }

    const { error } = validateProfile(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const profileData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Convert availability dates to ISO strings if they're Date objects
    if (profileData.availability && Array.isArray(profileData.availability)) {
      profileData.availability = profileData.availability.map(date => 
        date instanceof Date ? date.toISOString().split('T')[0] : date
      );
    }

    user.profile = profileData;

    res.status(201).json({
      message: 'Profile created successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { error } = validateProfileUpdate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Convert availability dates to ISO strings if they're Date objects
    if (updateData.availability && Array.isArray(updateData.availability)) {
      updateData.availability = updateData.availability.map(date => 
        date instanceof Date ? date.toISOString().split('T')[0] : date
      );
    }

    // Merge existing profile with update data
    user.profile = {
      ...user.profile,
      ...updateData
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    delete user.profile;

    res.status(200).json({
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all profiles (for admin purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllProfiles = (req, res) => {
  try {
    const profiles = users
      .filter(user => user.profile)
      .map(user => ({
        userId: user.id,
        email: user.email,
        profile: user.profile
      }));

    res.status(200).json({
      message: 'Profiles retrieved successfully',
      profiles: profiles
    });
  } catch (error) {
    console.error('Error getting all profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 