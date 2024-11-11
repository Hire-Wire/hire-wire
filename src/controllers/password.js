import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import db from '../models/index.js';

const { User } = db;

class PasswordController {
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        console.log('New passwords do not match.');
        return res.status(400).json({ message: 'New passwords do not match' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        console.log('User not found.');
        return res.status(404).json({ message: 'User not found' });
      }

      // Check the mock in action
      console.log('Stored password:', user.password);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      console.log('Password comparison result:', isMatch);

      if (!isMatch) {
        console.log('Old password is incorrect.');
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      console.log('Password changed successfully.');
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error in changePassword:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PasswordController();
