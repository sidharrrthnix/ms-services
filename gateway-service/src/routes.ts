import { Application } from 'express';

import { authRoutes } from './route/auth';
import { currentUserRoutes } from './route/current-user';
import { healthRoutes } from './route/health';
import { authMiddleware } from './services/auth-middleware';

const BASE_PATH = '/api/v1/auth';

export function appRoutes(app: Application): void {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());

  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
}
