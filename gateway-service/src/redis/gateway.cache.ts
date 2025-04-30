import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { createClient } from 'redis';
import { Logger } from 'winston';

import { config } from '../config';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gatewayCache', 'debug');

export class GatewayCache {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: `${config.redis.host}` });
  }

  public async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.SET(key, value);
    } catch (error) {
      log.log('error', 'GatewayService Cache saveUserSelectedCategory() method error:', error);
    }
  }

  public async saveLoggedInUserToCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const index: number | null = await this.client.LPOS(key, value);
      if (index === null) {
        await this.client.LPUSH(key, value);
        log.info(`User ${value} added`);
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache saveLoggedInUserToCache() method error:', error);
      return [];
    }
  }

  public async getLoggedInUsersFromCache(key: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache getLoggedInUsersFromCache() method error:', error);
      return [];
    }
  }

  public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
      log.info(`User ${value} removed`);
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache removeLoggedInUserFromCache() method error:', error);
      return [];
    }
  }
}
