const { getRedis, getSubscriber, cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../config/redis');
const { logger } = require('../monitoring/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.subscriber = null;
  }
  
  async initialize() {
    this.client = getRedis();
    this.subscriber = getSubscriber();
    logger.info('Redis service initialized');
  }
  
  async get(key) {
    return cacheGet(key);
  }
  
  async set(key, value, ttl = 3600) {
    return cacheSet(key, value, ttl);
  }
  
  async del(key) {
    return cacheDel(key);
  }
  
  async delPattern(pattern) {
    return cacheDelPattern(pattern);
  }
  
  async increment(key) {
    return this.client.incr(key);
  }
  
  async decrement(key) {
    return this.client.decr(key);
  }
  
  async sadd(key, ...members) {
    return this.client.sadd(key, ...members);
  }
  
  async srem(key, ...members) {
    return this.client.srem(key, ...members);
  }
  
  async smembers(key) {
    return this.client.smembers(key);
  }
  
  async zadd(key, score, member) {
    return this.client.zadd(key, score, member);
  }
  
  async zrange(key, start, stop, withScores = false) {
    if (withScores) {
      return this.client.zrange(key, start, stop, 'WITHSCORES');
    }
    return this.client.zrange(key, start, stop);
  }
  
  async publish(channel, message) {
    return this.client.publish(channel, JSON.stringify(message));
  }
  
  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          callback(message);
        }
      }
    });
  }
  
  async getActiveUsers() {
    return this.client.scard('active_users');
  }
  
  async trackUserActivity(userId) {
    await this.client.sadd('active_users', userId);
    await this.client.expire('active_users', 300); // 5 minutes
  }
  
  async removeUserActivity(userId) {
    await this.client.srem('active_users', userId);
  }
  
  async rateLimit(key, maxRequests, windowMs) {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, Math.ceil(windowMs / 1000));
    }
    return current <= maxRequests;
  }
  
  async getRateLimitRemaining(key, maxRequests) {
    const current = await this.client.get(key);
    if (!current) return maxRequests;
    return Math.max(0, maxRequests - parseInt(current));
  }
  
  async healthCheck() {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

module.exports = new RedisService();