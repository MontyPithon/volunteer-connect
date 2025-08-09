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

describe('Report Routes additional branches', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  test('events CSV escapes commas, quotes, and newlines', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          event_id: 1,
          event_name: 'Park, "Cleanup"',
          event_date: '2024-07-15',
          location: 'Somewhere\nOver',
          volunteer_id: 2,
          volunteer_name: 'Jane',
          email: 'jane@example.com',
          status: 'Assigned',
          performance_rating: 5,
          feedback: 'Great, job\n"Well done"'
        }
      ]
    });
    const res = await request(app).get('/api/reports/events?format=csv');
    expect(res.statusCode).toBe(200);
    // Ensure quotes inserted around fields with commas/newlines/quotes
    expect(res.text).toMatch(/"Park, ""Cleanup"""/);
    expect(res.text).toMatch(/"Somewhere\nOver"/);
    expect(res.text).toMatch(/"Great, job\n""Well done"""/);
  });

  test('volunteers endpoint handles db error', async () => {
    mockClient.query.mockRejectedValueOnce(new Error('db'));
    const res = await request(app).get('/api/reports/volunteers');
    expect(res.statusCode).toBe(500);
  });

  test('events endpoint handles db error', async () => {
    mockClient.query.mockRejectedValueOnce(new Error('db'));
    const res = await request(app).get('/api/reports/events');
    expect(res.statusCode).toBe(500);
  });

  test('volunteers JSON with invalid dates ignores filters', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          volunteer_id: 1,
          name: 'Doe, John',
          email: 'john@example.com',
          total_events: 0,
          first_participation: null,
          last_participation: null,
          participation: []
        }
      ]
    });
    const res = await request(app).get('/api/reports/volunteers?start=bad&end=also-bad');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('volunteers PDF with no rows', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/reports/volunteers?format=pdf');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  test('volunteers PDF with start/end/userId meta header parts', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          volunteer_id: 1,
          name: 'John',
          email: 'john@example.com',
          total_events: 1,
          first_participation: '2024-06-01',
          last_participation: '2024-06-01',
          participation: []
        }
      ]
    });
    const res = await request(app).get('/api/reports/volunteers?format=pdf&start=2024-01-01&end=2024-12-31&userId=1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  test('events PDF with start/end/eventId meta header parts', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          event_id: 1,
          event_name: 'Park Cleanup',
          event_date: '2024-07-15',
          location: 'Central',
          volunteer_id: 2,
          volunteer_name: 'Jane',
          email: 'jane@example.com',
          status: 'Assigned',
          performance_rating: null,
          feedback: null
        }
      ]
    });
    const res = await request(app).get('/api/reports/events?format=pdf&start=2024-01-01&end=2024-12-31&eventId=1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  test('volunteers CSV date formatting for date keys', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          volunteer_id: 1,
          name: 'John',
          email: 'john@example.com',
          total_events: 1,
          first_participation: '2024-06-01T12:00:00.000Z',
          last_participation: '2024-06-02T00:00:00.000Z',
          participation: []
        }
      ]
    });
    const res = await request(app).get('/api/reports/volunteers?format=csv');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('first_participation');
    expect(res.text).toContain('2024-06-01');
    expect(res.text).toContain('2024-06-02');
  });
});


