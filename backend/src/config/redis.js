const Redis = require('ioredis');
const config = require('./validateEnv');
const { logger } = require('../monitoring/logger');

let redisClient = null;
let subscriber = null;

const initRedis = async () => {
  const redisConfig = config.get('redis');
  
  const options = {
    host: redisConfig.host,
    port: redisConfig.port,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis connection retry ${times}, delay ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  };
  
  if (redisConfig.password) {
    options.password = redisConfig.password;
  }
  
  redisClient = new Redis(options);
  subscriber = new Redis(options);
  
  // Connection events
  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });
  
  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
  });
  
  subscriber.on('connect', () => {
    logger.info('Redis subscriber connected');
  });
  
  // Test connection
  try {
    await redisClient.ping();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
  
  return { redisClient, subscriber };
};

const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis first.');
  }
  return redisClient;
};

const getSubscriber = () => {
  if (!subscriber) {
    throw new Error('Redis subscriber not initialized. Call initRedis first.');
  }
  return subscriber;
};

// Cache helpers
const cacheGet = async (key) => {
  const data = await redisClient.get(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return null;
};

const cacheSet = async (key, value, ttl = 3600) => {
  const data = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttl) {
    await redisClient.setex(key, ttl, data);
  } else {
    await redisClient.set(key, data);
  }
};

const cacheDel = async (key) => {
  await redisClient.del(key);
};

const cacheDelPattern = async (pattern) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = {
  initRedis,
  getRedis,
  getSubscriber,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
};