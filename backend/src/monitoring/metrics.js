const client = require('prom-client');
const responseTime = require('response-time');

const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'giftwizard_',
});

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'giftwizard_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'giftwizard_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeUsers = new client.Gauge({
  name: 'giftwizard_active_users',
  help: 'Number of currently active users',
  registers: [register],
});

const aiRequestsTotal = new client.Counter({
  name: 'giftwizard_ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['status'],
  registers: [register],
});

const dbQueryDuration = new client.Histogram({
  name: 'giftwizard_db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

const cacheHitRatio = new client.Gauge({
  name: 'giftwizard_cache_hit_ratio',
  help: 'Redis cache hit ratio',
  registers: [register],
});

const queueSize = new client.Gauge({
  name: 'giftwizard_queue_size',
  help: 'Size of job queues',
  labelNames: ['queue'],
  registers: [register],
});

// Middleware to collect metrics
const metricsMiddleware = responseTime((req, res, time) => {
  const route = req.route?.path || req.path;
  const method = req.method;
  const statusCode = res.statusCode;
  
  httpRequestDuration.labels(method, route, statusCode).observe(time / 1000);
  httpRequestsTotal.labels(method, route, statusCode).inc();
});

const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  activeUsers,
  aiRequestsTotal,
  dbQueryDuration,
  cacheHitRatio,
  queueSize,
  register,
};