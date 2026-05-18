const convict = require('convict');
const dotenv = require('dotenv');

dotenv.config();

const config = convict({
  env: {
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  database: {
    host: {
      format: String,
      default: 'localhost',
      env: 'DB_HOST',
    },
    port: {
      format: 'port',
      default: 5432,
      env: 'DB_PORT',
    },
    name: {
      format: String,
      default: 'giftwizard',
      env: 'DB_NAME',
    },
    user: {
      format: String,
      default: 'admin',
      env: 'DB_USER',
    },
    password: {
      format: String,
      default: '',
      env: 'DB_PASSWORD',
      sensitive: true,
    },
    url: {
      format: String,
      default: null,
      env: 'DATABASE_URL',
      sensitive: true,
    },
    pool: {
      min: {
        format: Number,
        default: 2,
        env: 'DB_POOL_MIN',
      },
      max: {
        format: Number,
        default: 20,
        env: 'DB_POOL_MAX',
      },
    },
  },
  redis: {
    host: {
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT',
    },
    password: {
      format: String,
      default: '',
      env: 'REDIS_PASSWORD',
      sensitive: true,
    },
    url: {
      format: String,
      default: 'redis://localhost:6379',
      env: 'REDIS_URL',
      sensitive: true,
    },
  },
  elasticsearch: {
    host: {
      format: String,
      default: 'http://localhost:9200',
      env: 'ELASTICSEARCH_HOST',
    },
  },
  jwt: {
    secret: {
      format: String,
      default: 'your-secret-key',
      env: 'JWT_SECRET',
      sensitive: true,
    },
    expiresIn: {
      format: String,
      default: '7d',
      env: 'JWT_EXPIRES_IN',
    },
  },
  ai: {
    hfToken: {
      format: String,
      default: null,
      env: 'HF_API_TOKEN',
      sensitive: true,
    },
    model: {
      format: String,
      default: 'mistralai/Mistral-7B-Instruct-v0.1',
      env: 'HF_MODEL',
    },
  },
  geocoding: {
    opencageApiKey: {
      format: String,
      default: null,
      env: 'OPENCAGE_API_KEY',
      sensitive: true,
    },
    mapboxToken: {
      format: String,
      default: null,
      env: 'MAPBOX_TOKEN',
      sensitive: true,
    },
  },
  queue: {
    redisPassword: {
      format: String,
      default: '',
      env: 'REDIS_QUEUE_PASSWORD',
      sensitive: true,
    },
    prefix: {
      format: String,
      default: 'giftwizard_queue',
      env: 'BULL_PREFIX',
    },
    maxConcurrentJobs: {
      format: Number,
      default: 5,
      env: 'MAX_CONCURRENT_JOBS',
    },
  },
  monitoring: {
    enabled: {
      format: Boolean,
      default: true,
      env: 'PROMETHEUS_METRICS_ENABLED',
    },
    lokiHost: {
      format: String,
      default: 'http://loki:3100',
      env: 'LOKI_HOST',
    },
  },
  security: {
    corsOrigin: {
      format: String,
      default: 'http://localhost:3001',
      env: 'CORS_ORIGIN',
    },
    rateLimitWindowMs: {
      format: Number,
      default: 60000,
      env: 'RATE_LIMIT_WINDOW_MS',
    },
    rateLimitMax: {
      format: Number,
      default: 100,
      env: 'RATE_LIMIT_MAX',
    },
  },
  email: {
    smtpHost: {
      format: String,
      default: 'smtp.gmail.com',
      env: 'SMTP_HOST',
    },
    smtpPort: {
      format: 'port',
      default: 587,
      env: 'SMTP_PORT',
    },
    smtpUser: {
      format: String,
      default: '',
      env: 'SMTP_USER',
    },
    smtpPass: {
      format: String,
      default: '',
      env: 'SMTP_PASS',
      sensitive: true,
    },
  },
});

// Validate configuration
config.validate({ allowed: 'strict' });

module.exports = config;