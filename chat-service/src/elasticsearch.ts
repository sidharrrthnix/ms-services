import { config } from '@chat-service/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gigElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${config.elasticSearch.url}`
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    log.info('ChatService connecting to ElasticSearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`ChatService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'ChatService checkConnection() method:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export { checkConnection, elasticSearchClient };
