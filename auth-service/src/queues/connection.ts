import { config } from '@auth-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel, Connection, connect } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'notificationQueueConnection', 'debug');

let connection: Connection | null = null;
let channel: Channel | null = null;

async function createConnection(retries = 5, delay = 5000): Promise<Channel | undefined> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log.info(`Attempt ${attempt}/${retries} - Connecting to RabbitMQ...`);

      connection = await connect(config.rabbitmq.endpoint);
      channel = await connection.createChannel();
      log.info('✅ Notification server connected to RabbitMQ queue successfully!');

      connection.on('close', async () => {
        log.warn('RabbitMQ connection closed. Reconnecting...');
        await reconnect();
      });

      connection.on('error', async (err) => {
        log.error('RabbitMQ connection error:', err);
        await reconnect();
      });

      return channel;
    } catch (error) {
      log.error(`❌ RabbitMQ Connection Failed (Attempt ${attempt}):`, error);
      if (attempt < retries) {
        log.info(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        log.error('❌ Maximum retries reached. Failed to connect to RabbitMQ.');
      }
    }
  }
  return undefined;
}

async function reconnect(): Promise<void> {
  if (connection) {
    await connection.close();
  }
  channel = null;
  connection = null;
  await createConnection();
}

async function closeConnection(): Promise<void> {
  process.once('SIGINT', async () => {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    log.info('RabbitMQ connection closed gracefully.');
    process.exit(0);
  });
}

export { closeConnection, createConnection };
