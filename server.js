/* eslint-disable no-unused-vars */

import 'colors'; // Optional for colored logs
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import passportConfig from './src/config/passport.js';
import routes from './src/routes/index.js'; // Adjust route import if needed

// Configure dotenv
dotenv.config();

// Set up the express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware Setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true,
}));

// Initialize passport
passportConfig(passport);
app.use(passport.initialize());

// Parse incoming requests data
app.use(json());
app.use(urlencoded({ extended: false }));

// Routes
routes(app); // Assuming routes is a function that takes `app` as an argument

// Global Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
  console.error(err.stack.red);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 Handling Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(middleware.route);
  }
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`.green);
  });
}

export default app;
