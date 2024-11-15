/* eslint-disable no-undef */
import db from '../../src/models/index.js';

describe('Education Model', () => {
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

  test('should create an education with valid attributes', async () => {
    const user = await db.User.create({
      email: 'educationuser@example.com',
      password: 'password123',
      firstName: 'Education',
      lastName: 'User',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Education Org',
    });

    const education = await db.Education.create({
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      grade: 3.8,
      startDate: new Date('2016-09-01'),
      endDate: new Date('2020-05-15'),
      experienceId: experience.id,
    });

    expect(education.degree).toBe('Bachelor of Science');
    expect(education.experienceId).toBe(experience.id);
  });

  test('should not create an education without required fields', async () => {
    const user = await db.User.create({
      email: 'missingfieldsedu@example.com',
      password: 'password123',
      firstName: 'Missing',
      lastName: 'Fields',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Missing Fields Org',
    });

    await expect(
      db.Education.create({
        // Missing degree, fieldOfStudy, and startDate
        experienceId: experience.id,
      })
    ).rejects.toThrow();
  });

  test('should enforce endDate is after or equal to startDate', async () => {
    const user = await db.User.create({
      email: 'datevalidationedu@example.com',
      password: 'password123',
      firstName: 'Date',
      lastName: 'Validation',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Date Validation Org',
    });

    await expect(
      db.Education.create({
        degree: 'Master of Science',
        fieldOfStudy: 'Data Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2019-05-15'), // endDate before startDate
        experienceId: experience.id,
      })
    ).rejects.toThrow('End date must be after or equal to the start date');
  });

  test('should enforce unique degree per experience', async () => {
    const user = await db.User.create({
      email: 'uniqueedu@example.com',
      password: 'password123',
      firstName: 'Unique',
      lastName: 'Education',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Unique Degree Org',
    });

    await db.Education.create({
      degree: 'Bachelor of Arts',
      fieldOfStudy: 'History',
      startDate: new Date('2015-09-01'),
      experienceId: experience.id,
    });

    await expect(
      db.Education.create({
        degree: 'Bachelor of Arts', // Same degree
        fieldOfStudy: 'Literature',
        startDate: new Date('2016-09-01'),
        experienceId: experience.id, // Same experienceId
      })
    ).rejects.toThrow();
  });

  test('should associate education with experience', async () => {
    const user = await db.User.create({
      email: 'educationassoc@example.com',
      password: 'password123',
      firstName: 'Education',
      lastName: 'Assoc',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Assoc Org',
    });

    const education = await db.Education.create({
      degree: 'PhD',
      fieldOfStudy: 'Physics',
      startDate: new Date('2010-09-01'),
      experienceId: experience.id,
    });

    const fetchedEducation = await db.Education.findOne({
      where: { id: education.id },
      include: [{ model: db.Experience, as: 'Experience' }],
    });

    expect(fetchedEducation.Experience).toBeDefined();
    expect(fetchedEducation.Experience.organizationName).toBe('Assoc Org');
  });
});
