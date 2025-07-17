const express = require('express');
const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  // fetch events from database
  res.json({ events: [
    {
        id: '1',
        name: 'Community Cleanup',
        description: 'A day of cleaning up the local park.',
        location: 'Central Park, 45th St',
        requiredSkills: ['Cleaning'],
        urgency: 'High',
        eventDate: '07-12-2025'
    },
    {
        id: '2',
        name: 'Food Drive',
        description: 'Collecting food items for the local food bank.',
        location: 'Community Center, 123 Main St',
        requiredSkills: ['Organizing', 'Communication'],
        urgency: 'Medium',
        eventDate: '07-01-2025'
    }
  ]});
});

// Get a specific event
router.get('/:id', (req, res) => {
    res.json({
        id: req.params.id,
        name: 'Sample Event',
        description: 'This is a sample event description.',
        location: 'Sample Location, 123 Street',
        requiredSkills: ['Sample Skill'],
        urgency: 'Medium',
        eventDate: '08-01-2025'
    });
});




module.exports = router;