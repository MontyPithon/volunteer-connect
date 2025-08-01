const bcrypt = require('bcrypt');
const Joi = require('joi');
const { UserCredentials } = require('../models');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    // Validate request data
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Check if user already exists
    const existingUser = await UserCredentials.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await UserCredentials.create({
      email,
      password_hash: passwordHash
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    // Validate request data
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Get user from database
    const user = await UserCredentials.findOne({ 
      where: { email } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ 
      message: 'Login successful', 
      userId: user.id 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};