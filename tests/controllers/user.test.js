/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../server.js';
import db from '../../src/models/index.js';
import Authenticate from '../../src/utils/Authenticate.js';

jest.mock('../../src/models/index.js');
jest.mock('../../src/utils/Authenticate.js');

const { User } = db;

describe('UserController', () => {
  let authToken;
  // eslint-disable-next-line no-unused-vars
  let userId;

  const testUser = {
    id: 1,
    email: 'testuser@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(() => {
    authToken = Authenticate.generateToken(testUser);
    Authenticate.generateToken = jest.fn(() => authToken);
    User.findOne = jest.fn();
    User.create = jest.fn();
    User.findByPk = jest.fn();
    User.prototype.update = jest.fn();
    User.prototype.destroy = jest.fn();
    User.prototype.validatePassword = jest.fn();
    User.prototype.filterDetails = jest.fn(function() {
      // eslint-disable-next-line no-invalid-this
      const { password, ...rest } = this;
      return rest;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/users/register', () => {
    it('should create a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        ...testUser,
        id: 1,
        filterDetails: User.prototype.filterDetails,
      });

      const res = await request(app).post('/api/v1/users/register').send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Signup successful');
      expect(res.body).toHaveProperty('userData');
      expect(res.body.userData).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('token', authToken);

      authToken = res.body.token;
      userId = res.body.userData.id;
    });

    it('should not create a user with an existing email', async () => {
      User.findOne.mockResolvedValue({ email: testUser.email });

      const res = await request(app).post('/api/v1/users/register').send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login an existing user', async () => {
      User.findOne.mockResolvedValue({
        ...testUser,
        id: 1,
        validatePassword: User.prototype.validatePassword.mockResolvedValue(true),
        filterDetails: User.prototype.filterDetails,
      });

      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('userData');
      expect(res.body.userData).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('token', authToken);
    });

    it('should not login with incorrect password', async () => {
      User.findOne.mockResolvedValue({
        ...testUser,
        validatePassword: User.prototype.validatePassword.mockResolvedValue(false),
      });

      const res = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: 'WrongPassword',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Wrong password, please try again');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user details', async () => {
      User.findByPk.mockResolvedValue({
        ...testUser,
        id: 1,
        filterDetails: User.prototype.filterDetails,
      });

      const res = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('should deny access without proper authentication', async () => {
      const res = await request(app).get('/api/v1/users/1');

      expect(res.statusCode).toBe(401); // No token provided
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user information', async () => {
      User.findByPk.mockResolvedValue({
        ...testUser,
        id: 1,
        update: User.prototype.update.mockResolvedValue({
          ...testUser,
          firstName: 'UpdatedName',
          filterDetails: User.prototype.filterDetails,
        }),
        filterDetails: User.prototype.filterDetails,
      });

      const res = await request(app)
        .put('/api/v1/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'UpdatedName' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'User information has been updated');
      expect(res.body.updatedUser).toHaveProperty('firstName', 'UpdatedName');
    });

    it('should not update with incorrect old password', async () => {
      User.findByPk.mockResolvedValue({
        ...testUser,
        id: 1,
        password: 'hashedpassword',
      });

      bcrypt.compareSync = jest.fn(() => false);

      const res = await request(app)
        .put('/api/v1/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'IncorrectOldPassword',
          password: 'NewPassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Old password is incorrect');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      User.findByPk.mockResolvedValue({
        ...testUser,
        id: 1,
        destroy: User.prototype.destroy.mockResolvedValue(),
      });

      const res = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'User deleted successfully');
    });
  });
});
