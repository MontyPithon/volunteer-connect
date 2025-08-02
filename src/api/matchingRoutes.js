const express = require('express');
const router = express.Router();

const db = require('./db'); // Add db import

// Matching logic function
function matchVolunteerToEvents(volunteer, events) {
  return events.filter(event => {
    // Ensure arrays exist
    const volunteerSkills = volunteer.skills || [];
    const eventSkills = event.requiredSkills || [];
    const volunteerAvailability = volunteer.availability || [];
    
    // Check if volunteer has at least one of the required skills
    const skillMatch = eventSkills.length === 0 || 
                      eventSkills.some(skill => volunteerSkills.includes(skill));
    
    // Check if volunteer is available on the event date
    const dateMatch = volunteerAvailability.includes(event.date);
    
    // Only require skill and date match, location match is no longer required
    return skillMatch && dateMatch;
  });
}

// POST /api/match
router.post('/', async (req, res) => {
  const volunteer = req.body;

  // Validate input with more flexibility
  if (!volunteer) {
    return res.status(400).json({ error: 'Invalid volunteer data: missing volunteer object.' });
  }
  
  // Ensure skills and availability are arrays
  volunteer.skills = volunteer.skills || [];
  volunteer.availability = volunteer.availability || [];
  
  // City is no longer required for matching

  const client = await db.connect();
  try {
    // Get all events with their required skills
    const eventResult = await client.query(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.location,
        e.urgency,
        e.event_date,
        TO_CHAR(e.event_date, 'YYYY-MM-DD') AS formatted_date,
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
    
    const events = eventResult.rows.map(event => ({
      id: event.event_id,
      name: event.event_name,
      description: event.description,
      location: event.location,
      requiredSkills: event.required_skills || [],
      urgency: event.urgency,
      date: event.formatted_date // Using the formatted date for easier comparison
    }));
    
    // Use the matching function with the fetched events
    const matchedEvents = matchVolunteerToEvents(volunteer, events);
    
    res.json({ matches: matchedEvents });
  } catch (error) {
    console.error('Error matching events:', error);
    res.status(500).json({ error: 'Error matching events' });
  } finally {
    client.release();
  }
});

// POST /api/match/assign - Assign a volunteer to an event
router.post('/assign', async (req, res) => {
  const { volunteerId, eventId } = req.body;
  
  // Validate input
  if (!volunteerId || !eventId) {
    return res.status(400).json({ error: 'Volunteer ID and Event ID are required.' });
  }
  
  try {
    const client = await db.connect();
    
    // Check if volunteer exists
    const volunteerResult = await client.query(
      'SELECT user_id FROM UserCredentials WHERE user_id = $1 AND role = $2',
      [volunteerId, 'volunteer']
    );
    
    if (volunteerResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Volunteer not found.' });
    }
    
    // Check if event exists
    const eventResult = await client.query(
      'SELECT event_id FROM EventDetails WHERE event_id = $1',
      [eventId]
    );
    
    if (eventResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    // Check if assignment already exists
    const checkResult = await client.query(
      'SELECT * FROM VolunteerHistory WHERE user_id = $1 AND event_id = $2',
      [volunteerId, eventId]
    );
    
    if (checkResult.rows.length > 0) {
      client.release();
      return res.status(409).json({ error: 'Volunteer is already assigned to this event.' });
    }
    
    // Create assignment with "Assigned" status
    const assignResult = await client.query(
      'INSERT INTO VolunteerHistory (user_id, event_id, status) VALUES ($1, $2, $3) RETURNING history_id',
      [volunteerId, eventId, 'Assigned']
    );
    
    // Create notification for the volunteer
    await client.query(
      'INSERT INTO Notifications (user_id, message) VALUES ($1, $2)',
      [volunteerId, `You have been assigned to event #${eventId}. Please confirm your participation.`]
    );
    
    client.release();
    
    return res.status(201).json({
      message: 'Volunteer successfully assigned to event.',
      assignmentId: assignResult.rows[0].history_id,
      volunteerId,
      eventId,
      status: 'Assigned'
    });
    
  } catch (err) {
    console.error('Error assigning volunteer to event:', err);
    return res.status(500).json({ error: 'Failed to assign volunteer to event.' });
  }
});

// Get all profiles with skills
router.get('/profiles', async (req, res) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT 
        uc.user_id,
        up.full_name,
        up.city,
        up.state_code,
        COALESCE(
          (
            SELECT array_agg(s.skill_name)
            FROM UserSkills us
            JOIN Skills s ON s.skill_id = us.skill_id
            WHERE us.user_id = uc.user_id
          ), '{}'
        ) AS skills,
        COALESCE(
          (
            SELECT array_agg(TO_CHAR(ua.available_date, 'YYYY-MM-DD'))
            FROM UserAvailability ua
            WHERE ua.user_id = uc.user_id
          ), '{}'
        ) AS availability
      FROM UserCredentials uc
      JOIN UserProfile up ON up.user_id = uc.user_id
      WHERE uc.role = 'volunteer'
      ORDER BY up.full_name
    `);
    
    const profiles = result.rows.map(profile => ({
      userId: profile.user_id,
      fullName: profile.full_name,
      city: profile.city,
      state: profile.state_code,
      skills: profile.skills,
      availability: profile.availability
    }));
    
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Error fetching profiles' });
  } finally {
    client.release();
  }
});

// Get a specific profile with skills
router.get('/profiles/:id', async (req, res) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT 
        uc.user_id,
        up.full_name,
        up.city,
        up.state_code,
        COALESCE(
          (
            SELECT array_agg(s.skill_name)
            FROM UserSkills us
            JOIN Skills s ON s.skill_id = us.skill_id
            WHERE us.user_id = uc.user_id
          ), '{}'
        ) AS skills,
        COALESCE(
          (
            SELECT array_agg(TO_CHAR(ua.available_date, 'YYYY-MM-DD'))
            FROM UserAvailability ua
            WHERE ua.user_id = uc.user_id
          ), '{}'
        ) AS availability
      FROM UserCredentials uc
      JOIN UserProfile up ON up.user_id = uc.user_id
      WHERE uc.user_id = $1
      ORDER BY up.full_name
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const profile = result.rows[0];
    res.json({
      userId: profile.user_id,
      fullName: profile.full_name,
      city: profile.city,
      state: profile.state_code,
      skills: profile.skills,
      availability: profile.availability
    });
  } catch (error) {
    console.error(`Error fetching profile ${req.params.id}:`, error);
    res.status(500).json({ error: `Error fetching profile ${req.params.id}` });
  } finally {
    client.release();
  }
});


module.exports = router;
