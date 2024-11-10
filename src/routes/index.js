import user from './user.js';
import experience from './experience.js';
import jobapplication from './jobapplication.js';

const aggregateRoutes = (app) => {
  user(app);
  experience(app);
  jobapplication(app);
};

export default aggregateRoutes;
