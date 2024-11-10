// src/routes/jobapplication.js

import passport from 'passport';
import controllers from '../controllers/index.js';

const jobApplicationController = controllers.JobApplication;
const auth = passport.authenticate('jwt', { session: false });

export default (app) => {
  app.post('/api/v1/job-application', auth, jobApplicationController.createJobApplication);
  app.post('/api/v1/test-job-application', jobApplicationController.createJobApplication);
  app.get('/api/v1/job-application/:jobApplicationID', auth, jobApplicationController.getJobApplication);
  app.post('/api/v1/job-application/:jobApplicationID/documents', auth, jobApplicationController.addDocument);
  app.get('/api/v1/documents/:documentID', auth, jobApplicationController.getDocumentByID);
  app.delete('/api/v1/job-application/:jobApplicationID', auth, jobApplicationController.deleteJobApplication);
};
