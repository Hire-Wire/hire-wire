import user from './user.js';
import experience from './experience.js';
import jobapplication from './jobapplication.js';
import password from './password.js';

const aggregateRoutes = (app) => {
  user(app);
  experience(app);
  jobapplication(app);
  password(app);

  app.use((req, res) => {
    console.log('Unmatched route:', req.method, req.url);
    res.status(404).send('Route not found');
  });
};

export default aggregateRoutes;
