import db from '../../src/models/index.js'; // Import sequelize models

describe('Education Model', () => {
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

  beforeEach(async () => {
    // Create a new user before each test
    const email = `testuser_${Date.now()}@example.com`;
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

  test('should create a valid Education instance', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Education',
      organizationName: 'University XYZ',
      userId: user.id, // Use the created user
    });

    const education = await db.Education.create({
      degree: 'B.Sc. Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2020-09-01'),
      endDate: new Date('2024-06-01'),
      experienceId: experience.id,
    });

    expect(education.degree).toBe('B.Sc. Computer Science');
    expect(education.fieldOfStudy).toBe('Computer Science');
    expect(education.startDate).toEqual(new Date('2020-09-01'));
    expect(education.endDate).toEqual(new Date('2024-06-01'));
  });

  test('should throw an error if degree is missing', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Education',
        organizationName: 'University XYZ',
        userId: user.id,
      });
  
      await db.Education.create({
        fieldOfStudy: 'Software Engineering',
        startDate: new Date('2022-09-01'),
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/degree cannot be null/); // Ensure validation error
    }
  });
  
  test('should throw an error if fieldOfStudy is missing', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Education',
        organizationName: 'University XYZ',
        userId: user.id,
      });
  
      await db.Education.create({
        degree: 'M.Eng. Software Engineering',
        startDate: new Date('2023-06-01'),
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/fieldOfStudy cannot be null/); // Ensure validation error
    }
  });
  
  test('should throw an error if startDate is missing', async () => {
    try {
      const experience = await db.Experience.create({
        experienceType: 'Education',
        organizationName: 'University XYZ',
        userId: user.id,
      });
  
      await db.Education.create({
        degree: 'B.Sc. Computer Science',
        fieldOfStudy: 'Computer Science',
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
        experienceType: 'Education',
        organizationName: 'University XYZ',
        userId: user.id,
      });
  
      await db.Education.create({
        degree: 'B.Sc. Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2019-09-01'), // Invalid endDate
        experienceId: experience.id,
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
      expect(error.message).toMatch(/End date must be after or equal to the start date/); // Ensure validation error
    }
  });

  test('should associate Education with Experience', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Education',
      organizationName: 'University XYZ',
      userId: user.id, // Use the created user
    });
  
    const education = await db.Education.create({
      degree: 'B.Sc. Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2020-09-01'),
      endDate: new Date('2024-06-01'),
      experienceId: experience.id,
    });
  
    // Ensure the education record is correctly associated with the experience
    const associatedExperience = await education.getExperience(); // Using the association defined in the model
    expect(associatedExperience.id).toBe(experience.id);
    expect(associatedExperience.experienceType).toBe('Education');
    expect(associatedExperience.organizationName).toBe('University XYZ');
  });
  

  test('should associate Education with User', async () => {
    const experience = await db.Experience.create({
      experienceType: 'Education',
      organizationName: 'University XYZ',
      userId: user.id, // Use the created user
    });
  
    const education = await db.Education.create({
      degree: 'B.Sc. Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2020-09-01'),
      endDate: new Date('2024-06-01'),
      experienceId: experience.id,
    });
  
    // Ensure the education record is correctly associated with the experience
    const associatedExperience = await education.getExperience(); // Get the associated experience
    expect(associatedExperience.id).toBe(experience.id);
    expect(associatedExperience.experienceType).toBe('Education');
    expect(associatedExperience.organizationName).toBe('University XYZ');
  
    // Now get the associated user from the experience
    const associatedUser = await associatedExperience.getUser(); // Using the correct association method on the Experience model
    expect(associatedUser.id).toBe(user.id);
    expect(associatedUser.email).toBe(user.email);
  });
  
  test('should throw an error if experienceId is invalid or null', async () => {
    try {
      await db.Education.create({
        degree: 'B.Sc. Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-06-01'),
        experienceId: null, // Invalid experienceId
      });
    } catch (error) {
      expect(error.name).toBe('SequelizeDatabaseError');
      expect(error.message).toMatch(/Column 'experienceId' cannot be null/); 
    }
  });
  

});
