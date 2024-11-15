// src/utils/Authenticate.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class Authenticate {
  static generateToken(user) {
    const payload = { id: user.id }; // Payload includes only the user ID
    const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Secure secret key
    // const options = { expiresIn: '1h' }; // Set expiration for 1 hour
    return jwt.sign(payload, secret);
  }

  static verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export default Authenticate;
