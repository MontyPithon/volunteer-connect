const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../api/notificationRoutes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification Routes', () => {
  describe('GET /api/notifications/:userId', () => {
    test('should return all notifications for a user', async () => {
      const response = await request(app)
        .get('/api/notifications/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('userId', '1');
    });

    test('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .get('/api/notifications/999')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/notifications', () => {
    test('should create a new notification with valid data', async () => {
      const newNotification = {
        userId: '1',
        type: 'test',
        message: 'Test notification'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(newNotification)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(newNotification.type);
      expect(response.body.message).toBe(newNotification.message);
      expect(response.body.userId).toBe(newNotification.userId);
      expect(response.body).toHaveProperty('date');
    });

    test('should return 400 if required fields are missing', async () => {
      const invalidNotification = {
        type: 'test'
      };

      await request(app)
        .post('/api/notifications')
        .send(invalidNotification)
        .expect(400);
    });
  });

  describe('DELETE /api/notifications/:userId/:notificationId', () => {
    test('should delete a notification', async () => {
      const response = await request(app)
        .delete('/api/notifications/1/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification marked as read');
      expect(response.body).toHaveProperty('id', '1');
    });
  });
});
