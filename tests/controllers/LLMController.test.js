import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import LLMGenerationService from '../../src/services/llm/LLMGenerationService.js';
import Authenticate from '../../src/utils/Authenticate.js';
import LLMResponseProcessingService from '../../src/services/llm/LLMResponseProcessingService.js';
import db from '../../src/models/index.js';

jest.mock('../../src/services/llm/LLMGenerationService.js', () => ({
  callChatGPT: jest.fn(),
}));

let testUser;
let authToken;

describe('LLMController', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Create a new user before each test
    const email = `testuser_${Date.now()}@example.com`;
    testUser = await db.User.create({
      email,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    const userId = testUser.id;

    // Mock the authentication token generation
    authToken = await Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);

    // Mock the successful response from LLM generation service
    LLMGenerationService.prototype.callChatGPT = jest.fn().mockResolvedValue(
      '# Resume\n- Skills\n# Cover Letter\nDear Hiring Manager,' // The expected response as a string
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/job-application/generate-content', () => {
    it('should generate content and save documents successfully', async () => {
      const reqBody = {
        jobTitle: 'Software Engineer',
        jobCompany: 'Test Corp',
        jobDescriptionBody: 'Develop and maintain software solutions.',
        customPrompt: 'Focus on Python and team collaboration skills.',
      };

      const res = await request(app)
        .post('/api/v1/job-application/generate-content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reqBody)
        .set('user', testUser); // Ensuring req.user is available

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('resume');
      expect(res.body.data).toHaveProperty('coverLetter');
    });

    it('should return 400 for missing required fields', async () => {
      const reqBody = {
        jobTitle: 'Software Engineer',
      };

      const res = await request(app)
        .post('/api/v1/job-application/generate-content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reqBody) // Missing company and description
        .set('user', testUser); // Ensuring req.user is available

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Job title, company, and description are required fields.');
    });

    it('should handle LLM service errors gracefully', async () => {
      const reqBody = {
        jobTitle: 'Software Engineer',
        jobCompany: 'Test Corp',
        jobDescriptionBody: 'Develop and maintain software solutions.',
        customPrompt: 'Focus on Python and team collaboration skills.',
      };

      // Force callChatGPT to reject with an error
      LLMGenerationService.prototype.callChatGPT.mockRejectedValueOnce(new Error('LLM service failed'));

      const res = await request(app)
        .post('/api/v1/job-application/generate-content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reqBody)
        .set('user', testUser); // Ensuring req.user is available

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Failed to generate content.');
    });
  });
});
