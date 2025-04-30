import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import mongoose from 'mongoose';
import { Logger } from 'winston';

import { config } from './config';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigsDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.database.url}`);
    log.info('Gigs service successfully connected to database.');
  } catch (error) {
    log.error('GigsService databaseConnection() method error:', error);
    throw error;
  }
};

const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    log.info('Gigs service disconnected from database.');
  } catch (error) {
    log.error('Error during disconnecting database:', error);
    throw error;
  }
};

// Mongoose connection event listeners
mongoose.connection.on('connected', () => {
  log.info('Mongoose default connection is open.');
});

mongoose.connection.on('error', (err) => {
  log.error('Mongoose default connection has occurred an error:', err);
});

mongoose.connection.on('disconnected', () => {
  log.warn('Mongoose default connection is disconnected.');
});

export { databaseConnection, disconnectDatabase };
