// src/routes/jobapplication.js
import passport from 'passport';
import controllers from '../controllers/index.js';

const jobApplicationController = controllers.JobApplication;
const auth = passport.authenticate('jwt', {
  session: false,
});

export default (app) =>
{
  app.post('/api/v1/jobapplication', auth, jobApplicationController.createJobApplication);
  app.delete('/api/v1/jobapplication/:id', auth, jobApplicationController.deleteJobApplication);
};

// TODO: write jobApplicationController.createJobApplication()
// TODO: write jobApplicationController.deleteJobApplication()
