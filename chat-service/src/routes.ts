import { verifyGatewayToken } from '@sidharrrthnix/ms-shared-package';
import { Application } from 'express';

import { healthRoutes } from './routes/health';
import { messageRoutes } from './routes/message';

const BASE_PATH = '/api/v1/chat';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayToken, messageRoutes());
};

export { appRoutes };
