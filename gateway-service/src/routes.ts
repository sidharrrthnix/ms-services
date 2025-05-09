import { Application } from 'express';

import { authRoutes } from './route/auth';
import { buyerRoutes } from './route/buyer';
import { currentUserRoutes } from './route/current-user';
import { gigRoutes } from './route/gig';
import { healthRoutes } from './route/health';
import { messageRoutes } from './route/message';
import { searchRoutes } from './route/search';
import { sellerRoutes } from './route/seller';
import { authMiddleware } from './services/auth-middleware';
const BASE_PATH = '/api/gateway/v1';
export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());
  app.use(BASE_PATH, searchRoutes.routes());

  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, gigRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, messageRoutes.routes());
};
