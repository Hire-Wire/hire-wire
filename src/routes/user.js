// src/routes/user.js
import passport from 'passport';
import controllers from '../controllers/index.js';

const userController = controllers.User;
const auth = passport.authenticate('jwt', {
  session: false,
});

export default (app) => {
  app.post('/api/v1/users/register', userController.create); // Register new user
  app.post('/api/v1/users/login', userController.login); // Login user
  app.post('/api/v1/users/logout', userController.logout); // Logout user
  app.get('/api/v1/users/:id', auth, userController.view); // View own profile
  app.put('/api/v1/users/:id', auth, userController.update); // Update own profile
  app.delete('/api/v1/users/:id', auth, userController.remove); // Delete own profile
};
