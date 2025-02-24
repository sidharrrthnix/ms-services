import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import express, { Express } from 'express';
import { Logger } from 'winston';
import { config } from './config';
import { start } from './server';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'notificationApp', 'debug');

function initialize() {
  const app: Express = express();
  start(app);
  log.info('Notification Service Initialized');
}
initialize();
