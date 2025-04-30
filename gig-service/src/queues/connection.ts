import { config } from '@gig-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import client, { Channel, ChannelModel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigQueueConnection', 'debug');

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

async function createConnection(retries = 5, delay = 5000): Promise<Channel> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log.info(`Attempt ${attempt}/${retries} - Connecting to RabbitMQ...`);

      connection = await client.connect(config.rabbitmq.endpoint);
      if (!connection) {
        throw new Error('Failed to establish connection');
      }

      channel = await connection.createChannel();
      if (!channel) {
        throw new Error('Failed to create channel');
      }

      log.info('✅ Gig server connected to RabbitMQ queue successfully!');

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
        throw new Error('Failed to connect to RabbitMQ');
      }
    }
  }
  throw new Error('Failed to establish connection');
}

async function reconnect(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (error) {
    log.error('Error during connection cleanup:', error);
  } finally {
    channel = null;
    connection = null;
  }

  try {
    await createConnection();
  } catch (error) {
    log.error('Failed to reconnect:', error);
    throw error;
  }
}

async function closeConnection(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    log.info('RabbitMQ connection closed gracefully.');
  } catch (error) {
    log.error('Error closing RabbitMQ connection:', error);
    throw error;
  }
}

// Handle process termination
process.once('SIGINT', async () => {
  try {
    await closeConnection();
  } finally {
    process.exit(0);
  }
});

process.once('SIGTERM', async () => {
  try {
    await closeConnection();
  } finally {
    process.exit(0);
  }
});

export { closeConnection, createConnection };
