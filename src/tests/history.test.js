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
app.use('/api/history', historyRoutes);

// Test suite for /api/history/:id

describe('GET /api/history/:id', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), end: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  it('should return history for a valid volunteer ID', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        { history_id: 1, user_id: 1, event_id: 2, status: 'Assigned', event_name: 'Food Drive', description: 'Help pack food', event_date: '2024-06-01', location: 'Center' }
      ]
    });
    const res = await request(app).get('/api/history/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('history');
    expect(Array.isArray(res.body.history)).toBe(true);
    expect(res.body.history.length).toBe(1);
  });

  it('should return 404 for a non-existent volunteer ID', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/history/999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
  });
});
