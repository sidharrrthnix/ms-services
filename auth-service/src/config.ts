import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'CLIENT_URL',
  'RABBITMQ_ENDPOINT',
  'ELASTIC_SEARCH_URL',
  'API_GATEWAY_URL',
  'GATEWAY_JWT_TOKEN',
  'JWT_TOKEN'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const config = {
  app: {
    environment: process.env.NODE_ENV || 'development',
    enableApm: process.env.ENABLE_APM === '1'
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000'
  },

  apiGateway: {
    url: process.env.API_GATEWAY_URL,
    jwtToken: process.env.GATEWAY_JWT_TOKEN
  },

  auth: {
    jwtToken: process.env.JWT_TOKEN
  },

  rabbitmq: {
    endpoint: process.env.RABBITMQ_ENDPOINT!
  },

  mysql: {
    database: process.env.MYSQL_DB || ''
  },

  cloudinary: {
    name: process.env.CLOUD_NAME || '',
    apiKey: process.env.CLOUD_API_KEY || '',
    apiSecret: process.env.CLOUD_API_SECRET || ''
  },

  elasticSearch: {
    url: process.env.ELASTIC_SEARCH_URL!
  },

  apm: {
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || '',
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || ''
  },

  email: {
    senderEmail: process.env.SENDER_EMAIL || '',
    senderEmailPassword: process.env.SENDER_EMAIL_PASSWORD || ''
  }
};

if (config.app.environment !== 'production') {
  console.log('Loaded Configuration');
}
