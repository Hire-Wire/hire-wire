import user from './user.js';
import experience from './experience.js';

const aggregateRoutes = (app) => {
  user(app);
  experience(app);
};

export default aggregateRoutes;
