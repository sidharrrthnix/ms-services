import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@notification-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'notificationElasticSearchServer', 'debug');

const elastiSeachClient = new Client({
  node: `${config.elasticSearch.url}`
});

export async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elastiSeachClient.cluster.health();
      log.info(`NotificationService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'NotificationService checkConnection() method:', error);

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
