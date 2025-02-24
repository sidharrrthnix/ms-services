import { config } from '@auth-service/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gatewayElasticSearchServer', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.elasticSearch.url}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health();
        log.info(`authService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        log.error('Connection to Elasticsearch failed. Retrying...');
        log.log('error', 'authService checkConnection() method:', error);

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();
