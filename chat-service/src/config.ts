import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'GATEWAY_JWT_TOKEN',
  'JWT_TOKEN',
  'API_GATEWAY_URL',
  'CLIENT_URL',
  'RABBITMQ_ENDPOINT',
  'CLOUD_NAME',
  'CLOUD_API_KEY',
  'CLOUD_API_SECRET',
  'ELASTIC_SEARCH_URL',
  'ELASTIC_APM_SERVER_URL'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const config = {
  app: {
    environment: process.env.NODE_ENV as string,
    enableApm: process.env.ENABLE_APM === '1'
  },
  database: {
    url: process.env.DATABASE_URL as string
  },
  gateway: {
    url: process.env.API_GATEWAY_URL as string,
    jwtToken: process.env.GATEWAY_JWT_TOKEN as string
  },
  client: {
    url: process.env.CLIENT_URL as string
  },
  rabbitmq: {
    endpoint: process.env.RABBITMQ_ENDPOINT as string
  },
  auth: {
    jwtToken: process.env.JWT_TOKEN as string
  },
  cloudinary: {
    name: process.env.CLOUD_NAME as string,
    apiKey: process.env.CLOUD_API_KEY as string,
    apiSecret: process.env.CLOUD_API_SECRET as string
  },
  elasticSearch: {
    url: process.env.ELASTIC_SEARCH_URL as string
  },
  apm: {
    serverUrl: process.env.ELASTIC_APM_SERVER_URL as string,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || ''
  }
};

if (config.app.environment !== 'production') {
  console.log('Loaded Users Service Configuration');
}
