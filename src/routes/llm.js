// src/routes/jobapplication.js
import passport from 'passport';
import controllers from '../controllers/index.js';
import LLMController from "../controllers/LLMController.js";

const jobApplicationController = controllers.JobApplication;
const auth = passport.authenticate('jwt', { session: false });

export default (app) => {
  // Route to generate content for a particular job application ID
  app.post('/api/v1/job-application/:id/generate-content', auth, LLMController.generateContent);
};
