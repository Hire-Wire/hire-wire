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
  hash: jest.fn(async plainText => `hashed_${plainText}`),
}));

let authToken;
let user;

describe('PasswordController', () => {
  beforeAll(async () => {
    try {
      // Authenticate the database connection
      await db.sequelize.authenticate();

      // Set up Umzug for handling migrations
      const umzug = new Umzug({
        migrations: { glob: 'src/migrations/*.js' },
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        context: db.sequelize.getQueryInterface(),
      });

      // Roll back all migrations and reapply them to ensure a clean state
      await umzug.down({ to: 0 });
      await umzug.up();
    } catch (error) {
      console.error('Error during beforeAll setup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      await db.User.destroy({ where: { email: 'test@example.com' } });

      // Set up a user with a mock hashed password
      user = await db.User.create({
        email: 'test@example.com',
        password: 'hashed_OldPassword123', // This simulates the hashed password
        firstName: 'John',
        lastName: 'Doe',
      });

      authToken = await Authenticate.generateToken(user);
    } catch (error) {
      console.error('Error in beforeEach user setup:', error);
      throw error;
    }
  });

  afterEach(async () => {
    await db.User.destroy({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/v1/users/change-password/:id', () => {
    test('should change password when old password is correct and new passwords match', async () => {
      // Spy on bcrypt.compare to return true for the correct old password
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

      // Check if the password has been updated and is hashed
      const updatedUser = await db.User.findOne({ where: { email: 'test@example.com' } });
      expect(updatedUser.password).toMatch(/^\$2[abxy]\$.{56}$/); // Check if it's a bcrypt hash

      await bcrypt.compare.mockRestore(); // Restore bcrypt.compare after the test
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
      // Spy on bcrypt.compare to return false for this test
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

      await bcrypt.compare.mockRestore(); // Restore bcrypt.compare after the test
    });
  });
});
