import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import LLMGenerationService from '../../src/services/llm/LLMGenerationService.js';
import CreateExperience from '../../src/services/experience/createExperience.js';
import Authenticate from '../../src/utils/Authenticate.js';
import db from '../../src/models/index.js';

jest.mock('../../src/services/llm/LLMGenerationService.js', () => ({
  callChatGPT: jest.fn(),
}));

jest.mock('axios');

let testUser;
let authToken;

describe('LLMController', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // Force NODE_ENV to be 'test'
    try {
      // Authenticate and sync the database
      await db.sequelize.authenticate();
    } catch (error) {
      console.error('Error during test DB sync:', error);
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create a new user before each test
    const generateUniqueEmail = async () =>
      // Simulating async email generation process
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`testuser_${Date.now()}@example.com`);
        }, 100); // Just simulating a small delay
      });
    const email = await generateUniqueEmail();

    testUser = await db.User.create({
      email,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    const testUserEmployment = {
      experienceType: 'Employment',
      organizationName: 'Tech Solutions LLC',
      employment: {
        jobTitle: 'Software Engineer',
        jobDescription: 'Developed scalable applications.',
        startDate: '2020-01-01',
        endDate: '2022-01-01',
      },
    };

    const testUserEducation = {
      experienceType: 'Education',
      organizationName: 'State University',
      education: {
        degree: 'BSc Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-08-15',
        endDate: '2019-05-20',
        grade: 99,
      },
    };

    try {
      console.log(`Creating employment experience for user ID: ${testUser.id}...`);
      await new CreateExperience(testUserEmployment, testUser.id).call();
      console.log('Successfully created employment experience.');

      console.log(`Creating education experience for user ID: ${testUser.id}...`);
      await new CreateExperience(testUserEducation, testUser.id).call();
      console.log('Successfully created education experience.');
    } catch (error) {
      console.error('Error creating experience:', error.message);
    }

    // Mock the authentication token generation
    authToken = await Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);

    // Mock the successful response from LLM generation service
    LLMGenerationService.prototype.callChatGPT = jest.fn().mockResolvedValue(
      '# Resume\n- Skills\n# Cover Letter\nDear Hiring Manager,'
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
