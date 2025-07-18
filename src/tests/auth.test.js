const request = require('supertest');
const app = require('../../server');
const users = require('../api/users');

beforeEach(() => users.length = 0); 

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(201);
  });

  it('should not register duplicate user', async () => {
    await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: '123456',
    });
    const res = await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(409);
  });

  it('should login with correct credentials', async () => {
    await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: '123456',
    });
    const res = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(200);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: '123456',
    });
    const res = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
  });
});
