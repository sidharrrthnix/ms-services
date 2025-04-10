import { verifyGatewayToken } from '@sidharrrthnix/ms-shared-package';
import { Application } from 'express';

import { buyerRoutes } from './routes/buyer';
import { healthRoutes } from './routes/health';
import { sellerRoutes } from './routes/seller';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BUYER_BASE_PATH, verifyGatewayToken, buyerRoutes());
  app.use(SELLER_BASE_PATH, verifyGatewayToken, sellerRoutes());
};

export { appRoutes };
