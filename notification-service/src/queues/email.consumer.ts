import { config } from '@notification-service/config';
import { Exchange, IEmailLocals, Queue, RoutingKey, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from './connection';
import { sendEmail } from './mail.transport';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'emailConsumer', 'debug');

export async function consumeAuthEmailMessages(channel?: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = Exchange.EmailNotification;
    const routingKey = RoutingKey.AuthEmail;
    const queueName = Queue.AuthEmailQueue;

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const msQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(msQueue.queue, exchangeName, routingKey);

    log.info(`Listening for messages on queue: ${queueName}`);

    channel.consume(msQueue.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        log.warn('Received null message, ignoring...');
        return;
      }

      try {
        const data = JSON.parse(msg.content.toString());
        const { receiverEmail, username, verifyLink, resetLink, template } = data;
        const locals: IEmailLocals = {
          appLink: `${config.client.url}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          verifyLink,
          resetLink
        };

        await sendEmail(template, receiverEmail, locals);
        channel!.ack(msg);
      } catch (error) {
        log.error('Error processing message:', error);
        channel!.nack(msg, false, true);
      }
    });
  } catch (error) {
    log.error('NotificationService EmailConsumer error in consumeAuthEmailMessages():', error);
  }
}

export async function consumeOrderEmailMessages(channel?: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = Exchange.OrderNotification;
    const routingKey = RoutingKey.OrderEmail;
    const queueName = Queue.OrderEmailQueue;

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const msQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(msQueue.queue, exchangeName, routingKey);

    log.info(`Listening for messages on queue: ${queueName}`);

    channel.consume(msQueue.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        log.warn('Received null message, ignoring...');
        return;
      }

      try {
        const data = JSON.parse(msg.content.toString());
        const {
          receiverEmail,
          username,
          template,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,

          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        } = data;

        const locals: IEmailLocals = {
          appLink: `${config.client.url}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        };

        if (template === 'orderPlaced') {
          await sendEmail('orderPlaced', receiverEmail, locals);
          await sendEmail('orderReceipt', receiverEmail, locals);
        } else {
          await sendEmail(template, receiverEmail, locals);
        }

        channel!.ack(msg);
      } catch (error) {
        log.error('Error processing message:', error);
        channel!.nack(msg, false, true);
      }
    });
  } catch (error) {
    log.error('NotificationService EmailConsumer error in consumeOrderEmailMessages():', error);
  }
}
