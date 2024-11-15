/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import db from '../../src/models/index.js';
import CreateExperience from '../../src/services/experience/createExperience.js';
import UpdateExperience from '../../src/services/experience/updateExperience.js';
import DeleteExperience from '../../src/services/experience/deleteExperience.js';
import Authenticate from '../../src/utils/Authenticate.js';

jest.mock('../../src/models/index.js', () => ({
  Experience: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Employment: {
    destroy: jest.fn(),
    count: jest.fn(),
  },
  Education: {
    destroy: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../../src/utils/Authenticate.js', () => ({
  __esModule: true,
  default: {
    generateToken: jest.fn(),
    verifyPassword: jest.fn(),
  },
}));

const { Experience, User } = db;

describe('ExperienceController', () => {
  let authToken;
  const userId = 1;

  const testUser = {
    id: userId,
    email: 'testuser@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  const testExperience = {
    experienceType: 'Employment',
    organizationName: 'Test Company',
    position: 'Developer',
    startDate: '2020-01-01',
    endDate: '2021-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authToken = Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);
    User.findByPk = jest.fn(() => testUser);
    jest.spyOn(CreateExperience.prototype, 'call');
    jest.spyOn(UpdateExperience.prototype, 'call');
    jest.spyOn(DeleteExperience.prototype, 'call');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/experiences', () => {
    it('should create a new experience', async () => {
      const mockCreateResponse = {
        statusCode: 201,
        success: true,
        message: 'Experience created successfully',
        experience: { id: 1, ...testExperience },
      };

      CreateExperience.prototype.call.mockResolvedValue(mockCreateResponse);

      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testExperience);

      expect(CreateExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'Experience created successfully',
        experience: { id: 1, ...testExperience },
      });
    });

    it('should return validation errors', async () => {
      mockedValidationResponse = jest.fn({
        isEmpty: () => false,
        array: () => [
          {
            param: 'experienceType',
            msg: 'experienceType is required and must be a non-empty string.',
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...testExperience, experienceType: null });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [
          {
            param: 'experienceType',
            msg: 'experienceType is required and must be a non-empty string.',
          },
        ],
      });
    });

    it('should handle service errors', async () => {
      CreateExperience.prototype.call.mockRejectedValue(new Error('Service error'));

      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testExperience);

      expect(CreateExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Failed to create experiences',
        error: 'Service error',
      });
    });
  });

  describe('GET /api/v1/experiences', () => {
    it('should get all experiences for the user', async () => {
      Experience.findAll = jest.fn(() => ([
        {
          id: 1,
          userId,
          experienceType: 'Employment',
          Employment: { position: 'Developer' },
          Education: null,
        },
      ]));

      const res = await request(app)
        .get('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        experiences: [
          {
            id: 1,
            userId,
            experienceType: 'Employment',
            Employment: { position: 'Developer' },
            Education: null,
          },
        ],
      });
    });

    it('should handle errors when retrieving experiences', async () => {
      Experience.findAll.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/experiences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Failed to retrieve experiences',
        error: 'Database error',
      });
    });
  });

  describe('PUT /api/v1/experiences/:id', () => {
    const experienceId = 1;
    const updatedData = { title: 'Updated Title' };

    it('should update an experience', async () => {
      const mockUpdateResponse = {
        success: true,
        message: 'Experience updated successfully',
        updatedExperience: { id: experienceId, ...updatedData },
      };

      UpdateExperience.prototype.call.mockResolvedValue(mockUpdateResponse);

      const res = await request(app)
        .put(`/api/v1/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(UpdateExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Experience updated successfully',
        updatedExperience: { id: experienceId, ...updatedData },
      });
    });

    it('should return 404 if experience not found', async () => {
      const mockUpdateResponse = {
        success: false,
        error: 'Experience not found',
      };

      UpdateExperience.prototype.call.mockResolvedValue(mockUpdateResponse);

      const res = await request(app)
        .put(`/api/v1/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(UpdateExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Experience not found' });
    });

    it('should handle service errors', async () => {
      UpdateExperience.prototype.call.mockRejectedValue(new Error('Service error'));

      const res = await request(app)
        .put(`/api/v1/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(UpdateExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Failed to update experience' });
    });
  });

  describe('DELETE /api/v1/experiences/:experienceId', () => {
    const experienceId = 1;
    const deleteData = { id: 2 };

    it('should delete an experience', async () => {
      const mockDeleteResponse = {
        statusCode: 200,
        success: true,
        message: 'Experience record deleted successfully',
      };

      DeleteExperience.prototype.call.mockResolvedValue(mockDeleteResponse);

      const res = await request(app)
        .delete(`/api/v1/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(DeleteExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Experience record deleted successfully',
      });
    });

    it('should handle service errors', async () => {
      DeleteExperience.prototype.call.mockRejectedValue(new Error('Service error'));

      const res = await request(app)
        .delete(`/api/v1/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(DeleteExperience.prototype.call).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Failed to delete experience',
        error: 'Service error',
      });
    });
  });
});
