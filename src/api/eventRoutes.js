const express = require('express');
const router = express.Router();

const db = require('../../db');


// Get all events
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.location,
        e.urgency,
        e.event_date,
        COALESCE(
          (
            SELECT array_agg(s.skill_name)
            FROM EventRequiredSkills ers
            JOIN Skills s ON s.skill_id = ers.skill_id
            WHERE ers.event_id = e.event_id
          ), '{}'
        ) AS required_skills
      FROM EventDetails e
      ORDER BY e.event_date;
    `);
    
    const events = result.rows.map(event => ({
      id: event.event_id,
      name: event.event_name,
      description: event.description,
      location: event.location,
      requiredSkills: event.required_skills,
      urgency: event.urgency,
      eventDate: event.event_date
    }));
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
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

// Create a new event
router.post('/', (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.location ||
      !req.body.requiredSkills || req.body.requiredSkills.length === 0 || 
      !req.body.urgency || !req.body.eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (req.body.name.length > 100) {
      return res.status(400).json({ message: 'Event name must be 100 characters or less' });
  }
  
  const newEvent = {
      ...req.body,
      id: Date.now().toString()
  };
  
  res.status(201).json(newEvent);
});

// Update an existing event
router.put('/:id', (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.location ||
      !req.body.requiredSkills || req.body.requiredSkills.length === 0 || 
      !req.body.urgency || !req.body.eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const updatedEvent = {
      ...req.body,
      id: req.params.id
  };
  
  res.json(updatedEvent);
});

// Delete an existing event
router.delete('/:id', (req, res) => {
  res.json({ message: 'Event deleted', id: req.params.id });
});



module.exports = router;