import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

import { config } from '../config';

import { createConnection } from './connection';
const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'chatServiceProducer', 'debug');

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
    log.log('error', 'ChatService Provider publishDirectMessage() method error:', error);
  }
}
