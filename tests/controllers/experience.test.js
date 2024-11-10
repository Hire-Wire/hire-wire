import { jest } from '@jest/globals'; // Ensure jest is imported if using ES6 modules
import request from 'supertest';
import app from '../../server.js';
import db from '../../src/models/index.js';

// Mock the service classes
import CreateExperience from '../../src/services/experience/createExperience.js';
import UpdateExperience from '../../src/services/experience/updateExperience.js';
import DeleteExperience from '../../src/services/experience/deleteExperience.js';

// Mock the service class modules properly
jest.mock('../../src/services/experience/createExperience.js');
jest.mock('../../src/services/experience/updateExperience.js');
jest.mock('../../src/services/experience/deleteExperience.js');

const { Experience, User } = db;

describe('ExperienceController', () => {
  let authToken;
  let userId;
  let mockCreateExperienceServiceInstance;
  let mockUpdateExperienceServiceInstance;
  let mockDeleteExperienceServiceInstance;

  const testUser = {
    id: 1,
    email: 'testuser@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  const testExperience = {
    id: 1,
    experienceType: 'Employment',
    organizationName: 'Test Company',
    userId: 1,
  };

  beforeEach(() => {
    authToken = 'dummy_token'; // Normally you'd generate a token like you did for the UserController test
    userId = testUser.id;

    // Create mock service instances manually
    mockCreateExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue(testExperience),
    };

    mockUpdateExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue(testExperience),
    };

    mockDeleteExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue({ success: true }),
    };

    // Mock the module and return the mock instance for the service constructor
    CreateExperience.mockImplementation(() => mockCreateExperienceServiceInstance);
    UpdateExperience.mockImplementation(() => mockUpdateExperienceServiceInstance);
    DeleteExperience.mockImplementation(() => mockDeleteExperienceServiceInstance);

    // Mocking the models
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    Experience.findAll = jest.fn();
    Experience.findByPk = jest.fn();
    Experience.create = jest.fn();
    Experience.update = jest.fn();
    Experience.destroy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/experiences', () => {
    it('should create a new experience', async () => {
      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testExperience);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Experience created successfully');
      expect(res.body).toHaveProperty('experience', expect.objectContaining({
        organizationName: testExperience.organizationName,
      }));
    });

    it('should return validation errors if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});  // Invalid data

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.errors).toHaveLength(1);  // Assuming we have a validation error for missing fields
    });

    it('should handle server errors gracefully', async () => {
      // Mock server errors for CreateExperience
      mockCreateExperienceServiceInstance.call.mockRejectedValue(new Error('Something went wrong'));

      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testExperience);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Failed to create experience');
    });
  });

  describe('GET /api/v1/experiences', () => {
    it('should retrieve all experiences for a user', async () => {
      Experience.findAll.mockResolvedValue([testExperience]);

      const res = await request(app)
        .get('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.experiences).toHaveLength(1);
      expect(res.body.experiences[0]).toHaveProperty('organizationName', testExperience.organizationName);
    });

    it('should handle server errors gracefully', async () => {
      Experience.findAll.mockRejectedValue(new Error('Something went wrong'));

      const res = await request(app)
        .get('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Failed to retrieve experiences');
    });
  });

  describe('PUT /api/v1/experiences/:id', () => {
    it('should update an existing experience', async () => {
      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Experience updated successfully');
      expect(res.body.updatedExperience).toHaveProperty('organizationName', 'Updated Company');
    });

    it('should return an error if experience not found', async () => {
      mockUpdateExperienceServiceInstance.call.mockResolvedValue({ success: false, error: 'Experience not found' });

      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Experience not found');
    });
  });

  describe('DELETE /api/v1/experiences/:experienceId', () => {
    it('should delete an experience', async () => {
      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(204); // No content for successful deletion
    });

    it('should handle experience not found error', async () => {
      mockDeleteExperienceServiceInstance.call.mockResolvedValue({ success: false, error: 'Experience not found' });

      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Experience not found');
    });

    it('should handle server errors gracefully', async () => {
      mockDeleteExperienceServiceInstance.call.mockRejectedValue(new Error('Something went wrong'));

      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete experience');
    });
  });
});
