const express = require('express');
const router = express.Router();

const db = require('../api/db'); 



// Get all notifications for a user
router.get('/:userId', async (req, res) => {
    const client = await db.connect();
    const userId = req.params.userId;
    try {
        const result = await client.query(`
            SELECT notification_id, message, is_read, created_at
            FROM Notifications
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `, [userId]);

        res.json({ notifications: result.rows });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    } finally {
        client.release();
    }
});

// Mark a notification as read/ delete
router.delete('/:userId/:notificationId', async (req, res) => {
    const client = await db.connect();
    try {
        await client.query(`
            DELETE FROM Notifications
            WHERE user_id = $1 AND notification_id = $2
        `, [req.params.userId, req.params.notificationId]);
        res.json({ message: 'Notification deleted', id: req.params.notificationId });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    } finally {
        client.release();
    }
});

// Create a new notification
router.post('/', async (req, res) => {
    const client = await db.connect();
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const result = await client.query(`
            INSERT INTO Notifications (user_id, message)
            VALUES ($1, $2)
            RETURNING notification_id;
        `, [userId, message]);
        res.status(201).json({ id: result.rows[0].notification_id, userId, message });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error creating notification' });
    } finally {
        client.release();
    }
});

module.exports = router;
