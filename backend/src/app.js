const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compressionMiddleware = require('./middleware/compression');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { metricsMiddleware, metricsEndpoint } = require('./monitoring/metrics');
const { logger } = require('./monitoring/logger');
const config = require('./config/validateEnv');

// Import routes
const quizRoutes = require('./routes/quizRoutes');
const searchRoutes = require('./routes/searchRoutes');
const geoRoutes = require('./routes/geoRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://api.mapbox.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.get('security.corsOrigin').split(','),
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Compression
app.use(compressionMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Metrics
if (config.get('monitoring.enabled')) {
  app.use(metricsMiddleware);
  app.get('/metrics', metricsEndpoint);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.get('env'),
  });
});

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GiftWizard API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;