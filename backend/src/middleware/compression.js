const compression = require('compression');

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

const compressionMiddleware = compression({
  filter: shouldCompress,
  level: 6,
  threshold: 1024, // Compress responses > 1KB
  chunkSize: 16384,
  memLevel: 8,
  windowBits: 15,
});

module.exports = compressionMiddleware;