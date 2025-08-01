const express = require('express');
const Joi = require('joi');
const router = express.Router();
const VolunteerHistory = require('../models/VolunteerHistory');
const State = require('../models/State');
const User = require('../models/User');
const EventDetails = require('../models/EventDetails');

// Validation schema
const historySchema = Joi.object({
  volunteerId: Joi.number().integer().required(),
  eventId: Joi.number().integer().required(),
  stateId: Joi.number().integer().required(),
  notes: Joi.string().allow('', null)
});

// GET history
router.get('/:volunteerId', async (req, res, next) => {
  try {
    const records = await VolunteerHistory.findAll({
      where: { volunteerId: req.params.volunteerId },
      include: [ State, { model: EventDetails, attributes: ['name'] } ],
      order: [['timestamp', 'ASC']]
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// POST history
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = historySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const rec = await VolunteerHistory.create(value);
    res.status(201).json(rec);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
