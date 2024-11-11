import passport from 'passport';
import controllers from '../controllers/index.js';

const passwordController = controllers.Password;
const auth = passport.authenticate('jwt', { session: false });

export default (app) => {
  app.post('/api/v1/users/change-password/:id', auth, passwordController.changePassword);
};
