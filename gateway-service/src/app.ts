import express, { Express } from 'express';

import { GatewayServer } from './server';

const initialize = async (): Promise<void> => {
  const app: Express = express();

  const gatewayServer = new GatewayServer();
  await gatewayServer.initialize(app);
};

initialize().catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});
