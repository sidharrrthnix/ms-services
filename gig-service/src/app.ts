import express, { Express } from 'express';

import { databaseConnection } from './database';
import { redisConnect } from './redis/redis.connection';
import { start } from './server';

const initialize = async (): Promise<void> => {
  const app: Express = express();
  databaseConnection();
  redisConnect();
  await start(app);
};

initialize().catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});
