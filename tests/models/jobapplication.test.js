/* eslint-disable no-undef */
import { Umzug, SequelizeStorage } from 'umzug';
import db from '../../src/models/index.js';

let transaction;

// Check if required tables exist in the database
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

  // Confirm table structure once before all tests, without altering schema
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
      // Order matters due to foreign key constraints; delete from tables in reverse dependency order
      await db.User.destroy({ where: {}, cascade: true });
      console.log('All test data deleted successfully.');
    } catch (cleanupError) {
      console.error('Error during cleanup of test data:', cleanupError);
      throw cleanupError;
    }

    // Step 4: Verify required tables exist after migrations
    try {
      const requiredTables = ['Users', 'Experiences', 'Employments', 'Educations', 'JobApplications', 'JobDescriptions', 'Documents'];
      for (const table of requiredTables) {
        const exists = await tableExists(table);
        if (!exists) throw new Error(`Table ${table} is missing. Run migrations.`);
      }
      console.log('All required tables verified.');
    } catch (verificationError) {
      console.error('Error verifying table existence:', verificationError);
      throw verificationError;
    }
  });

  beforeEach(async () => {
    transaction = await db.sequelize.transaction();
    try {
      const existingUser = await db.User.findOne({ where: { email: 'test@example.com' } });

      if (!existingUser) {
        const newUser = await db.User.create({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });
        user = newUser;
        console.log('Test user created successfully for each test.');
      } else {
        user = existingUser;
        console.log('Test user already exists and was fetched.');
      }
    } catch (error) {
      console.error('Error creating or fetching test user:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // Check if the transaction is still active before attempting a rollback
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
    console.log('Database connection closed.');
  });

  describe('JobApplication Creation and Associations', () => {
    test('should create a JobApplication with a valid user association', async () => {
      const jobTransaction = await db.sequelize.transaction();
      try {
        const foundUser = await db.User.findOne({
          where: { email: 'test@example.com' },
          transaction: jobTransaction,
        });
        if (!foundUser) throw new Error('User does not exist');

        const jobApplication = await db.JobApplication.create(
          { userId: foundUser.id },
          { transaction: jobTransaction }
        );

        expect(jobApplication).toBeDefined();
        expect(jobApplication.userId).toBe(foundUser.id);
        await jobTransaction.commit();
      } catch (error) {
        await jobTransaction.rollback();
        console.error('Error during JobApplication creation test:', error);
        throw error;
      }
    });

    test('should not create JobApplication without a userId', async () => {
      const jobTransaction = await db.sequelize.transaction();
      try {
        await expect(
          db.JobApplication.create({}, { transaction: jobTransaction })
        ).rejects.toThrow('notNull Violation: User ID is required for a Job Application');
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
        const jobApplication = await db.JobApplication.create(
          { userId: user.id },
          { transaction: jobDescTransaction }
        );

        const jobDescription = await db.JobDescription.create(
          {
            jobApplicationId: jobApplication.id,
            jobTitle: 'Software Engineer',
            jobCompany: 'Tech Company',
            jobDescriptionBody: 'Develops software solutions.',
          },
          { transaction: jobDescTransaction }
        );

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
        const jobApplication = await db.JobApplication.create(
          { userId: user.id },
          { transaction: docTransaction }
        );

        await db.Document.bulkCreate(
          [
            { jobApplicationId: jobApplication.id, docType: 'Resume', docBody: 'Resume content here...' },
            { jobApplicationId: jobApplication.id, docType: 'Cover Letter', docBody: 'Cover letter content here...' },
          ],
          { transaction: docTransaction }
        );

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
        const jobApplication = await db.JobApplication.create(
          { userId: user.id },
          { transaction: cascadeTransaction }
        );

        await db.JobDescription.create(
          { jobApplicationId: jobApplication.id, jobTitle: 'Software Engineer', jobCompany: 'Tech Company', jobDescriptionBody: 'Develops software solutions.' },
          { transaction: cascadeTransaction }
        );

        await db.Document.create(
          { jobApplicationId: jobApplication.id, docType: 'Resume', docBody: 'Resume content here...' },
          { transaction: cascadeTransaction }
        );

        await jobApplication.destroy({ transaction: cascadeTransaction });

        const deletedJobDescription = await db.JobDescription.findOne({
          where: { jobApplicationId: jobApplication.id },
          transaction: cascadeTransaction,
        });

        const deletedDocuments = await db.Document.findAll({
          where: { jobApplicationId: jobApplication.id },
          transaction: cascadeTransaction,
        });

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
        const jobApplication = await db.JobApplication.create(
          { userId: user.id },
          { transaction: validationTransaction }
        );

        await expect(
          db.JobDescription.create(
            {
              jobApplicationId: jobApplication.id,
              jobTitle: 'A',
              jobCompany: 'Tech Company',
              jobDescriptionBody: 'Software development tasks',
            },
            { transaction: validationTransaction }
          )
        )
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
