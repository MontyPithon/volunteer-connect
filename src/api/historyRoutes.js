const express = require('express');
const router = express.Router();

const volunteerHistory = require('./data/history');

// GET /api/history/:id
router.get('/:id', (req, res) => {
  const volunteerId = req.params.id;

  if (!volunteerHistory[volunteerId]) {
    return res.status(404).json({ error: 'No history found for this volunteer.' });
  }

  res.json({ history: volunteerHistory[volunteerId] });
});

module.exports = router;
