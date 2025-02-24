import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel } from 'amqplib';
import { Application } from 'express';
import http from 'http';
import { Logger } from 'winston';
import { config } from './config';
import { checkConnection } from './elasticsearch';
import { closeConnection, createConnection } from './queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from './queues/email.consumer';
import { healthRoutes } from './routes';

const SERVER_PORT = 4001;
const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = http.createServer(app);
    log.info(`Process ID ${process.pid} on notification server has started`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });

    httpServer.on('error', (error) => {
      log.error('HTTP Server Error:', error);
    });

    process.on('SIGINT', async () => {
      log.info('SIGINT received. Shutting down server gracefully...');
      await shutdownServer(httpServer);
    });

    process.on('SIGTERM', async () => {
      log.info('SIGTERM received. Shutting down server gracefully...');
      await shutdownServer(httpServer);
    });
  } catch (e) {
    log.error('Error starting Notification Server', e);
  }
}

async function shutdownServer(httpServer: http.Server): Promise<void> {
  try {
    log.info('Closing HTTP server...');
    httpServer.close(() => {
      log.info('HTTP server closed.');
    });

    await closeConnection();

    log.info('Shutdown complete. Exiting process...');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown:', error);
    process.exit(1);
  }
}
