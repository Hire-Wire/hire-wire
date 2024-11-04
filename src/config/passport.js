// src/config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import db from '../models/index.js'; // Adjust this path based on your project structure

const passportConfig = (passport) => {
  // Define options for JWT strategy
  const { User } = db;
  const options = {
  // Extract token from Authorization header
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

    // Use environment variable or fallback to default
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
  };

  // Configure the JWT strategy
  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
      // Find the user by ID (assuming jwt_payload contains user ID)
        const user = await User.findByPk(jwtPayload.id);
        if (user) {
          return done(null, user); // If user found, pass it to request
        }
        // If no user, authentication fails
        return done(null, false);
      } catch (error) {
        return done(error, false); // If error, fail the request
      }
    })
  );
};

export default passportConfig;
