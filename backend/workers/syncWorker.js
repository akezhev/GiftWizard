const { createQueue } = require('../src/services/queueService');
const syncService = require('../src/services/syncService');
const { logger } = require('../src/monitoring/logger');
const { cacheDelPattern } = require('../src/config/redis');

const processor = async (job) => {
  const { data } = job;
  logger.info(`Processing sync job ${job.id}`, { type: data.type });

  try {
    let result;

    switch (data.type) {
      case 'sync_gifts':
        result = await syncService.syncGifts(data.source);
        break;
      
      case 'sync_marketplaces':
        result = await syncService.syncMarketplaces(data.source);
        break;
      
      case 'sync_products':
        result = await syncService.syncProducts(data.storeId, data.products);
        break;
      
      case 'sync_ratings':
        result = await syncService.syncRatings(data.giftId, data.ratings);
        break;
      
      case 'cleanup_cache':
        result = await syncService.cleanupCache(data.pattern);
        break;
      
      default:
        throw new Error(`Unknown sync type: ${data.type}`);
    }

    logger.info(`Sync job ${job.id} completed`, { type: data.type, result });
    
    // Invalidate relevant caches
    await cacheDelPattern('*');
    
    return result;
  } catch (error) {
    logger.error(`Sync job ${job.id} failed:`, error);
    throw error;
  }
};

// Create sync queue with custom options
const syncQueue = createQueue('sync', processor, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

// Schedule recurring sync jobs
const scheduleRecurringJobs = async () => {
  // Sync gifts every hour
  await syncQueue.add(
    { type: 'sync_gifts', source: 'internal' },
    {
      repeat: { cron: '0 * * * *' },
      jobId: 'recurring_sync_gifts',
    }
  );
  
  // Sync marketplaces every 6 hours
  await syncQueue.add(
    { type: 'sync_marketplaces', source: 'api' },
    {
      repeat: { cron: '0 */6 * * *' },
      jobId: 'recurring_sync_marketplaces',
    }
  );
  
  // Cleanup cache every day at 3 AM
  await syncQueue.add(
    { type: 'cleanup_cache', pattern: '*' },
    {
      repeat: { cron: '0 3 * * *' },
      jobId: 'recurring_cache_cleanup',
    }
  );
  
  logger.info('Recurring sync jobs scheduled');
};

// Start recurring jobs only in production
if (process.env.NODE_ENV === 'production') {
  scheduleRecurringJobs().catch((error) => {
    logger.error('Failed to schedule recurring jobs:', error);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Sync worker received SIGTERM, closing...');
  await syncQueue.close();
  process.exit(0);
});

logger.info('Sync worker started');