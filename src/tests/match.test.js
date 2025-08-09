const request = require('supertest');
const express = require('express');
const matchRoutes = require('../api/matchingRoutes');
jest.mock('../api/db', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn()
  };
  return {
    connect: jest.fn().mockResolvedValue(mockClient)
  };
});
const db = require('../api/db');

const app = express();
app.use(express.json());
app.use('/api/match', matchRoutes);

describe('POST /api/match', () => {
  let mockClient;
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn(), release: jest.fn() };
    db.connect.mockResolvedValue(mockClient);

    // Default event list
    mockClient.query.mockImplementation((query) => {
      if (query.includes('SELECT') && query.includes('FROM EventDetails e')) {
        return Promise.resolve({
          rows: [
            {
              event_id: 1,
              event_name: 'Soup Kitchen',
              description: 'Cook meals',
              location: 'Center',
              address1: '1 Main',
              address2: null,
              city: 'Houston',
              state_code: 'TX',
              zip_code: '77001',
              urgency: 'High',
              event_date: '2025-07-05',
              formatted_date: '2025-07-05',
              required_skills: ['Cooking']
            }
          ]
        });
      }
      return Promise.resolve({ rows: [] });
    });
  });
  it('should return matched events for a valid volunteer profile', async () => {
    const volunteer = {
      id: 1,
      name: 'Test User',
      city: 'Houston',
      stateCode: 'TX',
      skills: ['Cooking'],
      availability: ['2025-07-05']
    };

    const res = await request(app).post('/api/match').send(volunteer);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('matches');
    expect(Array.isArray(res.body.matches)).toBe(true);
    expect(res.body.matches.length).toBeGreaterThan(0);
  });

  it('should return 400 for incomplete volunteer data', async () => {
    const incompleteVolunteer = {
      name: 'No Skills or Availability'
    };

    const res = await request(app).post('/api/match').send(incompleteVolunteer);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
