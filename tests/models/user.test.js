/* eslint-disable no-undef */
import bcrypt from 'bcrypt';
import db from '../../src/models/index.js';

describe('User Model', () => {
  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
      console.log('Database connection established.');
      await db.sequelize.sync({ force: true });
      console.log('Database synced successfully.');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('should create a user with valid attributes', async () => {
    const user = await db.User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
  });

  test('should not create a user with invalid email', async () => {
    await expect(
        db.User.create({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        })
    ).rejects.toThrow();
  });

  test('should hash the password before saving', async () => {
    const user = await db.User.create({
      email: 'hash@test.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    const isMatch = await bcrypt.compare('password123', user.password);
    expect(isMatch).toBe(true);
  });
});
