import { Application } from 'express';

import { gigRoutes } from './routes/gig';
import { healthRoutes } from './routes/health';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, gigRoutes());
};

export { appRoutes };
