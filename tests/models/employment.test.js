/* eslint-disable no-undef */
import db from '../../src/models/index.js';

describe('Employment Model', () => {
  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
      await db.sequelize.sync({ force: true });
    } catch (error) {
      console.error('Error during sync:', error);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('should create an employment with valid attributes', async () => {
    const user = await db.User.create({
      email: 'employmentuser@example.com',
      password: 'password123',
      firstName: 'Employment',
      lastName: 'User',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Employment',
      organizationName: 'Employment Org',
    });

    const employment = await db.Employment.create({
      jobTitle: 'Software Engineer',
      jobDescription: 'Developed awesome applications',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-01-01'),
      experienceId: experience.id,
    });

    expect(employment.jobTitle).toBe('Software Engineer');
    expect(employment.experienceId).toBe(experience.id);
  });

  test('should not create an employment without required fields', async () => {
    const experience = await db.Experience.create({
      userId: 1, // Assuming a user with ID 1 exists
      experienceType: 'Employment',
      organizationName: 'Missing Fields Org',
    });

    await expect(
      db.Employment.create({
        // Missing jobTitle and startDate
        experienceId: experience.id,
      })
    ).rejects.toThrow();
  });

  test('should enforce endDate is after or equal to startDate', async () => {
    const experience = await db.Experience.create({
      userId: 1,
      experienceType: 'Employment',
      organizationName: 'Date Validation Org',
    });

    await expect(
      db.Employment.create({
        jobTitle: 'Invalid Dates Job',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2020-01-01'), // endDate before startDate
        experienceId: experience.id,
      })
    ).rejects.toThrow('End date must be after or equal to the start date');
  });

  test('should enforce unique jobTitle per experience', async () => {
    const experience = await db.Experience.create({
      userId: 1,
      experienceType: 'Employment',
      organizationName: 'Unique Job Title Org',
    });

    await db.Employment.create({
      jobTitle: 'Unique Job',
      startDate: new Date('2020-01-01'),
      experienceId: experience.id,
    });

    await expect(
      db.Employment.create({
        jobTitle: 'Unique Job', // Same jobTitle
        startDate: new Date('2021-01-01'),
        experienceId: experience.id, // Same experienceId
      })
    ).rejects.toThrow();
  });

  test('should associate employment with experience', async () => {
    const user = await db.User.create({
      email: 'employmentassoc@example.com',
      password: 'password123',
      firstName: 'Employment',
      lastName: 'Assoc',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Employment',
      organizationName: 'Assoc Org',
    });

    const employment = await db.Employment.create({
      jobTitle: 'Associate Engineer',
      startDate: new Date('2020-01-01'),
      experienceId: experience.id,
    });

    const fetchedEmployment = await db.Employment.findOne({
      where: { id: employment.id },
      include: [{ model: db.Experience, as: 'Experience' }],
    });

    expect(fetchedEmployment.Experience).toBeDefined();
    expect(fetchedEmployment.Experience.organizationName).toBe('Assoc Org');
  });
});
