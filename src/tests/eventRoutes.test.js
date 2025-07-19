const request = require('supertest');
const express = require('express');
const eventRoutes = require('../api/eventRoutes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);

describe('Event Routes', () => {
  describe('GET /api/events', () => {
    test('should return all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBeGreaterThan(0);
      expect(response.body.events[0]).toHaveProperty('id');
      expect(response.body.events[0]).toHaveProperty('name');
      expect(response.body.events[0]).toHaveProperty('description');
    });
  });

  describe('GET /api/events/:id', () => {
    test('should return a specific event', async () => {
      const response = await request(app)
        .get('/api/events/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });
  });

  describe('POST /api/events', () => {
    test('should create a new event with valid data', async () => {
      const newEvent = {
        name: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['Skill1'],
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
        requiredSkills: ['Skill1'],
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
        requiredSkills: ['Skill1'],
        urgency: 'Low',
        eventDate: '2025-07-21'
      };

      const response = await request(app)
        .put('/api/events/1')
        .send(updatedEvent)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe('1');
      expect(response.body.name).toBe(updatedEvent.name);
      expect(response.body.description).toBe(updatedEvent.description);
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
    });
  });
});
