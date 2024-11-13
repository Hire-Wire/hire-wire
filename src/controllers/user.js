/* eslint-disable class-methods-use-this */
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import db from '../models/index.js';
import Authenticate from '../utils/Authenticate.js';

const { User } = db;

class UserController {
  async create(req, res) {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if the email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Create new user
      const user = await User.create({ email, password, firstName, lastName });

      // Generate JWT token
      const token = Authenticate.generateToken(user);

      // Return success response with token
      return res.status(201).json({
        message: 'Signup successful',
        userData: user.filterDetails(),
        token,
      });
    } catch (error) {
      return res.status(500)
        .json({ message: "We're sorry, we couldn't sign you up", error: error.message });
    }
  }

  async login(req, res) {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User does not exist' });
      }

      // Verify the password
      const passwordMatch = await user.validatePassword(password);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Wrong password, please try again' });
      }

      // Generate JWT token
      const token = Authenticate.generateToken(user);

      // Return success response
      return res.status(200).json({
        message: 'Login successful',
        userData: user.filterDetails(),
        token,
      });
    } catch (error) {
      return res.status(500)
        .json({ message: "We're sorry, we couldn't log you in", error: error.message });
    }
  }

  logout(req, res) {
    res.json({ message: 'Logout successful' });
  }

  async view(req, res) {
    try {
      if (req.user.id !== parseInt(req.params.id, 10)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user.filterDetails());
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = parseInt(req.params.id, 10);

      // Check that user is updating their own profile
      if (isNaN(userId) || req.user.id !== userId) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if old password is correct if updating password
      if (req.body.oldPassword) {
        const passwordMatch = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (!passwordMatch) {
          return res.status(400).json({ message: 'Old password is incorrect' });
        }
        if (req.body.oldPassword === req.body.password) {
          return res.status(400)
            .json({ message: 'New password must be different from the old password' });
        }
      }

      // Check if email already exists in the system
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
          return res.status(409).json({ message: 'Email already exists' });
        }
      }

      // Update the user's information
      const updatedUser = await user.update(req.body);

      // Generate a new token if email or password is changed
      const token = Authenticate.generateToken(user);

      // Return updated user data without sensitive info
      return res.status(200).json({
        message: 'User information has been updated',
        updatedUser: updatedUser.filterDetails(),
        token,
      });
    } catch (error) {
      return res.status(500).json({
        message: "We're sorry, there was an error, please try again",
        error: error.message,
      });
    }
  }

  async remove(req, res) {
    try {
      if (req.user.id !== parseInt(req.params.id, 10)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await user.destroy();
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();
