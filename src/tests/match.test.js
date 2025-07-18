const request = require('supertest');
const express = require('express');
const matchRoutes = require('../api/matchingRoutes');

const app = express();
app.use(express.json());
app.use('/api/match', matchRoutes);

describe('POST /api/match', () => {
  it('should return matched events for a valid volunteer profile', async () => {
    const volunteer = {
      id: 1,
      name: 'Test User',
      city: 'Houston',
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
