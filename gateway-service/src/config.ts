import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'CLIENT_URL',
  'GATEWAY_JWT_TOKEN',
  'JWT_TOKEN',
  'SECRET_KEY_ONE',
  'SECRET_KEY_TWO',
  'AUTH_BASE_URL',
  'REDIS_HOST',
  'ELASTIC_SEARCH_URL'
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

  auth: {
    jwtToken: process.env.JWT_TOKEN,
    gatewayToken: process.env.GATEWAY_JWT_TOKEN,
    secretKeyOne: process.env.SECRET_KEY_ONE,
    secretKeyTwo: process.env.SECRET_KEY_TWO
  },

  services: {
    auth: process.env.AUTH_BASE_URL,
    users: process.env.USERS_BASE_URL,
    gigs: process.env.GIG_BASE_URL,
    messages: process.env.MESSAGE_BASE_URL,
    orders: process.env.ORDER_BASE_URL,
    reviews: process.env.REVIEW_BASE_URL
  },

  redis: {
    host: process.env.REDIS_HOST
  },

  rabbitmq: {
    endpoint: process.env.RABBITMQ_ENDPOINT!
  },

  elasticSearch: {
    url: process.env.ELASTIC_SEARCH_URL!
  },

  apm: {
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || '',
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || ''
  },

  apiGateway: {
    url: process.env.API_GATEWAY_URL || 'http://localhost:4000'
  }
};
