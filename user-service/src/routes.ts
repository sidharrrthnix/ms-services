import { verifyGatewayToken } from '@sidharrrthnix/ms-shared-package';
import { Application } from 'express';

import { healthRoutes } from './routes/health';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BUYER_BASE_PATH, verifyGatewayToken, (_req, res) => {
    res.send('Buyer service');
  });
  app.use(SELLER_BASE_PATH, verifyGatewayToken, (_req, res) => {
    res.send('Seller service');
  });
};

export { appRoutes };
