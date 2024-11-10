/* eslint-disable no-undef */

import { Umzug, SequelizeStorage } from 'umzug';
import request from 'supertest';
import app from '../../server.js';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';

let authToken;
let transaction;

// Helper function to create job applications via request
const createJobApplication = (data = {}, token = authToken) => {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/api/v1/job-application')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .end((err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
  });
};

describe('JobApplication Controller', () => {
  let user;

  beforeAll(async () => {
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

    try {
      user = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    } catch (error) {
      throw error;
    }
  });

  beforeEach(async () => {
    user = await db.User.findOne({ where: { email: 'test@example.com' } });
    if (!user) {
      user = await db.User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });
    }
    authToken = await Authenticate.generateToken(user);
  });

  afterEach(async () => {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/v1/job-application', () => {
    test('should create a job application with a valid job description', async () => {
      const response = await createJobApplication({
        jobAppTitle: 'Software Engineer',
        jobAppCompany: 'Tech Corp',
        jobAppDescription: 'Responsible for developing software solutions',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.jobApplication).toHaveProperty('id');
    });

    test('should fail when required fields are missing', async () => {
      const response = await createJobApplication({});
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Job title is required and must be between 2 and 100 characters./i);
    });
  });

  describe('POST /api/v1/job-application/:id/documents', () => {
    test('should add a document to a job application', async () => {
      const docTestJobApplication = await db.JobApplication.create({ userId: user.id });

      const response = await request(app)
        .post(`/api/v1/job-application/${docTestJobApplication.id}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          docType: 'Resume',
          docBody: 'Resume content here...',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document).toHaveProperty('jobApplicationId');

      const document = await db.Document.findOne({
        where: { id: response.body.document.id, jobApplicationId: docTestJobApplication.id },
      });
      expect(document).not.toBeNull();
      expect(document.jobApplicationId).toBe(docTestJobApplication.id);
    });

    test('should fail with invalid document type', async () => {
      const docTestJobApplication = await db.JobApplication.create({ userId: user.id });

      const response = await request(app)
        .post(`/api/v1/job-application/${docTestJobApplication.id}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          docType: 'InvalidDocType',
          docBody: 'Invalid content here...',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Invalid document type/i);
    });
  });

  describe('GET /api/v1/job-application/:id', () => {
    let jobApplication;

    beforeEach(async () => {
      authToken = Authenticate.generateToken(user);
      jobApplication = await db.JobApplication.create({ userId: user.id });
    });

    test('should retrieve a job application with description', async () => {
      const response = await request(app)
        .get(`/api/v1/job-application/${jobApplication.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.jobApplication).toHaveProperty('JobDescription');
    });

    test('should return 404 for non-existent job application', async () => {
      const response = await request(app)
        .get('/api/v1/job-application/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('DELETE /api/v1/job-application/:id', () => {
    let jobApplication;

    beforeEach(async () => {
      authToken = Authenticate.generateToken(user);
    });

    test('should delete a job application and associated data', async () => {
      jobApplication = await db.JobApplication.create({ userId: user.id });

      const response = await request(app)
        .delete(`/api/v1/job-application/${jobApplication.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedJobApp = await db.JobApplication.findByPk(jobApplication.id);
      expect(deletedJobApp).toBeNull();
    });

    test('should return 404 for non-existent job application', async () => {
      const response = await request(app)
        .delete('/api/v1/job-application/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    });
  });
});
