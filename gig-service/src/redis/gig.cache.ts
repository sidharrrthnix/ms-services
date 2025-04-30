import { config } from '@gig-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Logger } from 'winston';

import { client } from './redis.connection';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigCache', 'debug');

const getUserSelectedGigCategory = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    const response: string = (await client.GET(key)) as string;
    return response;
  } catch (error) {
    log.log('error', 'GigService GigCache getUserSelectedGigCategory() method error:', error);
    return '';
  }
};

export { getUserSelectedGigCategory };
