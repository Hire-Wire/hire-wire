/* eslint-disable no-undef */
import db from '../../src/models/index.js';

describe('Experience Model', () => {
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

  test('should create an experience with valid attributes', async () => {
    const user = await db.User.create({
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Education',
      organizationName: 'Test University',
    });

    expect(experience.userId).toBe(user.id);
    expect(experience.experienceType).toBe('Education');
    expect(experience.organizationName).toBe('Test University');
  });

  test('should not create an experience with invalid experienceType', async () => {
    const user = await db.User.create({
      email: 'invalidtype@example.com',
      password: 'password123',
      firstName: 'Invalid',
      lastName: 'Type',
    });

    await expect(
      db.Experience.create({
        userId: user.id,
        experienceType: 'InvalidType',
        organizationName: 'Invalid Organization',
      })
    ).rejects.toThrow();
  });

  test('should not create an experience without required fields', async () => {
    const user = await db.User.create({
      email: 'missingfields@example.com',
      password: 'password123',
      firstName: 'Missing',
      lastName: 'Fields',
    });

    await expect(
      db.Experience.create({
        userId: user.id,
        // Missing experienceType and organizationName
      })
    ).rejects.toThrow();
  });

  test('should enforce unique organizationName', async () => {
    const user1 = await db.User.create({
      email: 'user1@example.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'One',
    });

    const user2 = await db.User.create({
      email: 'user2@example.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'Two',
    });

    await db.Experience.create({
      userId: user1.id,
      experienceType: 'Employment',
      organizationName: 'Unique Org',
    });

    await expect(
      db.Experience.create({
        userId: user2.id,
        experienceType: 'Education',
        organizationName: 'Unique Org',
      })
    ).rejects.toThrow();
  });

  test('should associate experience with user', async () => {
    const user = await db.User.create({
      email: 'associate@example.com',
      password: 'password123',
      firstName: 'Associate',
      lastName: 'User',
    });

    const experience = await db.Experience.create({
      userId: user.id,
      experienceType: 'Employment',
      organizationName: 'Associate Org',
    });

    const fetchedExperience = await db.Experience.findOne({
      where: { id: experience.id },
      include: [{ model: db.User, as: 'User' }], // Specify the alias here
    });

    expect(fetchedExperience.User).toBeDefined();
    expect(fetchedExperience.User.email).toBe('associate@example.com');
  });
});
