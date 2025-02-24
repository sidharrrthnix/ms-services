import { config } from '@auth-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Sequelize } from 'sequelize';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'authDatabaseServer', 'debug');

export const sequelize: Sequelize = new Sequelize(process.env.MYSQL_DB!, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function databaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    log.info('AuthService MySQL database connection has been established successfully.');
  } catch (error) {
    log.error('AuthService - Unable to connect to database:', error);
  }
}
