const request = require('supertest');
const express = require('express');
const users = require('../api/users');
const profileRoutes = require('../api/profileRoutes');
jest.mock('../models', () => ({
  UserCredentials: { findByPk: jest.fn() },
  UserProfile: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    sequelize: { transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }) }
  },
  UserSkills: { bulkCreate: jest.fn(), destroy: jest.fn() },
  UserAvailability: { bulkCreate: jest.fn(), destroy: jest.fn() },
  Skills: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  State: {}
}));
const { UserCredentials, UserProfile, UserSkills, UserAvailability, Skills } = require('../models');

const app = express();
app.use(express.json());
app.use('/api/profiles', profileRoutes);

function buildUserProfileFromUsersArray(userId) {
  const u = users.find(x => x.id === userId);
  if (!u || !u.profile) return null;
  const p = u.profile;
  return {
    user_id: userId,
    full_name: p.fullName,
    address1: p.address1,
    address2: p.address2,
    city: p.city,
    state_code: p.state,
    zip_code: p.zip,
    preferences: p.preferences,
    UserCredential: { email: u.email },
    UserSkills: (p.skills || []).map(s => ({ Skill: { skill_name: s.value } })),
    UserAvailabilities: (p.availability || []).map(d => ({ available_date: d })),
    update: jest.fn().mockResolvedValue({})
  };
}

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
      UserProfile.findAll.mockResolvedValue([
        buildUserProfileFromUsersArray(1),
        buildUserProfileFromUsersArray(2)
      ]);
      const res = await request(app).get('/api/profiles');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profiles retrieved successfully');
      expect(res.body.profiles).toHaveLength(2);
      expect(res.body.profiles[0]).toHaveProperty('userId');
      expect(res.body.profiles[0]).toHaveProperty('email');
    });

    it('should handle errors', async () => {
      UserProfile.findAll.mockRejectedValueOnce(new Error('db'));
      const res = await request(app).get('/api/profiles');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe('GET /api/profiles/:userId', () => {
    it('should get profile by user ID', async () => {
      UserProfile.findOne.mockResolvedValue(buildUserProfileFromUsersArray(1));
      const res = await request(app).get('/api/profiles/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile retrieved successfully');
      expect(res.body.profile.fullName).toBe('John Doe');
      expect(res.body.profile.city).toBe('New York');
    });

    it('should return 404 for non-existent user', async () => {
      UserProfile.findOne.mockResolvedValue(null);
      const res = await request(app).get('/api/profiles/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 404 for user without profile', async () => {
      // Add user without profile
      users.push({
        id: 3,
        email: 'noprofile@test.com',
        password: 'test123'
      });

      UserProfile.findOne.mockResolvedValue(null);
      const res = await request(app).get('/api/profiles/3');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app).get('/api/profiles/invalid');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid user ID');
    });

    it('should handle errors when fetching profile', async () => {
      UserProfile.findOne.mockRejectedValueOnce(new Error('db'));
      const res = await request(app).get('/api/profiles/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
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

      UserCredentials.findByPk.mockResolvedValue({ user_id: 3 });
      UserProfile.findOne.mockResolvedValue(null);
      UserProfile.create.mockResolvedValue({ profile_id: 10 });
      Skills.findOne.mockResolvedValue({ skill_id: 1, skill_name: 'event_setup' });
      UserSkills.bulkCreate.mockResolvedValue([]);
      UserAvailability.bulkCreate.mockResolvedValue([]);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();

      const res = await request(app)
        .post('/api/profiles/3')
        .send(validProfileData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Profile created successfully');
      // Payload shape is controlled by controller; just assert success message here
    });

    it('should return 409 if profile already exists', async () => {
      UserCredentials.findByPk.mockResolvedValue({ user_id: 1 });
      UserProfile.findOne.mockResolvedValue({ user_id: 1 });
      const res = await request(app)
        .post('/api/profiles/1')
        .send(validProfileData);

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Profile already exists. Use PUT to update.');
    });

    it('should create missing skill records during profile creation', async () => {
      users.push({ id: 4, email: 'news@test.com', password: 'pw' });
      UserCredentials.findByPk.mockResolvedValue({ user_id: 4 });
      UserProfile.findOne.mockResolvedValue(null);
      UserProfile.create.mockResolvedValue({ profile_id: 11 });
      Skills.findOne.mockResolvedValueOnce(null);
      Skills.create.mockResolvedValueOnce({ skill_id: 99, skill_name: 'new_skill' });
      UserSkills.bulkCreate.mockResolvedValue([]);
      UserAvailability.bulkCreate.mockResolvedValue([]);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();

      const res = await request(app)
        .post('/api/profiles/4')
        .send({
          fullName: 'Skill Creator',
          address1: '100 Test Ave',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
          skills: [{ value: 'new_skill', label: 'New Skill' }],
          preferences: '',
          availability: ['2024-02-15']
        });

      expect(res.statusCode).toBe(201);
      expect(Skills.create).toHaveBeenCalled();
    });

    it('should return 404 for non-existent user', async () => {
      UserCredentials.findByPk.mockResolvedValue(null);
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
        expect(res.body.error).toContain('"fullName" is required');
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
      UserProfile.findOne.mockResolvedValue(buildUserProfileFromUsersArray(1));
      UserSkills.destroy.mockResolvedValue(1);
      UserAvailability.destroy.mockResolvedValue(1);
      Skills.findOne.mockResolvedValue({ skill_id: 1, skill_name: 'event_setup' });
      UserSkills.bulkCreate.mockResolvedValue([]);
      UserAvailability.bulkCreate.mockResolvedValue([]);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();

      const res = await request(app)
        .put('/api/profiles/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
    });

    it('should return 404 for non-existent user', async () => {
      UserProfile.findOne.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/profiles/999')
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 404 for user without profile', async () => {
      UserProfile.findOne.mockResolvedValue(null);
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

    it('should update skills creating missing ones and availability list', async () => {
      UserProfile.findOne.mockResolvedValue(buildUserProfileFromUsersArray(1));
      UserSkills.destroy.mockResolvedValue(1);
      UserAvailability.destroy.mockResolvedValue(1);
      Skills.findOne.mockResolvedValue(null);
      Skills.create.mockResolvedValue({ skill_id: 55, skill_name: 'brand_new' });
      UserSkills.bulkCreate.mockResolvedValue([]);
      UserAvailability.bulkCreate.mockResolvedValue([]);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();

      const res = await request(app)
        .put('/api/profiles/1')
        .send({
          skills: [{ value: 'brand_new', label: 'Brand New' }],
          availability: ['2025-01-01']
        });

      expect(res.statusCode).toBe(200);
      expect(Skills.create).toHaveBeenCalled();
      expect(UserAvailability.bulkCreate).toHaveBeenCalled();
    });

    it('should handle skills and availability empty arrays', async () => {
      UserProfile.findOne.mockResolvedValue(buildUserProfileFromUsersArray(1));
      UserSkills.destroy.mockResolvedValue(1);
      UserAvailability.destroy.mockResolvedValue(1);
      UserSkills.bulkCreate.mockResolvedValue([]);
      UserAvailability.bulkCreate.mockResolvedValue([]);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();

      const res = await request(app)
        .put('/api/profiles/1')
        .send({ skills: [], availability: [] });

      expect([200,400]).toContain(res.statusCode);
    });
  });

  describe('DELETE /api/profiles/:userId', () => {
    it('should delete existing profile', async () => {
      UserProfile.destroy.mockResolvedValue(1);
      const trx = await UserProfile.sequelize.transaction();
      trx.commit.mockResolvedValue();
      const res = await request(app).delete('/api/profiles/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      UserProfile.destroy.mockResolvedValue(0);
      const trx = await UserProfile.sequelize.transaction();
      trx.rollback.mockResolvedValue();
      const res = await request(app).delete('/api/profiles/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should return 404 for user without profile', async () => {
      UserProfile.destroy.mockResolvedValue(0);
      const trx = await UserProfile.sequelize.transaction();
      trx.rollback.mockResolvedValue();
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

  describe('GET /api/profiles/skills', () => {
    it('should return skills list', async () => {
      Skills.findAll.mockResolvedValueOnce([
        { skill_id: 1, skill_name: 'Cooking' },
        { skill_id: 2, skill_name: 'Driving' }
      ]);
      const res = await request(app).get('/api/profiles/skills');
      expect(res.statusCode).toBe(200);
      expect(res.body.skills.length).toBe(2);
    });

    it('should handle errors', async () => {
      Skills.findAll.mockRejectedValueOnce(new Error('db'));
      const res = await request(app).get('/api/profiles/skills');
      expect(res.statusCode).toBe(500);
    });
  });
}); 