const request = require('supertest');
const express = require('express');
const eventRoutes = require('../api/eventRoutes');

// Mock the database module
jest.mock('../../db', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn()
  };
  return {
    connect: jest.fn().mockResolvedValue(mockClient),
    query: jest.fn()
  };
});

const db = require('../../db');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);

describe('Event Routes', () => {
  let mockClient;
  
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    
    // Default mock for client.query in GET all events
    mockClient.query.mockImplementation((query, params) => {
      if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') {
        return Promise.resolve();
      }
      
      if (query.includes('SELECT') && query.includes('FROM EventDetails e')) {
        return Promise.resolve({
          rows: [
            {
              event_id: 1,
              event_name: 'Community Garden',
              description: 'Help plant a community garden',
              location: 'City Park',
              urgency: 'Medium',
              event_date: '2025-08-15',
              required_skills: ['Gardening', 'Landscaping']
            }
          ]
        });
      }
      // For Skills query
      if (query.includes('SELECT skill_id, skill_name FROM Skills')) {
        return Promise.resolve({
          rows: [
            { skill_id: 1, skill_name: 'Gardening' },
            { skill_id: 2, skill_name: 'Landscaping' }
          ]
        });
      }
      
      // For single event query
      if (query.includes('WHERE $1 = e.event_id')) {
        return Promise.resolve({
          rows: [
            {
              event_id: 1,
              event_name: 'Community Garden',
              description: 'Help plant a community garden',
              location: 'City Park',
              urgency: 'Medium',
              event_date: '2025-08-15',
              required_skills: ['Gardening', 'Landscaping']
            }
          ]
        });
      }

      // For INSERT queries
      if (query.includes('INSERT INTO EventDetails')) {
        return Promise.resolve({
          rows: [{ event_id: 1 }]
        });
      }

      // For skill lookup
      if (query.includes('SELECT skill_id FROM Skills WHERE skill_name')) {
        // Check if we're looking for a specific skill that should fail
        if (params && params[0] === 'NonExistentSkill') {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [{ skill_id: 1 }]
        });
      }
      
      // For DELETE and UPDATE queries
      if (query.includes('DELETE FROM') || query.includes('UPDATE EventDetails')) {
        return Promise.resolve({ rowCount: 1 });
      }
      
      return Promise.resolve({ rows: [] });
    });
    
    db.connect.mockResolvedValue(mockClient);
  });

  describe('GET /api/events', () => {
    test('should return all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0]).toHaveProperty('id');
      expect(response.body.events[0]).toHaveProperty('name');
      expect(response.body.events[0]).toHaveProperty('description');
    });

    test('should handle database errors', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/events')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error fetching events');
    });
  });

  describe('GET /api/events/skills', () => {
    test('should return all skills', async () => {
      // Override the mock for the skills endpoint specifically
      mockClient.query.mockImplementationOnce(() => {
        return Promise.resolve({
          rows: [
            { skill_id: 1, skill_name: 'Gardening' },
            { skill_id: 2, skill_name: 'Landscaping' }
          ]
        });
      });
      
      const response = await request(app)
        .get('/api/events/skills')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('skills');
      expect(Array.isArray(response.body.skills)).toBe(true);
      expect(response.body.skills.length).toBe(2);
    });
  });

  describe('GET /api/events/:id', () => {
    test('should return a specific event', async () => {
      const response = await request(app)
        .get('/api/events/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Community Garden');
    });

    test('should handle database errors', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/events/1')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.message).toContain('Error fetching event');
    });
  });

  describe('POST /api/events', () => {
    test('should create a new event with valid data', async () => {
      const newEvent = {
        name: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['Gardening'],
        urgency: 'High',
        eventDate: '2025-07-20'
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newEvent.name);
      expect(response.body.description).toBe(newEvent.description);
      
      // Verify the transaction was committed
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle skill lookup failure', async () => {
      const newEvent = {
        name: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['NonExistentSkill'],
        urgency: 'High',
        eventDate: '2025-07-20'
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error creating event');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const invalidEvent = {
        name: 'Test Event'
      };

      await request(app)
        .post('/api/events')
        .send(invalidEvent)
        .expect(400);
    });

    test('should return 400 if event name is too long', async () => {
      const invalidEvent = {
        name: 'a'.repeat(101),
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['Gardening'],
        urgency: 'High',
        eventDate: '2025-07-20'
      };

      await request(app)
        .post('/api/events')
        .send(invalidEvent)
        .expect(400);
    });
  });

  describe('PUT /api/events/:id', () => {
    test('should update an event with valid data', async () => {
      const updatedEvent = {
        name: 'Updated Event',
        description: 'Updated Description',
        location: 'Updated Location',
        requiredSkills: ['Gardening'],
        urgency: 'Low',
        eventDate: '2025-07-21'
      };

      const response = await request(app)
        .put('/api/events/1')
        .send(updatedEvent)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event updated successfully');
      expect(response.body.id).toBe('1');
      expect(response.body.name).toBe(updatedEvent.name);
      expect(response.body.description).toBe(updatedEvent.description);
      
      // Verify the transaction was committed
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle database errors during update', async () => {
      mockClient.query.mockImplementation((query) => {
        if (query.includes('UPDATE EventDetails')) {
          return Promise.reject(new Error('Database update error'));
        }
        if (query === 'BEGIN' || query === 'ROLLBACK') {
          return Promise.resolve();
        }
        return Promise.resolve({ rows: [] });
      });

      const updatedEvent = {
        name: 'Updated Event',
        description: 'Updated Description',
        location: 'Updated Location',
        requiredSkills: ['Gardening'],
        urgency: 'Low',
        eventDate: '2025-07-21'
      };

      const response = await request(app)
        .put('/api/events/1')
        .send(updatedEvent)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error updating event');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const invalidEvent = {
        name: 'Updated Event'
      };

      await request(app)
        .put('/api/events/1')
        .send(invalidEvent)
        .expect(400);
    });
  });

  describe('DELETE /api/events/:id', () => {
    test('should delete an event', async () => {
      const response = await request(app)
        .delete('/api/events/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event deleted');
      expect(response.body).toHaveProperty('id', '1');
      
      // Verify the transaction was committed
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM EventDetails/),
        expect.any(Array)
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });
    
    test('should handle database errors during delete', async () => {
      mockClient.query.mockImplementation((query) => {
        if (query.includes('DELETE FROM EventDetails')) {
          return Promise.reject(new Error('Database delete error'));
        }
        if (query === 'BEGIN' || query === 'ROLLBACK') {
          return Promise.resolve();
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/events/1')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error deleting event');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
