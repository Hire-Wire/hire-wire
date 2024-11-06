//src/routes/experience.js

import passport from 'passport';
import controllers from '../controllers/index.js';

const experienceController = controllers.Experience;
const auth = passport.authenticate('jwt', { 
  session: false });

export default (app) =>
{
  app.post('/api/v1/experiences', auth, experienceController.createExperience);
  app.get('/api/v1/experiences', auth, experienceController.getUserExperiences);
  app.put('/api/v1/experiences/:id', auth, experienceController.updateExperience);
  app.delete('/api/v1/experiences/:id', auth, experienceController.deleteExperience);
};