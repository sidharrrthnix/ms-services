import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { ISellerGig, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { config } from '@user-service/config';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'userElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${config.elasticSearch.url}`
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    log.info('UserService connecting to ElasticSearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`UserService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'UserService checkConnection() method:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function checkIfIndexExist(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfIndexExist(indexName);
    if (result) {
      log.info(`Index "${indexName}" already exist.`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error(`An error occurred while creating the index ${indexName}`);
    log.log('error', 'UserService createIndex() method error:', error);
  }
}

async function getDocumentById(index: string, gigId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: gigId
    });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'UserService getDocumentById() method error:', error);
    return {} as ISellerGig;
  }
}

export { checkConnection, createIndex, elasticSearchClient, getDocumentById };
