// experience.test.js
import db from '../../src/models/index.js'; // Your sequelize models and connection

describe('Experience Model', () => {
  beforeAll(async () => {
    // Ensure we are using the test environment
    process.env.NODE_ENV = 'test'; // Force NODE_ENV to be 'test'

    try {
      // Authenticate the connection with the test database
      await db.sequelize.authenticate();
      console.log('Test Database connection established.');

      //Clean up previous entries before each test
      await db.User.destroy({where: {}});
      await db.Experience.destroy({where: {}});

      // Sync the test database, ensuring it’s fresh before running the tests
      await db.sequelize.sync({ force: true }); // `force: true` will drop and recreate tables
      console.log('Test Database synced successfully.');
    } catch (error) {
      console.error('Error during test DB sync:', error);
    }
  });

  afterAll(async () => {
    // Close the database connection after tests are done
    await db.sequelize.close();
    console.log('Test Database connection closed.');
  });

   // Dynamically create unique email addresses for each test
  const generateUniqueEmail = async () => `testuser_${Date.now()}@example.com`;

  test('should create an Experience instance with valid attributes', async () => {
    const email = await generateUniqueEmail(); // Unique email for each test
    const user = await db.User.create({
        email: email,
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Employment',
      organizationName: 'Company XYZ',
    });

    expect(experience.userId).toBe(user.id);
    expect(experience.experienceType).toBe('Employment');
    expect(experience.organizationName).toBe('Company XYZ');
  });

  test('should throw an error if experienceType is missing', async () => {
    try {
        const email = await generateUniqueEmail(); // Unique email for each test
        const user = await db.User.create({
            email: email,
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
        });
      await db.Experience.create({
        userId: user.id,
        organizationName: 'Company XYZ',
      });
    } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
        expect(error.message).toMatch(/notNull Violation/); // Ensure it throws a validation error
    }
  });

  test('should throw an error if organizationName is missing', async () => {
    try {
        const email = await generateUniqueEmail(); // Unique email for each test
        const user = await db.User.create({
            email: email,
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
        });
      await db.Experience.create({
        userId: user.id,
        experienceType: 'Employment',
      });
    } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
        expect(error.message).toMatch(/notNull Violation/); // Ensure it throws a validation error
    }
  });

  test('should validate that experienceType is either "Education" or "Employment"', async () => {
    try {
        const email = await generateUniqueEmail(); // Unique email for each test
        const user = await db.User.create({
            email: email,
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
        });
      await db.Experience.create({
        userId: user.id,
        experienceType: 'InvalidType', // Invalid experience type
        organizationName: 'Company XYZ',
      });
    } catch (error) {
      expect(error.message).toMatch(/experienceType must be either "Education" or "Employment"/);
    }
  });

  test('should have associations to Employment and Education models', async () => {
    const email = await generateUniqueEmail(); // Unique email for each test
    const user = await db.User.create({
        email: email,
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
    });
    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Employment',
      organizationName: 'Company XYZ',
    });
    // Test hasMany association with Employment
    const employment = await experience.createEmployment({
      jobTitle: 'Software Engineer',
      startDate: new Date(),
    });

    expect(employment.experienceId).toBe(experience.id);
    expect(employment.jobTitle).toBe('Software Engineer');

    // Test hasMany association with Education
    const education = await experience.createEducation({
      degree: 'B.Sc. Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date(),
    });

    expect(education.experienceId).toBe(experience.id);
    expect(education.degree).toBe('B.Sc. Computer Science');

  });


});
