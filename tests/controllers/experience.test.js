import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import bcrypt from 'bcrypt';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';

jest.mock('../../src/services/experience/createExperience.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({
      id: 1,
      experienceType: 'Employment',
      organizationName: 'Test Company',
      userId: 1,
      employment: {
        jobTitle: "Software Engineer", 
        startDate: "2023-01-01",
      }
    }),
  })),
}));

jest.mock('../../src/services/experience/updateExperience.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({
      success: true,
      updatedExperience: { organizationName: 'Updated Company' },
    }),
  })),
}));

jest.mock('../../src/services/experience/deleteExperience.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({
      success: true,
      message: 'Experience deleted successfully',
    }),
  })),
}));

// Mock models
jest.mock('../../src/models/index.js');
jest.mock('../../src/utils/Authenticate.js');

const { Experience, User, Employment } = db;

describe('ExperienceController', () => {
  let authToken;
  let userId;

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
    employment:{
      jobTitle: "Software Engineer",
      startDate: "2023-01-1",
    },
  };


  // Mock service instances
  let mockCreateExperienceServiceInstance;
  let mockUpdateExperienceServiceInstance;
  let mockDeleteExperienceServiceInstance;

  beforeEach(() => {
    authToken = Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);
    userId = testUser.id;

    // Mock the models
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    Experience.findAll = jest.fn();
    Experience.findByPk = jest.fn().mockResolvedValue(testExperience);
    Experience.create = jest.fn().mockResolvedValue(testExperience);
    Experience.update = jest.fn().mockResolvedValue(testExperience);
    Experience.destroy = jest.fn();
    Employment.findByPk = jest.fn().mockResolvedValue(testExperience);
    Employment.create = jest.fn().mockResolvedValue(testExperience);
    Employment.destroy = jest.fn();

    // Define the service mocks here
    mockCreateExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue({
        id: 1,
        experienceType: 'Employment',
        organizationName: 'Test Company',
        userId: 1,
        employment:{
          jobTitle: "Software Engineer",
          startDate: "2023-01-1",
        },
      }),
    };

    mockUpdateExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue({
        success: true,
        updatedExperience: { organizationName: 'Updated Company' },
      }),
    };

    mockDeleteExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue({
        success: true,
        message: 'Experience deleted successfully',
      }),
    };
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
      expect(db.Experience.create).toHaveBeenCalledTimes(1);
      expect(db.Employment.create).toHaveBeenCalledTimes(1);
    });

    it('should return validation errors if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          organizationName: "Company ababab", 
        });  // Invalid data, missing required fields

      console.log(res.body); //remove after   

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
     
    });

    it('should handle server errors gracefully when service fails', async () => {
      // Simulating failure in CreateExperience service (e.g., database error)
      const mockError = new Error('Database error');
      mockCreateExperienceServiceInstance.call.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testExperience);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Failed to create experiences');
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

      console.log(res.body); //remove after   

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Experience updated successfully');
      expect(res.body.updatedExperience).toHaveProperty('organizationName', 'Updated Company');
    });

    it('should return an error if experience not found', async () => {
      const result = { success: false, error: 'Experience not found' };
      mockUpdateExperienceServiceInstance.call.mockResolvedValue(result);

      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      console.log(res.body); //remove after     

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Experience not found');
    });

    it('should handle server errors gracefully during update', async () => {
      mockUpdateExperienceServiceInstance.call.mockRejectedValue(new Error('Something went wrong'));

      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      console.log(res.body); //remove after  

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to update experience');
    });
  });

  describe('DELETE /api/v1/experiences/:experienceId', () => {
    it('should delete an experience', async () => {
      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log(res.body); //remove after   

      expect(res.statusCode).toBe(204); // No content for successful deletion
    });

    it('should handle experience not found error', async () => {
      const result = { success: false, error: 'Experience not found' };
      mockDeleteExperienceServiceInstance.call.mockResolvedValue(result);

      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Experience not found');
    });

    it('should handle server errors gracefully during deletion', async () => {
      mockDeleteExperienceServiceInstance.call.mockRejectedValue(new Error('Something went wrong'));

      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log(res.body); //remove after    

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete experience');
    });
  });
});
