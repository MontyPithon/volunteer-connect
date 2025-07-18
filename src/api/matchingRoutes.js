const express = require('express');
const router = express.Router();

const events = require('../data/events');
const volunteers = require('../data/volunteers');

// Matching logic function
function matchVolunteerToEvents(volunteer, events) {
  return events.filter(event => {
    const skillMatch = event.requiredSkills.some(skill => volunteer.skills.includes(skill));
    const dateMatch = volunteer.availability.includes(event.date);
    const locationMatch = event.location.includes(volunteer.city);
    return skillMatch && dateMatch && locationMatch;
  });
}

// POST /api/match
router.post('/', (req, res) => {
  const volunteer = req.body;

  if (!volunteer || !volunteer.skills || !volunteer.availability || !volunteer.city) {
    return res.status(400).json({ error: 'Invalid volunteer data.' });
  }

  const matchedEvents = matchVolunteerToEvents(volunteer, events);
  res.json({ matches: matchedEvents });
});

module.exports = router;
