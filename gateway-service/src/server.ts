import http from 'http';

import { CustomError, IErrorResponse, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { isAxiosError } from 'axios';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';
import { Logger } from 'winston';

import { config } from './config';
import { elasticSearch } from './elasticsearch';
import { appRoutes } from './routes';
import { axiosAuthInstance } from './services/api/auth.service';

export let socketIO: Server;

export class GatewayServer {
  private readonly SERVER_PORT = 4000;
  private readonly log: Logger;
  private httpServer: http.Server | undefined;

  constructor() {
    this.log = WinstonLogger(`${config.elasticSearch.url}`, 'gatewayServer', 'debug');
  }

  public async initialize(app: Application): Promise<void> {
    try {
      this.securityMiddleware(app);
      this.standardMiddleware(app);
      this.routesMiddleware(app);
      this.errorHandler(app);
      await this.startServer(app);
      this.startElasticSearch();
      this.setupGracefulShutdown();
    } catch (error) {
      this.log.error('Failed to initialize gateway server:', error);
      throw error;
    }
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.auth.secretKeyOne}`, `${config.auth.secretKeyTwo}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.app.environment !== 'development',
        ...(config.app.environment !== 'development' && {
          sameSite: 'none'
        })
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.client.url,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
      }
      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startElasticSearch(): void {
    try {
      elasticSearch.checkConnection();
      this.log.info('ElasticSearch connection established');
    } catch (error) {
      this.log.error('Failed to connect to ElasticSearch:', error);
      throw error;
    }
  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.log.log('error', `${fullUrl} endpoint does not exist.`);
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.' });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        this.log.log('error', `GatewayService ${error.comingFrom}:`, error);
        res.status(error.statusCode).json(error.serializeErrors());
      }

      if (isAxiosError(error)) {
        this.log.log('error', `GatewayService Axios Error - ${error?.response?.data?.comingFrom}:`, error);
        res
          .status(error?.response?.data?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: error?.response?.data?.message ?? 'Error occurred.' });
      }

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer = http.createServer(app);
        this.log.info(`Process ID ${process.pid} on gateway server has started`);

        socketIO = new Server(this.httpServer, {
          cors: {
            origin: config.client.url,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          }
        });

        this.httpServer.listen(this.SERVER_PORT, () => {
          this.log.info(`Gateway server running on port ${this.SERVER_PORT}`);
          resolve();
        });

        this.httpServer.on('error', (error) => {
          this.log.error('HTTP Server Error:', error);
          reject(error);
        });
      } catch (error) {
        this.log.error('Error starting Gateway Server', error);
        reject(error);
      }
    });
  }

  private setupGracefulShutdown(): void {
    const shutdownHandler = async (signal: string) => {
      this.log.info(`${signal} received. Shutting down server gracefully...`);
      await this.shutdown();
    };

    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
  }

  private async shutdown(): Promise<void> {
    try {
      if (this.httpServer) {
        await new Promise<void>((resolve) => {
          this.log.info('Closing HTTP server...');
          this.httpServer!.close(() => {
            this.log.info('HTTP server closed.');
            resolve();
          });
        });
      }

      this.log.info('Queue connections closed.');

      this.log.info('Shutdown complete. Exiting process...');
      process.exit(0);
    } catch (error) {
      this.log.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}
