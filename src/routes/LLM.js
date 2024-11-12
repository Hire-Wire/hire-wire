// src/routes/jobapplication.js
import passport from 'passport';
import llmcontroller from '../controllers/LLMController.js';

const auth = passport.authenticate('jwt', { session: false });

export default (app) => {
  // Route to generate content for a particular job application ID
  app.post('/api/v1/job-application/generate-content', auth, llmcontroller.generateContent);
};
