const request = require('supertest');
const express = require('express');
const historyRoutes = require('../api/historyRoutes');

const app = express();
app.use('/api/history', historyRoutes);

// Test suite for /api/history/:id

describe('GET /api/history/:id', () => {
  it('should return history for a valid volunteer ID', async () => {
    const res = await request(app).get('/api/history/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('history');
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  it('should return 404 for a non-existent volunteer ID', async () => {
    const res = await request(app).get('/api/history/999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
  });
});
