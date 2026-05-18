const { Pool } = require('pg');
const config = require('./validateEnv');
const { logger } = require('../monitoring/logger');

let pool = null;

const initDatabase = async () => {
  const dbConfig = config.get('database');
  
  // Use connection string if provided, otherwise use individual params
  const connectionConfig = dbConfig.url
    ? { connectionString: dbConfig.url, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
    : {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.name,
        user: dbConfig.user,
        password: dbConfig.password,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };

  pool = new Pool({
    ...connectionConfig,
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection pool established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected database error:', err);
  });

  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return pool;
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
};

const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set timeout for queries
  const timeout = setTimeout(() => {
    logger.error('Database query timeout');
    client.release();
  }, 5000);
  
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    release.apply(client);
  };
  
  return client;
};

module.exports = {
  initDatabase,
  getPool,
  query,
  getClient,
  pool: () => pool,
};