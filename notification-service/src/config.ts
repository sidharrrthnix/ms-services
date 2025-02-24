import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['NODE_ENV', 'CLIENT_URL', 'RABBITMQ_ENDPOINT', 'ELASTIC_SEARCH_URL'];

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

  rabbitmq: {
    endpoint: process.env.RABBITMQ_ENDPOINT!
  },

  email: {
    senderEmail: process.env.SENDER_EMAIL || '',
    senderEmailPassword: process.env.SENDER_EMAIL_PASSWORD || ''
  },

  elasticSearch: {
    url: process.env.ELASTIC_SEARCH_URL!
  },

  apm: {
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || '',
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || ''
  }
};

if (config.app.environment !== 'production') {
  console.log('Loaded Configuration');
}
