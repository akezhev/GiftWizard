const Queue = require('bull');
const config = require('../config/validateEnv');
const { logger } = require('../monitoring/logger');

const queues = {};

const getQueueOptions = () => ({
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('queue.redisPassword') || config.get('redis.password'),
  },
  prefix: config.get('queue.prefix'),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

const createQueue = (name, processor, options = {}) => {
  const queue = new Queue(name, getQueueOptions());
  
  queue.process(config.get('queue.maxConcurrentJobs'), processor);
  
  queue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed in queue ${name}`);
  });
  
  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed in queue ${name}:`, err);
  });
  
  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled in queue ${name}`);
  });
  
  queues[name] = queue;
  return queue;
};

const getQueue = (name) => {
  if (!queues[name]) {
    throw new Error(`Queue ${name} not found`);
  }
  return queues[name];
};

const addToQueue = async (queueName, data, options = {}) => {
  const queue = getQueue(queueName);
  const job = await queue.add(data, {
    delay: options.delay || 0,
    priority: options.priority || 1,
    attempts: options.attempts || 3,
    ...options,
  });
  logger.info(`Added job ${job.id} to queue ${queueName}`);
  return job;
};

const getQueueStats = async (queueName) => {
  const queue = getQueue(queueName);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
};

const cleanQueues = async () => {
  for (const name in queues) {
    const queue = queues[name];
    await queue.clean(86400000, 'completed'); // Clean jobs older than 24 hours
    await queue.clean(86400000, 'failed');
  }
};

module.exports = {
  createQueue,
  getQueue,
  addToQueue,
  getQueueStats,
  cleanQueues,
};