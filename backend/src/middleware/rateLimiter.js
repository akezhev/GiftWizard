const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedis } = require('../config/redis');
const config = require('../config/validateEnv');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = config.get('security.rateLimitWindowMs'),
    max = config.get('security.rateLimitMax'),
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options;
  
  return rateLimit({
    store: new RedisStore({
      client: getRedis(),
      prefix: 'rl:',
    }),
    windowMs,
    max,
    message: { error: message },
    skipSuccessfulRequests,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Specific limiters for different endpoints
const strictLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10 });
const mediumLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 });
const relaxedLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 100 });
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

module.exports = {
  createRateLimiter,
  strictLimiter,
  mediumLimiter,
  relaxedLimiter,
  authLimiter,
};