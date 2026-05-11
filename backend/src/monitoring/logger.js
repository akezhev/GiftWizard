const winston = require('winston');
const config = require('../config/validateEnv');

const { combine, timestamp, printf, colorize, json } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: config.get('env') === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    config.get('env') === 'production' ? json() : myFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        myFormat
      ),
    }),
  ],
});

// Add file transport in production
if (config.get('env') === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10485760,
    maxFiles: 5,
  }));
}

module.exports = { logger };