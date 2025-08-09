const request = require('supertest');
const express = require('express');

jest.mock('../api/authController', () => ({
  register: (req, res) => res.status(201).json({ ok: 'register' }),
  login: (req, res) => res.status(200).json({ ok: 'login' }),
  verifyEmail: (req, res) => res.status(200).json({ ok: 'verify' })
}));

const authRoutes = require('../api/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes wiring', () => {
  test('POST /api/auth/register routes to controller', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: 'register' });
  });

  test('POST /api/auth/login routes to controller', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: 'login' });
  });

  test('GET /api/auth/verify-email routes to controller', async () => {
    const res = await request(app).get('/api/auth/verify-email?verification_token=abc');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: 'verify' });
  });
});


