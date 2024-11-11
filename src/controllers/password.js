import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import db from '../models/index.js';

const { User } = db;

class PasswordController {
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check the mock in action
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PasswordController();
