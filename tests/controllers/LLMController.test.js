import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import LLMGenerationService from '../../src/services/llm/LLMGenerationService.js';
import CreateExperience from '../../src/services/experience/createExperience.js';
import Authenticate from '../../src/utils/Authenticate.js';
import db from '../../src/models/index.js';
import { SequelizeStorage, Umzug } from 'umzug';

jest.mock('../../src/services/llm/LLMGenerationService.js', () => {
  return jest.fn().mockImplementation(() => ({
    callChatGPT: jest.fn().mockResolvedValue(''),
  }));
});

jest.mock('axios');

let testUser;
let authToken;

describe('LLMController', () => {
  beforeAll(async () => {
    jest.setTimeout(15000);
    process.env.NODE_ENV = 'test';
    try {
      await db.sequelize.authenticate();
      const umzug = new Umzug({
        migrations: { glob: 'src/migrations/*.js' },
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        context: db.sequelize.getQueryInterface(),
      });
      await umzug.down({ to: 0 }); // Roll back all migrations first
      await umzug.up(); // Apply all migrations
    } catch (error) {
      throw error;
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const generateUniqueEmail = async () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`testuser_${Date.now()}@example.com`);
        }, 100);
      });

    const generateUniqueEmploymentOrg = async () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Tech Solutions LLC_${Date.now()}`);
        }, 100);
      });

    const generateUniqueEducationOrg = async () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`State University LLC_${Date.now()}`);
        }, 100);
      });

    const email = await generateUniqueEmail();
    const employmentOrgName = await generateUniqueEmploymentOrg();
    const educationOrgName = await generateUniqueEmploymentOrg();

    testUser = await db.User.create({
      email,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    const testUserEmployment = {
      experienceType: 'Employment',
      organizationName: employmentOrgName,
      employment: {
        jobTitle: 'Software Engineer',
        jobDescription: 'Developed scalable applications.',
        startDate: '2020-01-01',
        endDate: '2022-01-01',
      },
    };

    const testUserEducation = {
      experienceType: 'Education',
      organizationName: educationOrgName,
      education: {
        degree: 'Bachelors of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-08-15',
        endDate: '2019-05-20',
        grade: 4.0,
      },
    };

    const createEmploymentExperienceService = new CreateExperience(testUserEmployment, testUser.id);
    const createEducationExperienceService = new CreateExperience(testUserEducation, testUser.id);
    await createEmploymentExperienceService.call();
    await createEducationExperienceService.call();

    authToken = await Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await db.sequelize.close(); // Close the database connection
  });

  describe('POST /api/v1/job-application/generate-content', () => {
    it('should generate content and save documents successfully', async () => {
      // jest.spyOn(LLMGenerationService.prototype, 'callChatGPT').mockResolvedValue({
      //   choices: [
      //     {
      //       message: {
      //         content: '# Mocked Resume Content\n\n# Mocked Cover Letter Content',
      //       },
      //     },
      //   ],
      // });

      // Mock the successful response from LLM generation service
      LLMGenerationService.prototype.callChatGPT = jest.fn().mockResolvedValue(
        '##Resume##\n- Skills\n##CoverLetter##\nDear Hiring Manager,'
      );

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
        .set('user', testUser);

      // // Mock the successful response from LLM generation service
      // LLMGenerationService.prototype.callChatGPT = jest.fn().mockResolvedValue(
      //   '# Resume\n- Skills\n# Cover Letter\nDear Hiring Manager,'
      // );

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
        .send(reqBody)
        .set('user', testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Job title, company, and description are required fields.');
    });

    it('should handle LLM service errors gracefully', async () => {
      LLMGenerationService.prototype.callChatGPT = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to generate content.'));

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
        .set('user', testUser);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Failed to generate content.');
      jest.clearAllMocks();
    });
  });
});
