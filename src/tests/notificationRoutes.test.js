const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../api/notificationRoutes');

// Mock the database connection
jest.mock('../api/db', () => ({
  connect: jest.fn().mockReturnValue({
    query: jest.fn(),
    release: jest.fn()
  })
}));

const db = require('../api/db');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/notifications/:userId', () => {
    test('should return all notifications for a user', async () => {
      // Mock the database response
      const mockRows = [
        { 
          notification_id: 1, 
          message: 'Test notification', 
          is_read: false, 
          created_at: new Date().toISOString()
        }
      ];
      
      db.connect().query.mockResolvedValueOnce({ rows: mockRows });

      const response = await request(app)
        .get('/api/notifications/1')
        .expect('Content-Type', /json/)
        .expect(200);

      // Check that we get the correct response structure
      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBe(1);
      expect(response.body.notifications[0]).toHaveProperty('notification_id', 1);
      expect(response.body.notifications[0]).toHaveProperty('message', 'Test notification');
      expect(response.body.notifications[0]).toHaveProperty('is_read', false);
      expect(response.body.notifications[0]).toHaveProperty('created_at');
      
      // Verify the database was called correctly
      expect(db.connect).toHaveBeenCalled();
      expect(db.connect().query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT notification_id, message, is_read, created_at'),
        ['1']
      );
      expect(db.connect().release).toHaveBeenCalled();
    });

    test('should return empty array for user with no notifications', async () => {
      // Mock empty database response
      db.connect().query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/notifications/999')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBe(0);
      
      // Verify the database was called correctly
      expect(db.connect).toHaveBeenCalled();
      expect(db.connect().query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT notification_id, message, is_read, created_at'),
        ['999']
      );
    });
    
    test('should handle database errors', async () => {
      // Mock database error
      db.connect().query.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/notifications/1')
        .expect('Content-Type', /json/)
        .expect(500);
        
      expect(response.body).toHaveProperty('message', 'Error fetching notifications');
    });
  });

  describe('POST /api/notifications', () => {
    test('should create a new notification with valid data', async () => {
      // Mock database response for insertion
      db.connect().query.mockResolvedValueOnce({ 
        rows: [{ notification_id: 123 }] 
      });

      const newNotification = {
        userId: '1',
        message: 'Test notification'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(newNotification)
        .expect('Content-Type', /json/)
        .expect(201);

      // Check that we get the correct response
      expect(response.body).toHaveProperty('id', 123);
      expect(response.body.message).toBe(newNotification.message);
      expect(response.body.userId).toBe(newNotification.userId);
      
      // Verify the database was called correctly
      expect(db.connect).toHaveBeenCalled();
      expect(db.connect().query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Notifications'),
        ['1', 'Test notification']
      );
      expect(db.connect().release).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      // Test with missing userId
      const missingUserId = {
        message: 'Test notification'
      };

      await request(app)
        .post('/api/notifications')
        .send(missingUserId)
        .expect(400);
        
      expect(db.connect().query).not.toHaveBeenCalled();
      
      // Test with missing message
      const missingMessage = {
        userId: '1'
      };
      
      await request(app)
        .post('/api/notifications')
        .send(missingMessage)
        .expect(400);
    });
    
    test('should handle database errors during creation', async () => {
      // Mock database error
      db.connect().query.mockRejectedValueOnce(new Error('Database error'));
      
      const newNotification = {
        userId: '1',
        message: 'Test notification'
      };
      
      const response = await request(app)
        .post('/api/notifications')
        .send(newNotification)
        .expect(500);
        
      expect(response.body).toHaveProperty('message', 'Error creating notification');
    });
  });

  describe('DELETE /api/notifications/:userId/:notificationId', () => {
    test('should delete a notification', async () => {
      // Mock successful deletion
      db.connect().query.mockResolvedValueOnce({});
      
      const response = await request(app)
        .delete('/api/notifications/1/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification deleted');
      expect(response.body).toHaveProperty('id', '1');
      
      // Verify the database was called correctly
      expect(db.connect).toHaveBeenCalled();
      expect(db.connect().query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM Notifications'),
        ['1', '1']
      );
      expect(db.connect().release).toHaveBeenCalled();
    });
    
    test('should handle database errors during deletion', async () => {
      // Mock database error
      db.connect().query.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .delete('/api/notifications/1/1')
        .expect(500);
        
      expect(response.body).toHaveProperty('message', 'Error deleting notification');
    });
  });
});
