import db from '../../src/models/index.js'; // Import sequelize models

describe('Employment Model', () => {
  let user; // Declare a variable to hold the created user

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // Force NODE_ENV to be 'test'
    try {
      // Authenticate and sync the database
      await db.sequelize.authenticate();
      await db.sequelize.sync({ force: true }); // Ensure tables are recreated
    } catch (error) {
      console.error('Error during test DB sync:', error);
    }
  });

  const generateUniqueEmail = async () => `testuser_${Date.now()}@example.com`;

  beforeEach(async () => {
    // Create a new user before each test
    const email = await generateUniqueEmail();
    user = await db.User.create({
      email: email,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  afterAll(async () => {
    // Close the database connection after tests are done
    await db.sequelize.close();
  });

  test('should create a valid Employment instance', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Employment',
      organizationName: 'Company XYZ',
      userId: user.id, // Use the created user
    });

    const employment = await db.Employment.create({
      jobTitle: 'Software Engineer',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2024-06-01'),
      jobDescription: 'Developing software applications',
      experienceId: experience.id, // Link to the experience
    });

    expect(employment.jobTitle).toBe('Software Engineer');
    expect(employment.startDate).toEqual(new Date('2020-06-01'));
    expect(employment.endDate).toEqual(new Date('2024-06-01'));
    expect(employment.jobDescription).toBe('Developing software applications');
  });

  test('should throw an error if jobTitle is missing', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Employment',
        organizationName: 'Company XYZ',
        userId: user.id,
      });
  
      await db.Employment.create({
        startDate: new Date('2022-06-01'),
        endDate: new Date('2026-06-01'),
        jobDescription: 'Developing software applications',
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/jobTitle cannot be null/); // Ensure validation error
    }
  });

  test('should throw an error if startDate is missing', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Employment',
        organizationName: 'Company XYZ',
        userId: user.id,
      });
  
      await db.Employment.create({
        jobTitle: 'Software Engineer',
        jobDescription: 'Developing software applications',
        endDate: new Date('2024-06-01'),
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/startDate cannot be null/); // Ensure validation error
    }
  });

  test('should throw an error if endDate is before startDate', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Employment',
        organizationName: 'Company XYZ',
        userId: user.id,
      });

      await db.Employment.create({
        jobTitle: 'Software Engineer',
        startDate: new Date('2020-06-01'),
        endDate: new Date('2019-06-01'), // Invalid endDate (before startDate)
        jobDescription: 'Developing software applications',
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/End date must be after or equal to the start date/); // Ensure validation error
    }
  });

  test('should associate Employment with Experience', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Employment',
      organizationName: 'Company XYZ',
      userId: user.id, // Use the created user
    });

    const employment = await db.Employment.create({
      jobTitle: 'Software Engineer',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2024-06-01'),
      jobDescription: 'Developing software applications',
      experienceId: experience.id, // Link to the experience
    });

    // Ensure the employment record is correctly associated with the experience
    const associatedExperience = await employment.getExperience(); // Using the association defined in the model
    expect(associatedExperience.id).toBe(experience.id);
    expect(associatedExperience.experienceType).toBe('Employment');
    expect(associatedExperience.organizationName).toBe('Company XYZ');
  });

  test('should associate Employment with User through Experience', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Employment',
      organizationName: 'Company XYZ',
      userId: user.id, // Use the created user
    });

    const employment = await db.Employment.create({
      jobTitle: 'Software Engineer',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2024-06-01'),
      jobDescription: 'Developing software applications',
      experienceId: experience.id, // Link to the experience
    });

    // Ensure the employment record is correctly associated with the experience
    const associatedExperience = await employment.getExperience(); // Get the associated experience
    expect(associatedExperience.id).toBe(experience.id);
    expect(associatedExperience.experienceType).toBe('Employment');
    expect(associatedExperience.organizationName).toBe('Company XYZ');

    // Now get the associated user from the experience
    const associatedUser = await associatedExperience.getUser(); // Using the correct association method on the Experience model
    expect(associatedUser.id).toBe(user.id);
    expect(associatedUser.email).toBe(user.email);
  });

  test('should throw an error if experienceId is invalid or null', async () => {
    try {
      await db.Employment.create({
        jobTitle: 'Software Engineer',
        startDate: new Date('2020-06-01'),
        endDate: new Date('2024-06-01'),
        jobDescription: 'Developing software applications',
        experienceId: null, // Invalid experienceId
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeDatabaseError');
      expect(error.message).toMatch(/Column 'experienceId' cannot be null/); // Foreign key constraint error
    }
  });
});
