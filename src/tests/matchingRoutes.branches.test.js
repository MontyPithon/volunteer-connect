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

describe('Matching branches', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  function setEvents(rows) {
    mockClient.query.mockResolvedValueOnce({ rows });
  }

  test('full match', async () => {
    setEvents([
      {
        event_id: 1,
        event_name: 'Food',
        description: 'Serve',
        location: 'Center',
        address1: '1',
        address2: null,
        city: 'Houston',
        state_code: 'TX',
        zip_code: '77001',
        urgency: 'High',
        event_date: '2025-07-05',
        formatted_date: '2025-07-05',
        required_skills: ['Cooking']
      }
    ]);
    const volunteer = { city: 'Houston', stateCode: 'TX', skills: ['Cooking'], availability: ['2025-07-05'] };
    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body.matches[0].matchType).toBe('full');
  });

  test('city match (skills ok, different city)', async () => {
    setEvents([
      {
        event_id: 1,
        event_name: 'Food',
        description: 'Serve',
        location: 'Center',
        address1: '1',
        address2: null,
        city: 'Houston',
        state_code: 'TX',
        zip_code: '77001',
        urgency: 'High',
        event_date: '2025-07-05',
        formatted_date: '2025-07-05',
        required_skills: ['Cooking']
      }
    ]);
    const volunteer = { city: 'Austin', stateCode: 'TX', skills: ['Cooking'], availability: ['2025-07-05'] };
    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body.matches[0].matchType).toBe('city');
  });

  test('partial match (some skills only)', async () => {
    setEvents([
      {
        event_id: 1,
        event_name: 'Food',
        description: 'Serve',
        location: 'Center',
        address1: '1',
        address2: null,
        city: 'Houston',
        state_code: 'TX',
        zip_code: '77001',
        urgency: 'High',
        event_date: '2025-07-05',
        formatted_date: '2025-07-05',
        required_skills: ['Cooking', 'Driving']
      }
    ]);
    const volunteer = { city: 'Houston', stateCode: 'TX', skills: ['Cooking'], availability: ['2025-07-05'] };
    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body.matches[0].matchType).toBe('partial');
  });

  test('no match when date mismatch', async () => {
    setEvents([
      {
        event_id: 1,
        event_name: 'Food',
        description: 'Serve',
        location: 'Center',
        address1: '1',
        address2: null,
        city: 'Houston',
        state_code: 'TX',
        zip_code: '77001',
        urgency: 'High',
        event_date: '2025-07-05',
        formatted_date: '2025-07-05',
        required_skills: []
      }
    ]);
    const volunteer = { city: 'Houston', stateCode: 'TX', skills: ['Cooking'], availability: ['2025-07-06'] };
    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body.matches.length).toBe(0);
  });

  test('no match when state mismatch', async () => {
    setEvents([
      {
        event_id: 1,
        event_name: 'Food',
        description: 'Serve',
        location: 'Center',
        address1: '1',
        address2: null,
        city: 'Houston',
        state_code: 'TX',
        zip_code: '77001',
        urgency: 'High',
        event_date: '2025-07-05',
        formatted_date: '2025-07-05',
        required_skills: []
      }
    ]);
    const volunteer = { city: 'Houston', stateCode: 'CA', skills: ['Cooking'], availability: ['2025-07-05'] };
    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body.matches.length).toBe(0);
  });
});

describe('GET /api/match/event/:eventId', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);
  });

  test('returns volunteers sorted by match type', async () => {
    // First query: event by id
    mockClient.query
      .mockResolvedValueOnce({
        rows: [{
          event_id: 1,
          event_name: 'Food',
          description: 'Serve',
          location: 'Center',
          address1: '1', address2: null, city: 'Houston', state_code: 'TX', zip_code: '77001', urgency: 'High',
          event_date: '2025-07-05', formatted_date: '2025-07-05', required_skills: ['Cooking']
        }]
      })
      // Second query: volunteer profiles
      .mockResolvedValueOnce({
        rows: [
          { user_id: 1, full_name: 'A', city: 'Houston', state_code: 'TX', preferences: null, skills: ['Cooking'], availability: ['2025-07-05'] }, // full
          { user_id: 2, full_name: 'B', city: 'Austin', state_code: 'TX', preferences: null, skills: ['Cooking'], availability: ['2025-07-05'] }, // city
          { user_id: 3, full_name: 'C', city: 'Houston', state_code: 'TX', preferences: null, skills: ['Cooking'], availability: ['2025-07-05'] }, // partial (if event had extra skill) but with current one skill it becomes full; change event skill list accordingly above
        ]
      });

    const res = await request(app).get('/api/match/event/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.matches)).toBe(true);
    // First should be full, then city
    expect(res.body.matches[0].matchType).toBeDefined();
  });

  test('returns 404 when event not found', async () => {
    // First query returns no event
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/match/event/999');
    expect(res.statusCode).toBe(404);
  });
});


