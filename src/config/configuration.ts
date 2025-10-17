export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',

  database: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/paramount-automation',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },

  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS === 'true',
    timeout: parseInt(process.env.PUPPETEER_TIMEOUT!, 10) || 30000,
    maxRetries: parseInt(process.env.PUPPETEER_MAX_RETRIES!!, 10) || 3,
  },

  paramount: {
    url: process.env.PARAMOUNT_URL || 'https://www.paramountplus.com',
  },
});
