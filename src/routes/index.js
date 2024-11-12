import user from './user.js';
import experience from './experience.js';
import jobapplication from './jobapplication.js';
import llm from  '/llm.js'

const aggregateRoutes = (app) => {
  user(app);
  experience(app);
  jobapplication(app);
  llm(app);
};

export default aggregateRoutes;
