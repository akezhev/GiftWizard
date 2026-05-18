const { Client } = require('@elastic/elasticsearch');
const config = require('./validateEnv');
const { logger } = require('../monitoring/logger');

let esClient = null;

const initElasticsearch = async () => {
  const esConfig = config.get('elasticsearch');
  
  esClient = new Client({
    node: esConfig.host,
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
    sniffOnConnectionFault: false,
  });
  
  // Test connection
  try {
    const health = await esClient.cluster.health();
    logger.info('Elasticsearch connected', { status: health.status });
  } catch (error) {
    logger.warn('Elasticsearch connection failed, continuing without ES:', error.message);
    // Don't throw - allow app to work without ES
  }
  
  // Create indices if they don't exist
  await createIndices();
  
  return esClient;
};

const createIndices = async () => {
  if (!esClient) return;
  
  const indices = [
    {
      name: 'gifts',
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              russian_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'stop', 'snowball'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'russian_analyzer' },
            description: { type: 'text', analyzer: 'russian_analyzer' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            price: { type: 'float' },
            rating: { type: 'float' },
            createdAt: { type: 'date' },
          },
        },
      },
    },
    {
      name: 'marketplaces',
      body: {
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            address: { type: 'text' },
            location: { type: 'geo_point' },
            products: { type: 'keyword' },
          },
        },
      },
    },
  ];
  
  for (const index of indices) {
    try {
      const exists = await esClient.indices.exists({ index: index.name });
      if (!exists) {
        await esClient.indices.create(index);
        logger.info(`Created Elasticsearch index: ${index.name}`);
      }
    } catch (error) {
      logger.error(`Failed to create index ${index.name}:`, error);
    }
  }
};

const getElasticsearch = () => {
  return esClient;
};

const indexGift = async (gift) => {
  if (!esClient) return;
  try {
    await esClient.index({
      index: 'gifts',
      id: gift.id,
      body: gift,
    });
  } catch (error) {
    logger.error('Failed to index gift:', error);
  }
};

const searchGifts = async (query, filters = {}) => {
  if (!esClient) return { hits: { hits: [], total: { value: 0 } } };
  
  const must = [];
  
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description', 'tags'],
        fuzziness: 'AUTO',
      },
    });
  }
  
  if (filters.category) {
    must.push({ term: { category: filters.category } });
  }
  
  if (filters.minPrice || filters.maxPrice) {
    const range = {};
    if (filters.minPrice) range.gte = filters.minPrice;
    if (filters.maxPrice) range.lte = filters.maxPrice;
    must.push({ range: { price: range } });
  }
  
  try {
    const result = await esClient.search({
      index: 'gifts',
      body: {
        query: { bool: { must } },
        sort: filters.sortBy === 'price' ? [{ price: { order: filters.sortOrder || 'asc' } }] : [{ rating: { order: 'desc' } }],
        from: filters.from || 0,
        size: filters.size || 20,
      },
    });
    
    return {
      total: result.hits.total.value,
      hits: result.hits.hits.map(h => ({ id: h._id, ...h._source })),
    };
  } catch (error) {
    logger.error('Search failed:', error);
    return { total: 0, hits: [] };
  }
};

module.exports = {
  initElasticsearch,
  getElasticsearch,
  indexGift,
  searchGifts,
};