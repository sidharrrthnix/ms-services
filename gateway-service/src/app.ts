import express, { Express } from 'express';

import { redisConnection } from './redis/redis.connection';
import { GatewayServer } from './server';

const initialize = async (): Promise<void> => {
  const app: Express = express();
  const gatewayServer: GatewayServer = new GatewayServer();
  await gatewayServer.initialize(app);
  redisConnection.redisConnect();
};

initialize().catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});
