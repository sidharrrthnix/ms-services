import { config } from '@gig-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = WinstonLogger(` ${config.elasticSearch.url}`, 'gigRedisConnection', 'debug');
const client: RedisClient = createClient({ url: `${config.redis.host}` });

const redisConnect = async (): Promise<void> => {
  try {
    await client.connect();
    log.info(`GigService Redis Connection: ${await client.ping()}`);
    cacheError();
  } catch (error) {
    log.log('error', 'GigService redisConnect() method error:', error);
  }
};

const cacheError = (): void => {
  client.on('error', (error: unknown) => {
    log.error(error);
  });
};

export { client, redisConnect };
