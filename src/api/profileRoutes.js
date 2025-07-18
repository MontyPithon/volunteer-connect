const express = require('express');
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles
} = require('./profileController');

/**
 * @route   GET /api/profiles
 * @desc    Get all user profiles (admin endpoint)
 * @access  Public (for demo purposes)
 */
router.get('/', getAllProfiles);

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get user profile by user ID
 * @access  Public (for demo purposes)
 */
router.get('/:userId', getProfile);

/**
 * @route   POST /api/profiles/:userId
 * @desc    Create a new user profile
 * @access  Public (for demo purposes)
 */
router.post('/:userId', createProfile);

/**
 * @route   PUT /api/profiles/:userId
 * @desc    Update an existing user profile
 * @access  Public (for demo purposes)
 */
router.put('/:userId', updateProfile);

/**
 * @route   DELETE /api/profiles/:userId
 * @desc    Delete a user profile
 * @access  Public (for demo purposes)
 */
router.delete('/:userId', deleteProfile);

module.exports = router; 