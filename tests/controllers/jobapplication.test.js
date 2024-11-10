/* eslint-disable no-undef */

import { Umzug, SequelizeStorage } from 'umzug';
import request from 'supertest';
import app from '../../server.js';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';

let authToken;
let transaction;

// Helper function to make requests to create job applications
const createJobApplication = async (data = {}, token = authToken) => request(app)
  .post('/api/v1/job-application')
  .set('Authorization', `Bearer ${token}`)
  .send(data);

describe('JobApplication Controller', () => {
  let user;

  beforeAll(async () => {
    // Step 1: Connect to the database
    try {
      await db.sequelize.authenticate();
      console.log('Connected to the database.');
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      throw connectionError;
    }

    // Step 2: Run migrations to ensure all tables are set up
    try {
      const umzug = new Umzug({
        migrations: { glob: 'src/migrations/*.js' },
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        context: db.sequelize.getQueryInterface(),
        logger: console,
      });
      await umzug.up(); // Run all migrations
      console.log('All migrations ran successfully.');
    } catch (migrationError) {
      console.error('Error running migrations:', migrationError);
      throw migrationError;
    }

    // Step 3: Cleanup - delete all records in a dependency-safe order
    try {
      await db.User.destroy({ where: {}, cascade: true });
      console.log('All test data deleted successfully.');
    } catch (cleanupError) {
      console.error('Error during cleanup of test data:', cleanupError);
      throw cleanupError;
    }

    // Step 4: Set up a mock user and auth token for testing
    try {
      // Setup mock user
      user = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' };

      console.log('Token generated and verified successfully.');
    } catch (error) {
      console.error('Error generating or verifying token:', error);
      throw error; // rethrow to fail the test setup if there's an issue
    }
  });

  beforeEach(async () => {
    const existingUser = await db.User.findOne({ where: { email: 'test@example.com' } });
    if (!existingUser) {
      user = await db.User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });
    } else {
      user = existingUser;
    }
    authToken = Authenticate.generateToken(user);
  });

  afterEach(async () => {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
    console.log('Database connection closed.');
  });

  describe('JobApplication Controller', () => {
    describe('POST /api/v1/job-application', () => {
      test('should create a job application with a valid job description', async () => {
        try {
          const response = await createJobApplication({
            jobAppTitle: 'Software Engineer',
            jobAppCompany: 'Tech Corp',
            jobAppDescription: 'Responsible for developing software solutions',
          });

          expect(response.statusCode).toBe(201);
          expect(response.body.success).toBe(true);
          expect(response.body.jobApplication).toHaveProperty('jobApplicationID');
        } catch (error) {
          console.error('Error in creating job application test:', error);
          throw error;
        }
      });

      test('should fail when required fields are missing', async () => {
        try {
          const response = await createJobApplication({});

          expect(response.statusCode).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toMatch(/Job title is required and must be between 2 and 100 characters./i);
        } catch (error) {
          console.error('Error in missing fields test:', error);
          throw error;
        }
      });
    });

    describe('POST /api/v1/jobapplication/:jobApplicationID/documents', () => {
      test('should add a document to a job application', async () => {
        // Create a job application specifically for this test
        const docTestJobApplication = await db.JobApplication.create({ userId: user.id });
        console.log('JobApplication ID:', docTestJobApplication.jobApplicationID); // Debugging log for jobApplicationID

        // Log the authToken to ensure it's correct
        console.log('AuthToken:', authToken);

        // Send a request to add a document to the job application
        const response = await request(app)
          .post(`/api/v1/job-application/${docTestJobApplication.jobApplicationID}/documents`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            docType: 'Resume', // Valid document type
            docBody: 'Resume content here...',
          });

        // Debugging log to inspect the response status and body
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Check the response to ensure the document was added
        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.document).toHaveProperty('docId');

        // Verify the document is associated with the correct job application in the database
        const document = await db.Document.findOne({
          where: {
            docId: response.body.document.docId,
            jobApplicationID: docTestJobApplication.jobApplicationID,
          },
        });
        expect(document).not.toBeNull();
        expect(document.jobApplicationID).toBe(docTestJobApplication.jobApplicationID);
      });

      test('should fail with invalid document type', async () => {
        // Create a job application specifically for this test
        const docTestJobApplication = await db.JobApplication.create({ userId: user.id });

        // Send a request with an invalid document type
        const response = await request(app)
          .post(`/api/v1/job-application/${docTestJobApplication.jobApplicationID}/documents`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            docType: 'InvalidDocType', // Invalid document type
            docBody: 'Invalid content here...',
          });

        // Debugging log to inspect the response status and body
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Check response to ensure the document type validation fails
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/Invalid document type/i);
      });
    });

    describe('GET /api/v1/job-application/:jobApplicationID', () => {
      let jobApplication;
      let authToken;

      beforeEach(async () => {
        // Set up user and auth token
        authToken = Authenticate.generateToken(user); // Assuming `user` is defined globally or in an outer scope

        // Create a job application specifically for this test
        jobApplication = await db.JobApplication.create({ userId: user.id });
        console.log('Created JobApplication with ID:', jobApplication.jobApplicationID); // Log to confirm creation
      });

      test('should retrieve a job application with description', async () => {
        // Make GET request to retrieve the job application
        const response = await request(app)
          .get(`/api/v1/job-application/${jobApplication.jobApplicationID}`)
          .set('Authorization', `Bearer ${authToken}`);

        // Log the response for debugging
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Assertions
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.jobApplication).toHaveProperty('JobDescription');
      });

      test('should return 404 for non-existent job application', async () => {
        // Make GET request to a non-existent job application
        const response = await request(app)
          .get('/api/v1/job-application/9999')
          .set('Authorization', `Bearer ${authToken}`);

        // Log the response for debugging
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Assertions
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/not found/i);
      });
    });

    describe('DELETE /api/v1/job-application/:jobApplicationID', () => {
      let authToken;
      let jobApplication;

      beforeEach(async () => {
        // Generate auth token for each test
        authToken = Authenticate.generateToken(user); // Assuming `user` is defined in an outer scope
      });

      test('should delete a job application and associated data', async () => {
        // Create a job application specifically for this test
        jobApplication = await db.JobApplication.create({ userId: user.id });
        console.log('Created JobApplication with ID:', jobApplication.jobApplicationID); // Log to confirm creation

        // Send DELETE request to remove the job application
        const response = await request(app)
          .delete(`/api/v1/job-application/${jobApplication.jobApplicationID}`)
          .set('Authorization', `Bearer ${authToken}`);

        // Log response for debugging
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Assertions to confirm successful deletion
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify deletion in the database
        const deletedJobApp = await db.JobApplication.findByPk(jobApplication.jobApplicationID);
        expect(deletedJobApp).toBeNull();
      });

      test('should return 404 for non-existent job application', async () => {
        // Attempt to delete a non-existent job application
        const response = await request(app)
          .delete('/api/v1/job-application/9999')
          .set('Authorization', `Bearer ${authToken}`);

        // Log response for debugging
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);

        // Assertions to confirm 404 response
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/not found/i);
      });
    });
  });
});
