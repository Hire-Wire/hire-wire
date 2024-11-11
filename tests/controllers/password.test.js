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

      // Confirm the Users table exists
      await db.sequelize.query("SHOW TABLES LIKE 'Users';");
    } catch (error) {
      console.error('Error during beforeAll setup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      await db.sequelize.authenticate(); // Ensure the connection is live
      await db.User.destroy({ where: { email: 'test@example.com' } });

      let retryCount = 3;
      while (retryCount > 0) {
        try {
          user = await db.User.create({
            email: 'test@example.com',
            password: 'hashed_OldPassword123',
            firstName: 'John',
            lastName: 'Doe',
          });
          break; // Break out if creation is successful
        } catch (error) {
          retryCount -= 1;
          if (retryCount === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
        }
      }

      authToken = await Authenticate.generateToken(user);
    } catch (error) {
      console.error('Error during user creation in beforeEach:', error);
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
