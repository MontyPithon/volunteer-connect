const Joi = require('joi');

exports.validateProfile = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).required()
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters'
      }),
    address1: Joi.string().min(5).max(100).required()
      .messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 5 characters long',
        'string.max': 'Address cannot exceed 100 characters'
      }),
    address2: Joi.string().max(100).optional().allow('')
      .messages({
        'string.max': 'Address 2 cannot exceed 100 characters'
      }),
    city: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City cannot exceed 100 characters'
      }),
    state: Joi.string().length(2).required()
      .messages({
        'string.empty': 'State is required',
        'string.length': 'State must be exactly 2 characters'
      }),
    zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required()
      .messages({
        'string.empty': 'Zip code is required',
        'string.pattern.base': 'Zip code must be in format 12345 or 12345-6789'
      }),
    skills: Joi.array().min(1).required()
      .messages({
        'array.min': 'At least one skill must be selected'
      }),
    preferences: Joi.string().max(500).optional().allow('')
      .messages({
        'string.max': 'Preferences cannot exceed 500 characters'
      }),
    availability: Joi.array().min(1).required()
      .messages({
        'array.min': 'At least one available date must be selected'
      })
  });
  
  return schema.validate(data);
};

exports.validateProfileUpdate = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters'
      }),
    address1: Joi.string().min(5).max(100).optional()
      .messages({
        'string.min': 'Address must be at least 5 characters long',
        'string.max': 'Address cannot exceed 100 characters'
      }),
    address2: Joi.string().max(100).optional().allow('')
      .messages({
        'string.max': 'Address 2 cannot exceed 100 characters'
      }),
    city: Joi.string().min(2).max(100).optional()
      .messages({
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City cannot exceed 100 characters'
      }),
    state: Joi.string().length(2).optional()
      .messages({
        'string.length': 'State must be exactly 2 characters'
      }),
    zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).optional()
      .messages({
        'string.pattern.base': 'Zip code must be in format 12345 or 12345-6789'
      }),
    skills: Joi.array().min(1).optional()
      .messages({
        'array.min': 'At least one skill must be selected'
      }),
    preferences: Joi.string().max(500).optional().allow('')
      .messages({
        'string.max': 'Preferences cannot exceed 500 characters'
      }),
    availability: Joi.array().min(1).optional()
      .messages({
        'array.min': 'At least one available date must be selected'
      })
  });
  
  return schema.validate(data);
}; 