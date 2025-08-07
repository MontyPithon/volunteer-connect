const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /api/history/:id
router.get('/:id', async (req, res) => {
  const volunteerId = req.params.id;

  try {
    const client = await db.connect();
    
    const result = await client.query(`
      SELECT 
        vh.history_id,
        vh.user_id,
        vh.event_id,
        vh.status,
        vh.performance_rating,
        vh.feedback,
        ed.event_name,
        ed.description,
        ed.event_date,
        ed.location
      FROM VolunteerHistory vh
      LEFT JOIN EventDetails ed ON vh.event_id = ed.event_id  
      WHERE vh.user_id = $1
      ORDER BY ed.event_date DESC
    `, [volunteerId]);
    
    await client.end();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No history found for this volunteer.' });
    }

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// PUT /api/history/confirm/:historyId
router.put('/confirm/:historyId', async (req, res) => {
  const historyId = req.params.historyId;

  try {
    const client = await db.connect();

    const result = await client.query(`
      UPDATE VolunteerHistory 
      SET status = 'Confirmed'
      WHERE history_id = $1 AND status = 'Assigned'
      RETURNING history_id, user_id, event_id, status
    `, [historyId]);
    
    await client.end();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'History record not found or not in assignable state.' });
    }

    res.json({ 
      message: 'Successfully confirmed attendance',
      history: result.rows[0] 
    });
  } catch (error) {
    console.error('Error confirming attendance:', error);
    res.status(500).json({ error: 'Failed to confirm attendance' });
  }
});

module.exports = router;
