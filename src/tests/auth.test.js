const { register, verifyEmail, login } = require('../api/authController');
const db = require('../api/db');
const bcrypt = require('bcrypt');

jest.mock('../api/db');

describe('Auth Controller', () => {
  describe('register', () => {
    it('should register a user and send a verification email', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });

      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO usercredentials (email, password_hash, verification_token) VALUES ($1, $2, $3) RETURNING user_id',
        expect.any(Array)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered. Please check your email to verify your account.',
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = { body: { email: '', password: '' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 500 if database query fails', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected error during registration' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const req = { query: { verification_token: 'valid_token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await verifyEmail(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE usercredentials SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING user_id',
        ['valid_token']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email verified successfully' });
    });

    it('should return 400 if token is missing', async () => {
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
    });

    it('should return 400 if token is invalid', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      const req = { query: { verification_token: 'invalid_token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });

    it('should return 500 if database query fails', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const req = { query: { verification_token: 'valid_token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('login', () => {
    it('should log in successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.query.mockResolvedValueOnce({
        rows: [{ email: 'test@example.com', password_hash: hashedPassword, is_verified: true }],
      });

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        userId: expect.any(Number),
      });
    });

    it('should return 403 if email is not verified', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ email: 'test@example.com', password_hash: 'hashedPassword', is_verified: false }],
      });

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please verify your email before logging in.' });
    });

    it('should return 500 if database query fails', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});