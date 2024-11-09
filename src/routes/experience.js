import passport from 'passport';
import controllers from '../controllers/index.js';

const experienceController = controllers.Experience;
const auth = passport.authenticate('jwt', { session: false });

export default (app) => {
  // Create a new experience
  app.post('/api/v1/experiences', auth, experienceController.create);

  // Get all experiences for a user
  app.get('/api/v1/experiences', auth, experienceController.getAll);

  // Update a specific experience by ID
  app.put('/api/v1/experiences/:id', auth, experienceController.update);

  // Delete a specific experience by ID (handles both Education and Employment experiences)
  app.delete('/api/v1/experiences/:experienceId', auth, experienceController.remove);
};
