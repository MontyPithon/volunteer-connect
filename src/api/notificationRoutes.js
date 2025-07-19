const express = require('express');
const router = express.Router();

// Get all notifications for a user
router.get('/:userId', (req, res) => {
    const notifications = [
        { 
            id: 1, 
            type: 'event', 
            message: 'You have been assigned to a new event: Beach Cleanup on July 15.', 
            date: '2025-07-01',
            userId: '1'
        },
        { 
            id: 2, 
            type: 'update', 
            message: 'The event schedule for July has been updated. Please check your profile for details.', 
            date: '2025-07-02',
            userId: '1'
        },
        { 
            id: 3, 
            type: 'reminder', 
            message: 'Your next volunteering event is on July 20.', 
            date: '2025-07-10',
            userId: '1'
        }
    ];

    const userNotifications = notifications.filter(notif => notif.userId === req.params.userId);
    res.json(userNotifications);
});

// Mark a notification as read/ delete
router.delete('/:userId/:notificationId', (req, res) => {
    res.json({ message: 'Notification marked as read', id: req.params.notificationId });
});

// Create a new notification
router.post('/', (req, res) => {
    const { userId, type, message } = req.body;
    
    if (!userId || !type || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newNotification = {
        id: Date.now(),
        type,
        message,
        date: new Date().toISOString().split('T')[0],
        userId
    };

    res.status(201).json(newNotification);
});

module.exports = router;
