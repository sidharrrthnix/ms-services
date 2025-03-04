import express, { Express } from 'express';

import { start } from './server';

const initialize = async (): Promise<void> => {
  const app: Express = express();

  await start(app);
};

initialize().catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});
