import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { config } from '@user-service/config';
import { createConnection } from '@user-service/queues/connection';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'userServiceProducer', 'debug');

export async function publishDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    log.info(logMessage);
  } catch (error) {
    log.log('error', 'UserService Provider publishDirectMessage() method error:', error);
  }
}
