const request = require('supertest');
const app = require('../../server');
const users = require('../api/users');

// Reset users data before each test
beforeEach(() => {
  // Reset to original test data
  users.length = 0;
  users.push(
    {
      id: 1,
      email: "test@test.com",
      password: "abc123",
      profile: {
        fullName: "John Doe",
        address1: "123 Main St",
        address2: "Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
        skills: [
          { value: 'event_setup', label: 'Setup Crew' },
          { value: 'cooking', label: 'Cooking' }
        ],
        preferences: "I prefer outdoor events and working with children",
        availability: ["2024-01-15", "2024-01-20", "2024-01-25"],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    },
    {
      id: 2,
      email: 'hello@gmail.com',
      password: 'hello',
      profile: {
        fullName: "Jane Smith",
        address1: "456 Oak Ave",
        address2: "",
        city: "Los Angeles",
        state: "CA",
        zip: "90210",
        skills: [
          { value: 'landscaping', label: 'Land Scaping' },
          { value: 'childcare', label: 'Childcare' }
        ],
        preferences: "I enjoy gardening and working with seniors",
        availability: ["2024-01-10", "2024-01-18", "2024-01-30"],
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z"
      }
    }
  );
});

describe('Profile Routes', () => {
  describe('GET /api/profiles', () => {
    it('should get all profiles', async () => {
      const res = await request(app).get('/api/profiles');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profiles retrieved successfully');
      expect(res.body.profiles).toHaveLength(2);
      expect(res.body.profiles[0]).toHaveProperty('userId');
      expect(res.body.profiles[0]).toHaveProperty('email');
      expect(res.body.profiles[0]).toHaveProperty('profile');
    });
  });

  describe('GET /api/profiles/:userId', () => {
    it('should get profile by user ID', async () => {
      const res = await request(app).get('/api/profiles/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile retrieved successfully');
      expect(res.body.profile.fullName).toBe('John Doe');
      expect(res.body.profile.city).toBe('New York');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/profiles/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 404 for user without profile', async () => {
      // Add user without profile
      users.push({
        id: 3,
        email: 'noprofile@test.com',
        password: 'test123'
      });

      const res = await request(app).get('/api/profiles/3');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app).get('/api/profiles/invalid');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid user ID');
    });
  });

  describe('POST /api/profiles/:userId', () => {
    const validProfileData = {
      fullName: 'Test User',
      address1: '789 Test St',
      address2: 'Suite 100',
      city: 'Test City',
      state: 'TX',
      zip: '12345',
      skills: [{ value: 'event_setup', label: 'Setup Crew' }],
      preferences: 'Test preferences',
      availability: ['2024-02-01', '2024-02-15']
    };

    it('should create a new profile', async () => {
      // Add user without profile
      users.push({
        id: 3,
        email: 'newuser@test.com',
        password: 'test123'
      });

      const res = await request(app)
        .post('/api/profiles/3')
        .send(validProfileData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Profile created successfully');
      expect(res.body.profile.fullName).toBe('Test User');
      expect(res.body.profile.city).toBe('Test City');
    });

    it('should return 409 if profile already exists', async () => {
      const res = await request(app)
        .post('/api/profiles/1')
        .send(validProfileData);

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Profile already exists for this user');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/profiles/999')
        .send(validProfileData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .post('/api/profiles/invalid')
        .send(validProfileData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid user ID');
    });

    describe('Validation Tests', () => {
      it('should validate required fields', async () => {
        const res = await request(app)
          .post('/api/profiles/3')
          .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Full name is required');
      });

      it('should validate fullName length', async () => {
        const invalidData = { ...validProfileData, fullName: 'A' };
        const res = await request(app)
          .post('/api/profiles/3')
          .send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Full name must be at least 2 characters long');
      });

      it('should validate address1 length', async () => {
        const invalidData = { ...validProfileData, address1: '123' };
        const res = await request(app)
          .post('/api/profiles/3')
          .send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Address must be at least 5 characters long');
      });

      it('should validate zip code format', async () => {
        const invalidData = { ...validProfileData, zip: 'invalid' };
        const res = await request(app)
          .post('/api/profiles/3')
          .send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Zip code must be in format 12345 or 12345-6789');
      });

      it('should validate skills array', async () => {
        const invalidData = { ...validProfileData, skills: [] };
        const res = await request(app)
          .post('/api/profiles/3')
          .send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('At least one skill must be selected');
      });

      it('should validate availability array', async () => {
        const invalidData = { ...validProfileData, availability: [] };
        const res = await request(app)
          .post('/api/profiles/3')
          .send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('At least one available date must be selected');
      });
    });
  });

  describe('PUT /api/profiles/:userId', () => {
    const updateData = {
      fullName: 'Updated Name',
      city: 'Updated City',
      preferences: 'Updated preferences'
    };

    it('should update existing profile', async () => {
      const res = await request(app)
        .put('/api/profiles/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.profile.fullName).toBe('Updated Name');
      expect(res.body.profile.city).toBe('Updated City');
      expect(res.body.profile.preferences).toBe('Updated preferences');
      // Should preserve existing fields
      expect(res.body.profile.address1).toBe('123 Main St');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/api/profiles/999')
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 404 for user without profile', async () => {
      // Add user without profile
      users.push({
        id: 3,
        email: 'noprofile@test.com',
        password: 'test123'
      });

      const res = await request(app)
        .put('/api/profiles/3')
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .put('/api/profiles/invalid')
        .send(updateData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid user ID');
    });

    it('should validate update data', async () => {
      const invalidData = { fullName: 'A' }; // Too short
      const res = await request(app)
        .put('/api/profiles/1')
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Full name must be at least 2 characters long');
    });
  });

  describe('DELETE /api/profiles/:userId', () => {
    it('should delete existing profile', async () => {
      const res = await request(app).delete('/api/profiles/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile deleted successfully');

      // Verify profile is actually deleted
      const getRes = await request(app).get('/api/profiles/1');
      expect(getRes.statusCode).toBe(404);
      expect(getRes.body.error).toBe('Profile not found');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).delete('/api/profiles/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 404 for user without profile', async () => {
      // Add user without profile
      users.push({
        id: 3,
        email: 'noprofile@test.com',
        password: 'test123'
      });

      const res = await request(app).delete('/api/profiles/3');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app).delete('/api/profiles/invalid');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid user ID');
    });
  });
}); 