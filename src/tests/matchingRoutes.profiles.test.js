const request = require('supertest');
const express = require('express');
const matchRoutes = require('../api/matchingRoutes');

jest.mock('../api/db', () => {
  const mockClient = { query: jest.fn(), release: jest.fn() };
  return { connect: jest.fn().mockResolvedValue(mockClient) };
});
const db = require('../api/db');

const app = express();
app.use(express.json());
app.use('/api/match', matchRoutes);

describe('Matching profiles endpoints', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  test('GET /api/match/profiles returns list', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        { user_id: 1, full_name: 'A', city: 'Houston', state_code: 'TX', preferences: null, skills: ['Cooking'], availability: ['2025-07-05'] },
      ]
    });
    const res = await request(app).get('/api/match/profiles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('userId', 1);
  });

  test('GET /api/match/profiles handles db error', async () => {
    mockClient.query.mockRejectedValueOnce(new Error('db'));
    const res = await request(app).get('/api/match/profiles');
    expect(res.statusCode).toBe(500);
  });

  test('GET /api/match/profiles/:id returns profile', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [
        { user_id: 2, full_name: 'B', city: 'Austin', state_code: 'TX', preferences: null, skills: ['Cooking'], availability: ['2025-07-05'] }
      ]
    });
    const res = await request(app).get('/api/match/profiles/2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('userId', 2);
  });

  test('GET /api/match/profiles/:id returns 404 when not found', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/match/profiles/999');
    expect(res.statusCode).toBe(404);
  });

  test('GET /api/match/profiles/:id handles db error', async () => {
    mockClient.query.mockRejectedValueOnce(new Error('db'));
    const res = await request(app).get('/api/match/profiles/1');
    expect(res.statusCode).toBe(500);
  });
});


