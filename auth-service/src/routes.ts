import { verifyGatewayToken } from '@sidharrrthnix/ms-shared-package';
import { Application } from 'express';

import { authRoutes } from './routes/auth';
import { currentUserRoutes } from './routes/current-user';
import { healthRoutes } from './routes/health';
import { searchRoutes } from './routes/search';

const BASE_PATH = '/api/v1/auth';

export function appRoutes(app: Application): void {
  app.use('', healthRoutes());
  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, verifyGatewayToken, authRoutes());
  app.use(BASE_PATH, verifyGatewayToken, currentUserRoutes());
}
