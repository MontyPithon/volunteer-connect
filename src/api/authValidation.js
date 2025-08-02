const Joi = require('joi');

exports.validateRegistration = (data) => Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('volunteer', 'admin').default('volunteer')
}).validate(data);

exports.validateLogin = (data) => Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
}).validate(data);
