import { config } from '@gig-service/config';
import { createConnection } from '@gig-service/queues/connection';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigServiceProducer', 'debug');

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
    log.log('error', 'GigService Provider publishDirectMessage() method error:', error);
  }
}
