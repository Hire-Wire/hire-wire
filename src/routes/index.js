import logger from '../../logger.js';

const aggregateRoutes = (app) => {
  app.get('/', (req, res) =>{
    logger.info('Accessing the home route');
    res.send('Hello from our server');
  });
};

export default aggregateRoutes;
