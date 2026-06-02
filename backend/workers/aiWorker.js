const { createQueue } = require('../src/services/queueService');
const aiService = require('../src/services/aiService');
const { logger } = require('../src/monitoring/logger');
const { cacheSet } = require('../src/config/redis');

const processor = async (job) => {
  const { data } = job;
  logger.info(`Processing AI job ${job.id}`, { answers: data });
  
  try {
    const recommendations = await aiService.processRecommendations(data);
    
    // Cache the result
    const cacheKey = `ai:recommendations:${aiService.getCacheKey(data)}`;
    await cacheSet(cacheKey, recommendations, 3600);
    
    logger.info(`AI job ${job.id} completed`, { recommendationsCount: recommendations.length });
    
    return recommendations;
  } catch (error) {
    logger.error(`AI job ${job.id} failed:`, error);
    throw error;
  }
};

// Create and start the queue
const aiQueue = createQueue('ai-recommendations', processor);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('AI worker received SIGTERM, closing...');
  await aiQueue.close();
  process.exit(0);
});

logger.info('AI worker started');