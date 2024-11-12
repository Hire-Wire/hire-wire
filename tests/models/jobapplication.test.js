/* eslint-disable no-undef */

import { Umzug, SequelizeStorage } from 'umzug';
import db from '../../src/models/index.js';

let transaction;

// Helper function to check if a table exists in the database
async function tableExists(tableName) {
  const result = await db.sequelize.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = '${db.sequelize.config.database}'
       AND table_name = '${tableName}'`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return result.length > 0;
}

describe('JobApplication Model', () => {
  let user;

  // Ensure database connection and setup before tests
  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
    } catch (connectionError) {
      throw new Error('Database connection error:', connectionError);
    }

    // Run migrations
    const umzug = new Umzug({
      migrations: { glob: 'src/migrations/*.js' },
      storage: new SequelizeStorage({ sequelize: db.sequelize }),
      context: db.sequelize.getQueryInterface(),
    });
    await umzug.up();

    // Verify required tables exist
    const requiredTables = ['Users', 'Experiences', 'Employments', 'Educations', 'JobApplications', 'JobDescriptions', 'Documents'];
    for (const table of requiredTables) {
      if (!(await tableExists(table))) throw new Error(`Table ${table} is missing. Run migrations.`);
    }
  });

  // Create a user for each test if not already created
  beforeEach(async () => {
    transaction = await db.sequelize.transaction();
    user = await db.User.findOne({ where: { email: 'test@example.com' } })
      || await db.User.create({ email: 'test@example.com', password: 'password123', firstName: 'John', lastName: 'Doe' });
  });

  // Rollback transaction after each test
  afterEach(async () => {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('JobApplication Creation and Associations', () => {
    test('should create a JobApplication with a valid user association', async () => {
      const jobTransaction = await db.sequelize.transaction();
      try {
        const jobApplication = await db.JobApplication.create({ userId: user.id }, { transaction: jobTransaction });
        expect(jobApplication).toBeDefined();
        expect(jobApplication.userId).toBe(user.id);
        await jobTransaction.commit();
      } catch (error) {
        await jobTransaction.rollback();
        throw error;
      }
    });

    test('should not create JobApplication without a userId', async () => {
      const jobTransaction = await db.sequelize.transaction();
      try {
        await expect(db.JobApplication.create({}, { transaction: jobTransaction }))
          .rejects
          .toThrow('notNull Violation: User ID is required for a Job Application');
        await jobTransaction.commit();
      } catch (error) {
        await jobTransaction.rollback();
        throw error;
      }
    });
  });

  describe('JobDescription Association', () => {
    test('should associate JobApplication with JobDescription', async () => {
      const jobDescTransaction = await db.sequelize.transaction();
      try {
        const jobApplication = await db.JobApplication.create({ userId: user.id }, { transaction: jobDescTransaction });
        const jobDescription = await db.JobDescription.create({
          jobApplicationId: jobApplication.id,
          jobTitle: 'Software Engineer',
          jobCompany: 'Tech Company',
          jobDescriptionBody: 'Develops software solutions.',
        }, { transaction: jobDescTransaction });

        const associatedJobDescription = await jobApplication.getJobDescription({ transaction: jobDescTransaction });
        expect(associatedJobDescription).toBeDefined();
        expect(associatedJobDescription.jobTitle).toBe('Software Engineer');
        await jobDescTransaction.commit();
      } catch (error) {
        await jobDescTransaction.rollback();
        throw error;
      }
    });
  });

  describe('Document Association', () => {
    test('should associate JobApplication with multiple Documents', async () => {
      const docTransaction = await db.sequelize.transaction();
      try {
        const jobApplication = await db.JobApplication.create({ userId: user.id }, { transaction: docTransaction });
        await db.Document.bulkCreate([
          { jobApplicationId: jobApplication.id, docType: 'Resume', docBody: 'Resume content here...' },
          { jobApplicationId: jobApplication.id, docType: 'Cover Letter', docBody: 'Cover letter content here...' },
        ], { transaction: docTransaction });

        const documents = await jobApplication.getDocuments({ transaction: docTransaction });
        expect(documents).toHaveLength(2);
        await docTransaction.commit();
      } catch (error) {
        await docTransaction.rollback();
        throw error;
      }
    });
  });

  describe('Cascade Deletion', () => {
    test('should delete associated JobDescriptions and Documents on JobApplication deletion', async () => {
      const cascadeTransaction = await db.sequelize.transaction();
      try {
        const jobApplication = await db.JobApplication.create({ userId: user.id }, { transaction: cascadeTransaction });
        await db.JobDescription.create({
          jobApplicationId: jobApplication.id,
          jobTitle: 'Software Engineer',
          jobCompany: 'Tech Company',
          jobDescriptionBody: 'Develops software solutions.',
        }, { transaction: cascadeTransaction });

        await db.Document.create({ jobApplicationId: jobApplication.id, docType: 'Resume', docBody: 'Resume content here...' }, { transaction: cascadeTransaction });

        await jobApplication.destroy({ transaction: cascadeTransaction });

        const deletedJobDescription = await db.JobDescription.findOne({ where: { jobApplicationId: jobApplication.id }, transaction: cascadeTransaction });
        const deletedDocuments = await db.Document.findAll({ where: { jobApplicationId: jobApplication.id }, transaction: cascadeTransaction });

        expect(deletedJobDescription).toBeNull();
        expect(deletedDocuments).toHaveLength(0);
        await cascadeTransaction.commit();
      } catch (error) {
        await cascadeTransaction.rollback();
        throw error;
      }
    });
  });

  describe('Field Validations and Constraints', () => {
    test('should not allow jobTitle shorter than 2 characters', async () => {
      const validationTransaction = await db.sequelize.transaction();
      try {
        const jobApplication = await db.JobApplication.create({ userId: user.id }, { transaction: validationTransaction });

        await expect(db.JobDescription.create({
          jobApplicationId: jobApplication.id,
          jobTitle: 'A', // Invalid title length
          jobCompany: 'Tech Company',
          jobDescriptionBody: 'Software development tasks',
        }, { transaction: validationTransaction }))
          .rejects
          .toThrow('Validation error: Job title should be between 2 and 100 characters');

        await validationTransaction.commit();
      } catch (error) {
        await validationTransaction.rollback();
        throw error;
      }
    });
  });
});
