const request = require('supertest');
const express = require('express');
const reportRoutes = require('../api/reportRoutes');

jest.mock('../api/db', () => {
  const mockClient = { query: jest.fn(), release: jest.fn() };
  return {
    connect: jest.fn().mockResolvedValue(mockClient)
  };
});
const db = require('../api/db');

const app = express();
app.use('/api/reports', reportRoutes);

describe('Report Routes', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  describe('GET /api/reports/volunteers', () => {
    function mockVolunteerRows() {
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            volunteer_id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            total_events: 2,
            first_participation: '2024-06-01',
            last_participation: '2024-06-10',
            participation: [
              { event_id: 5, event_name: 'Food Drive', event_date: '2024-06-10', status: 'Confirmed', rating: 5 }
            ]
          }
        ]
      });
    }

    test('returns JSON data by default', async () => {
      mockVolunteerRows();
      const res = await request(app).get('/api/reports/volunteers');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('volunteer_id', 1);
    });

    test('returns CSV when format=csv', async () => {
      mockVolunteerRows();
      const res = await request(app).get('/api/reports/volunteers?format=csv');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('volunteer_id');
    });

    test('returns PDF when format=pdf', async () => {
      mockVolunteerRows();
      const res = await request(app).get('/api/reports/volunteers?format=pdf');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('invalid format falls back to json', async () => {
      mockVolunteerRows();
      const res = await request(app).get('/api/reports/volunteers?format=xml');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    test('supports filters: start, end, userId', async () => {
      mockVolunteerRows();
      const res = await request(app).get('/api/reports/volunteers?start=2024-01-01&end=2024-12-31&userId=1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /api/reports/events', () => {
    function mockEventRows() {
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            event_id: 7,
            event_name: 'Park Cleanup',
            event_date: '2024-07-15',
            location: 'Central Park',
            volunteer_id: 2,
            volunteer_name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'Assigned',
            performance_rating: null,
            feedback: null
          }
        ]
      });
    }

    test('returns JSON data by default', async () => {
      mockEventRows();
      const res = await request(app).get('/api/reports/events');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('event_id', 7);
    });

    test('returns CSV when format=csv', async () => {
      mockEventRows();
      const res = await request(app).get('/api/reports/events?format=csv');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('event_id,event_name');
    });

    test('returns PDF when format=pdf', async () => {
      mockEventRows();
      const res = await request(app).get('/api/reports/events?format=pdf');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('CSV with no rows returns BOM only', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/api/reports/events?format=csv');
      expect(res.statusCode).toBe(200);
      expect(res.text.startsWith('\uFEFF') || res.text.charCodeAt(0) === 0xFEFF).toBe(true);
    });

    test('filters: start, end, eventId', async () => {
      mockEventRows();
      const res = await request(app).get('/api/reports/events?start=2024-01-01&end=2024-12-31&eventId=7');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });
});


