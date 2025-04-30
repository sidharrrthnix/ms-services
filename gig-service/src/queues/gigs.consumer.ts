import { config } from '@gig-service/config';
import { createConnection } from '@gig-service/queues/connection';
import { seedData, updateGigReview } from '@gig-service/services/gig.service';
import { Exchange, Queue, RoutingKey, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigServiceConsumer', 'debug');

const consumeGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = Exchange.UpdateGig;
    const routingKey = RoutingKey.UpdateGig;
    const queueName = Queue.GigUpdateQueue;
    await channel.assertExchange(exchangeName, 'direct');
    const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const { gigReview } = JSON.parse(msg!.content.toString());
      await updateGigReview(JSON.parse(gigReview));
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeGigDirectMessage() method error:', error);
  }
};

const consumeSeedDirectMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = Exchange.SeedGig;
    const routingKey = RoutingKey.ReceiveSellers;
    const queueName = Queue.SeedGigQueue;
    await channel.assertExchange(exchangeName, 'direct');
    const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const { sellers, count } = JSON.parse(msg!.content.toString());
      await seedData(sellers, count);
      log.info('GigService GigConsumer consumeSeedDirectMessages() method seeding data:', { sellers, count });
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeGigDirectMessage() method error:', error);
  }
};

export { consumeGigDirectMessage, consumeSeedDirectMessages };
