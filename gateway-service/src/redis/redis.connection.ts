import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { createClient } from 'redis';
import { Logger } from 'winston';

import { config } from '../config';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gatewayRedisConnection', 'debug');

class RedisConnection {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: `${config.redis.host}` });
  }

  async redisConnect(): Promise<void> {
    try {
      await this.client.connect();
      log.info(`GatewayService Redis Connection: ${await this.client.ping()}`);
      this.cacheError();
    } catch (error) {
      log.log('error', 'GatewayService redisConnect() method error:', error);
    }
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      log.error(error);
    });
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
