const request = require('supertest');
const express = require('express');
const historyRoutes = require('../api/historyRoutes');

jest.mock('../api/db', () => {
  const mockClient = { query: jest.fn(), end: jest.fn() };
  return {
    connect: jest.fn().mockResolvedValue(mockClient)
  };
});
const db = require('../api/db');

const app = express();
app.use(express.json());
app.use('/api/history', historyRoutes);

describe('PUT /api/history/confirm/:historyId', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), end: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  test('confirms attendance successfully', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ history_id: 1, user_id: 10, event_id: 20, status: 'Confirmed' }]
    });
    const res = await request(app).put('/api/history/confirm/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Successfully confirmed attendance');
  });

  test('returns 404 if not found or wrong state', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put('/api/history/confirm/999');
    expect(res.statusCode).toBe(404);
  });
});


