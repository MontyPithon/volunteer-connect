const { UserCredentials, UserProfile, UserSkills, UserAvailability } = require('../models');
const { validateProfile, validateProfileUpdate } = require('./profileValidation');

/**
 * Get all user profiles (admin endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile.findAll({
      include: [
        {
          model: UserCredentials,
          attributes: ['id', 'email']
        },
        {
          model: UserSkills,
          attributes: ['skill_name']
        },
        {
          model: UserAvailability,
          attributes: ['available_date']
        }
      ]
    });

    const formattedProfiles = profiles.map(profile => ({
      userId: profile.user_id,
      email: profile.UserCredential?.email,
      fullName: profile.full_name,
      address1: profile.address1,
      address2: profile.address2 || '',
      city: profile.city,
      state: profile.state,
      zip: profile.zip_code,
      skills: profile.UserSkills?.map(skill => ({ 
        value: skill.skill_name, 
        label: skill.skill_name 
      })) || [],
      preferences: profile.preferences || '',
      availability: profile.UserAvailabilities?.map(avail => avail.available_date) || []
    }));

    res.status(200).json({
      message: 'Profiles retrieved successfully',
      profiles: formattedProfiles
    });
  } catch (error) {
    console.error('Error getting all profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user profile by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get profile with associated data
    const profile = await UserProfile.findOne({
      where: { user_id: userId },
      include: [
        {
          model: UserSkills,
          attributes: ['skill_name']
        },
        {
          model: UserAvailability,
          attributes: ['available_date']
        }
      ]
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const responseData = {
      fullName: profile.full_name,
      address1: profile.address1,
      address2: profile.address2 || '',
      city: profile.city,
      state: profile.state,
      zip: profile.zip_code,
      skills: profile.UserSkills?.map(skill => ({ 
        value: skill.skill_name, 
        label: skill.skill_name 
      })) || [],
      preferences: profile.preferences || '',
      availability: profile.UserAvailabilities?.map(avail => avail.available_date) || []
    };

    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile: responseData
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
exports.createProfile = async (req, res) => {
  const transaction = await UserProfile.sequelize.transaction();

  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate request data
    const { error, value } = validateProfile(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, address1, address2, city, state, zip, skills, preferences, availability } = value;

    // Check if user exists
    const user = await UserCredentials.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ 
      where: { user_id: userId },
      transaction 
    });

    if (existingProfile) {
      await transaction.rollback();
      return res.status(409).json({ error: 'Profile already exists. Use PUT to update.' });
    }

    // Create profile
    const newProfile = await UserProfile.create({
      user_id: userId,
      full_name: fullName,
      address1,
      address2: address2 || null,
      city,
      state,
      zip_code: zip,
      preferences: preferences || null
    }, { transaction });

    // Create skills
    const skillsData = skills.map(skill => ({
      user_id: userId,
      skill_name: skill.value
    }));
    await UserSkills.bulkCreate(skillsData, { transaction });

    // Create availability
    const availabilityData = availability.map(date => ({
      user_id: userId,
      available_date: date
    }));
    await UserAvailability.bulkCreate(availabilityData, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Profile created successfully',
      profileId: newProfile.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  const transaction = await UserProfile.sequelize.transaction();

  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate request data
    const { error, value } = validateProfileUpdate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, address1, address2, city, state, zip, skills, preferences, availability } = value;

    // Check if profile exists
    const existingProfile = await UserProfile.findOne({ 
      where: { user_id: userId },
      transaction 
    });

    if (!existingProfile) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile
    await existingProfile.update({
      full_name: fullName,
      address1,
      address2: address2 || null,
      city,
      state,
      zip_code: zip,
      preferences: preferences || null
    }, { transaction });

    // Update skills if provided
    if (skills) {
      await UserSkills.destroy({ 
        where: { user_id: userId },
        transaction 
      });
      
      const skillsData = skills.map(skill => ({
        user_id: userId,
        skill_name: skill.value
      }));
      await UserSkills.bulkCreate(skillsData, { transaction });
    }

    // Update availability if provided
    if (availability) {
      await UserAvailability.destroy({ 
        where: { user_id: userId },
        transaction 
      });
      
      const availabilityData = availability.map(date => ({
        user_id: userId,
        available_date: date
      }));
      await UserAvailability.bulkCreate(availabilityData, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProfile = async (req, res) => {
  const transaction = await UserProfile.sequelize.transaction();

  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find and delete profile
    const deletedCount = await UserProfile.destroy({
      where: { user_id: userId },
      transaction
    });

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Associated skills and availability will be deleted by CASCADE

    await transaction.commit();

    res.status(200).json({
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};