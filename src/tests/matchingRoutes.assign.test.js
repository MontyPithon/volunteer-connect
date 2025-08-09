const request = require('supertest');
const express = require('express');
const matchRoutes = require('../api/matchingRoutes');

jest.mock('../api/db', () => {
  const mockClient = { query: jest.fn(), release: jest.fn() };
  return {
    connect: jest.fn().mockResolvedValue(mockClient)
  };
});
const db = require('../api/db');

const app = express();
app.use(express.json());
app.use('/api/match', matchRoutes);

describe('POST /api/match/assign', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  test('creates assignment successfully', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [{ user_id: 10 }] });
    mockClient.query.mockResolvedValueOnce({ rows: [{ event_id: 20 }] });
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    mockClient.query.mockResolvedValueOnce({ rows: [{ history_id: 123 }] });
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/match/assign')
      .send({ volunteerId: 10, eventId: 20 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('assignmentId', 123);
  });

  test('validates required fields', async () => {
    const res = await request(app)
      .post('/api/match/assign')
      .send({ volunteerId: 10 });
    expect(res.statusCode).toBe(400);
  });

  test('handles already assigned', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [{ user_id: 10 }] });
    mockClient.query.mockResolvedValueOnce({ rows: [{ event_id: 20 }] });
    mockClient.query.mockResolvedValueOnce({ rows: [{}] });
    const res = await request(app)
      .post('/api/match/assign')
      .send({ volunteerId: 10, eventId: 20 });
    expect(res.statusCode).toBe(409);
  });
});


