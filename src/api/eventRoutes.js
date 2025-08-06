const express = require('express');
const router = express.Router();

const db = require('../api/db');


// Get all events
router.get('/', async (req, res) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.location,
        e.address1,
        e.address2,
        e.city,
        e.state_code,
        e.zip_code,
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
      address1: event.address1,
      address2: event.address2,
      city: event.city,
      stateCode: event.state_code,
      zipCode: event.zip_code,
      requiredSkills: event.required_skills,
      urgency: event.urgency,
      eventDate: event.event_date
    }));
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  } finally {
    client.release();
  }
});

// Get all available skills
router.get('/skills', async (req, res) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT skill_id, skill_name
      FROM Skills
      ORDER BY skill_name ASC
    `);
    
    res.json({ skills: result.rows });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Error fetching skills' });
  } finally {
    client.release();
  }
});

// Get a specific event
router.get('/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.location,
        e.address1,
        e.address2,
        e.city,
        e.state_code,
        e.zip_code,
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
      WHERE $1 = e.event_id
      ORDER BY e.event_date;
    `, [req.params.id]);
    
    const event = result.rows.map(event => ({
      id: event.event_id,
      name: event.event_name,
      description: event.description,
      location: event.location,
      address1: event.address1,
      address2: event.address2,
      city: event.city,
      stateCode: event.state_code,
      zipCode: event.zip_code,
      requiredSkills: event.required_skills,
      urgency: event.urgency,
      eventDate: event.event_date
    }))[0];

    res.send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' + req.params.id });
  } finally {
    client.release();
  }
});

// Create a new event
router.post('/', async (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.location ||
      !req.body.city || !req.body.stateCode || !req.body.zipCode ||
      !req.body.requiredSkills || req.body.requiredSkills.length === 0 || 
      !req.body.urgency || !req.body.eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (req.body.name.length > 100) {
      return res.status(400).json({ message: 'Event name must be 100 characters or less' });
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const eventResult = await client.query(
      `INSERT INTO EventDetails (event_name, description, location, address1, address2, city, state_code, zip_code, urgency, event_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING event_id`,
      [
        req.body.name,
        req.body.description,
        req.body.location,
        req.body.address1 || null,
        req.body.address2 || null,
        req.body.city || null,
        req.body.stateCode,
        req.body.zipCode,
        req.body.urgency,
        req.body.eventDate
      ]
    );
    const eventId = eventResult.rows[0].event_id;
    for (const skillName of req.body.requiredSkills) {
      // Look up skill_id by name
      const skillResult = await client.query(
        'SELECT skill_id FROM Skills WHERE skill_name = $1',
        [skillName]
      );
      if (skillResult.rows.length === 0) {
        throw new Error(`Skill not found: ${skillName}`);
      }
      const skillId = skillResult.rows[0].skill_id;
      await client.query(
        'INSERT INTO EventRequiredSkills (event_id, skill_id) VALUES ($1, $2)',
        [eventId, skillId]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({
      id: eventId,
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      stateCode: req.body.stateCode,
      zipCode: req.body.zipCode,
      requiredSkills: req.body.requiredSkills,
      urgency: req.body.urgency,
      eventDate: req.body.eventDate
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  } finally {
    client.release();
  }
});

// Update an existing event
router.put('/:id', async (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.location ||
      !req.body.city || !req.body.stateCode || !req.body.zipCode ||
      !req.body.requiredSkills || req.body.requiredSkills.length === 0 || 
      !req.body.urgency || !req.body.eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE EventDetails
       SET event_name = $1, description = $2, location = $3, address1 = $4, address2 = $5, 
           city = $6, state_code = $7, zip_code = $8, urgency = $9, event_date = $10
       WHERE event_id = $11`,
      [
        req.body.name,
        req.body.description,
        req.body.location,
        req.body.address1 || null,
        req.body.address2 || null,
        req.body.city,
        req.body.stateCode,
        req.body.zipCode,
        req.body.urgency,
        req.body.eventDate,
        req.params.id
      ]
    );
    await client.query(
      `DELETE FROM EventRequiredSkills WHERE event_id = $1`,
      [req.params.id]
    );
    for (const skillName of req.body.requiredSkills) {
      // Look up skill_id by name
      const skillResult = await client.query(
        'SELECT skill_id FROM Skills WHERE skill_name = $1',
        [skillName]
      );
      if (skillResult.rows.length === 0) {
        throw new Error(`Skill not found: ${skillName}`);
      }
      const skillId = skillResult.rows[0].skill_id;
      await client.query(
        'INSERT INTO EventRequiredSkills (event_id, skill_id) VALUES ($1, $2)',
        [req.params.id, skillId]
      );
    }
    await client.query('COMMIT');
    res.json({
      message: 'Event updated successfully',
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      stateCode: req.body.stateCode,
      zipCode: req.body.zipCode,
      requiredSkills: req.body.requiredSkills,
      urgency: req.body.urgency,
      eventDate: req.body.eventDate
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  } finally {
    client.release();
  }
});

// Delete an existing event
router.delete('/:id', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM EventDetails WHERE event_id = $1`,
      [req.params.id]
    );
    await client.query(
      `DELETE FROM EventRequiredSkills WHERE event_id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Event deleted', id: req.params.id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  } finally {
    client.release();
  }
});

module.exports = router;