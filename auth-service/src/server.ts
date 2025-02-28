import { config } from '@auth-service/config';
import { CustomError, IAuthPayload, IErrorResponse, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import cors from 'cors';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import hpp from 'hpp';
import { verify } from 'jsonwebtoken';
import { Logger } from 'winston';

import http from 'http';

import { Channel } from 'amqplib';
import compression from 'compression';

import { checkConnection, createIndex } from './elasticsearch';
import { closeConnection, createConnection } from './queues/connection';
import { appRoutes } from './routes';

const SERVER_PORT = 4002;

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'authServer', 'debug');
export let channel: Channel;

export function start(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application): void {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.apiGateway.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const payload: IAuthPayload = verify(token, config.auth.jwtToken!) as IAuthPayload;
        req.currentUser = payload;
      } catch (err) {
        log.error('Token verification failed', err);
      }
    }
    next();
  });
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}
function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function startElasticSearch(): void {
  checkConnection();
  createIndex('gigs');
}
async function startQueues(): Promise<void> {
  log.info('Starting queues...');
  channel = (await createConnection()) as Channel;
}

function authErrorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `AuthService ${error.comingFrom}:`, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = http.createServer(app);
    log.info(`Process ID ${process.pid} on notification server has started`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Auth server running on port ${SERVER_PORT}`);
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
