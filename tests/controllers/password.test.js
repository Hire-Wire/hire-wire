// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';
import { Umzug, SequelizeStorage } from 'umzug';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../server.js';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';

// Mock bcrypt.hash to always return 'hashed_NewPassword123'
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  hash: jest.fn(plainText => `hashed_${plainText}`),
}));

let authToken;
let user;

describe('PasswordController', () => {
  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
      const umzug = new Umzug({
        migrations: { glob: 'src/migrations/*.js' },
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        context: db.sequelize.getQueryInterface(),
      });
      await umzug.down({ to: 0 });
      await umzug.up();

      // Cleanup in case any users exist from previous runs
      await db.User.destroy({ where: { email: 'test@example.com' } });
    } catch (error) {
      console.error('Error during beforeAll setup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    let retryCount = 3;
    const backoffDelay = 1000; // Delay in milliseconds between retries

    // Generate a unique email for each test run
    const uniqueEmail = `test+${Date.now()}@example.com`;

    try {
      // Ensure the database connection is active
      await db.sequelize.authenticate();
      console.log('Database connection verified in beforeEach.');

      // Attempt user creation with retry logic and a unique email
      while (retryCount > 0) {
        try {
          // Create a test user with a unique email
          user = await db.User.create({
            email: uniqueEmail,
            password: 'hashed_OldPassword123',
            firstName: 'John',
            lastName: 'Doe',
          });

          // Generate auth token for the test user
          authToken = await Authenticate.generateToken(user);
          console.log(`Test user created successfully in beforeEach with email: ${uniqueEmail}`);
          break; // Exit loop if successful

        } catch (creationError) {
          retryCount -= 1;
          console.warn(`User creation failed, retrying... (${3 - retryCount}/3)`);

          if (retryCount === 0) {
            console.error('User creation failed after 3 attempts:', creationError);
            throw creationError; // Re-throw after 3 unsuccessful attempts
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    } catch (error) {
      console.error('Error during beforeEach setup:', error);
      throw error; // Re-throw after logging the error
    }
  });


  afterEach(async () => {
    try {
      await db.User.destroy({ where: { email: 'test@example.com' } });
    } catch (error) {
      console.error('Error during user cleanup in afterEach:', error);
    }
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
    } catch (error) {
      console.error('Error closing the database connection:', error);
    }
  });

  describe('POST /api/v1/users/change-password/:id', () => {
    test('should change password when old password is correct and new passwords match', async () => {
      await jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const response = await request(app)
        .post(`/api/v1/users/change-password/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'NewPassword123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password changed successfully');

      const updatedUser = await db.User.findOne({ where: { email: 'test@example.com' } });
      expect(updatedUser.password).toMatch(/^\$2[abxy]\$.{56}$/);

      bcrypt.compare.mockRestore();
    });

    test('should not change password if the new passwords do not match', async () => {
      const response = await request(app)
        .post(`/api/v1/users/change-password/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'DifferentPassword123',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'New passwords do not match');
    });

    test('should not change password with incorrect old password', async () => {
      await jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      const response = await request(app)
        .post(`/api/v1/users/change-password/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'IncorrectPassword',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'NewPassword123',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Old password is incorrect');

      bcrypt.compare.mockRestore();
    });
  });
});
