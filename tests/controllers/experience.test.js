import { jest } from '@jest/globals';

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
      message: 'Experience updated successfully',
      updatedExperience: {
        id: 1,
        experienceType: 'Employment',
        organizationName: 'Updated Company', // Ensuring this matches the test expectation
        userId: 1,
        employment: {
          jobTitle: "Software Engineer",
          startDate: "2023-01-01",
        },
      },
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
jest.mock('../../src/models/index.js', () => ({
  Experience: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(), 
    update: jest.fn(), 
    destroy: jest.fn(),
    findAll: jest.fn(),
  },
  Employment: {
    findByPk: jest.fn(),
    create: jest.fn(), 
    update: jest.fn(), 
    destroy: jest.fn(),
  }
}));

jest.mock('../../src/utils/Authenticate.js');

import request from 'supertest';
import app from '../../server.js';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';
import CreateExperience from '../../src/services/experience/createExperience.js';

const { Experience, User, Employment } = db;

// Declare the mocks at the top level
let mockCreateExperienceServiceInstance;
let mockUpdateExperienceServiceInstance;
let mockDeleteExperienceServiceInstance;
let testUser;
let testExperience;
let authToken;


describe('ExperienceController', () => {

  beforeAll(async () => {
    // Static test data
    testUser = {
      id: 1,
      email: 'testuser@example.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    // Generate auth token once to reuse across tests
    authToken = await Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);

    // Static mocks for models that don’t change across tests
    User.findByPk = jest.fn().mockResolvedValue(testUser);
  });



  beforeEach(() => {
    testExperience = {
      id: 1,
      experienceType: 'Employment',
      organizationName: 'Test Company',
      userId: 1,
      employment: {
        jobTitle: "Software Engineer",
        startDate: "2023-01-1",
      },
    };
      // Reset all mocks before each test
      jest.clearAllMocks(); 

      Experience.findAll = jest.fn();
      Experience.findOne = jest.fn();
      Experience.findByPk = jest.fn()
      Experience.create = jest.fn()
      Experience.update = jest.fn()
      Experience.destroy = jest.fn()
      Employment.create = jest.fn()
      Employment.findByPk = jest.fn()
      Employment.update = jest.fn()
      Employment.destroy = jest.fn()
    // Set up dynamic mocks for services to ensure clean behavior each test
    mockCreateExperienceServiceInstance = {
      call: jest.fn().mockResolvedValue({
        id: 1,
        experienceType: 'Employment',
        organizationName: 'Test Company',
        userId: 1,
        employment: {
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
    jest.clearAllMocks(); // Reset all mocks after each test
  });

  describe('POST /api/v1/experiences', () => {
    it('should create a new experience', async () => {

      Experience.create.mockResolvedValueOnce(testExperience);
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
          experienceType: '',
          organizationName: '',
        }); // Trigger validation error 
        // Check for the correct status code
      expect(res.statusCode).toBe(400);
      // Check that the response body indicates a failure
      expect(res.body).toHaveProperty('success', false);
      // Ensure 'errors' field is present in the response
      expect(res.body).toHaveProperty('errors');
      // Check that the 'errors' field is an array, which would be typical for validation errors
      expect(Array.isArray(res.body.errors)).toBe(true);

    });

    it('should handle server errors gracefully when service fails', async () => {
        // Use jest.spyOn to override `call` method for this test only
      const mockCall = jest.spyOn(CreateExperience.prototype, 'call');
      mockCall.mockRejectedValueOnce(new Error('Database error')); // Simulate a database error

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
      Experience.findAll.mockResolvedValueOnce([testExperience]);

      const res = await request(app)
        .get('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.experiences).toHaveLength(1);
      expect(res.body.experiences[0]).toHaveProperty('organizationName', testExperience.organizationName);
    });

    it('should handle server errors gracefully', async () => {
      Experience.findAll.mockRejectedValueOnce(new Error('Something went wrong'));

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
    
      Experience.findByPk.mockResolvedValue(testExperience) // First call mock (original experience)
      Experience.update.mockResolvedValueOnce([1]);
        // Mock the second fetch (after the update) to return the updated experience
      const updatedExperienceData = {
        ...testExperience,
        organizationName: 'Updated Company', // Updated company name
      };
      Experience.findByPk.mockResolvedValueOnce(updatedExperienceData); // Second call mock (updated experience)
      // Perform the request
      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Experience updated successfully');
      expect(res.body.updatedExperience).toHaveProperty('organizationName', 'Updated Company');
    });

    it('should return 404 if experience not found', async () => {
    
      Experience.update.mockResolvedValueOnce([0]);
      Experience.findByPk.mockResolvedValueOnce(null);
      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Experience not found');
    });


    it('should handle server errors gracefully during update', async () => { 
      const error = new Error('Failed to update experience');
      error.statusCode = 500;
      Experience.findByPk.mockResolvedValue(testExperience);
      Experience.update.mockRejectedValue(error);

      const res = await request(app)
        .put(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationName: 'Updated Company' });
        
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to update experience');
    });
  });

  describe('DELETE /api/v1/experiences/:experienceId', () => {
    it('should delete an experience', async () => {
      Experience.findOne.mockResolvedValueOnce(testExperience); 
      Experience.destroy.mockResolvedValueOnce(1);
      Employment.destroy.mockResolvedValueOnce(1);
    
      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(204);
    })
    

    it('should handle experience not found error', async () => {
      Experience.findByPk.mockResolvedValueOnce(null);
      Experience.destroy.mockResolvedValueOnce(0);

      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Experience not found');
    });


     it('should handle server errors gracefully during deletion', async () => {
        // Mock `findByPk` to return a valid experience
      Experience.findOne.mockResolvedValueOnce(testExperience); 
      const error = new Error('Failed to delete experience');
      error.statusCode = 500;
      // Simulate a failure in `destroy` method by rejecting the promise
      Experience.destroy.mockRejectedValueOnce(error);
      
      const res = await request(app)
        .delete(`/api/v1/experiences/${testExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete experience');
    });
  });
});
