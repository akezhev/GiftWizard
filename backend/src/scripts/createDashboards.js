const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { logger } = require('../src/monitoring/logger');
const config = require('../src/config/validateEnv');

const execPromise = promisify(exec);
const mkdirPromise = promisify(fs.mkdir);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = config.get('database.url');

const ensureBackupDir = async () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    await mkdirPromise(BACKUP_DIR, { recursive: true });
    logger.info(`Created backup directory: ${BACKUP_DIR}`);
  }
};

const getBackupFilename = (type) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${type}_backup_${timestamp}.sql`;
};

const backupDatabase = async () => {
  const filename = getBackupFilename('database');
  const filepath = path.join(BACKUP_DIR, filename);
  
  logger.info(`Starting database backup to ${filepath}`);
  
  try {
    // Extract database name from URL
    const dbName = DATABASE_URL.split('/').pop();
    
    const command = `pg_dump ${DATABASE_URL} --no-owner --no-privileges --format=custom --file=${filepath}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('WARNING')) {
      logger.warn('Backup warnings:', stderr);
    }
    
    const stats = fs.statSync(filepath);
    logger.info(`Database backup completed: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    return { filename, filepath, size: stats.size };
  } catch (error) {
    logger.error('Database backup failed:', error);
    throw error;
  }
};

const backupRedis = async () => {
  const filename = getBackupFilename('redis');
  const filepath = path.join(BACKUP_DIR, filename);
  
  logger.info(`Starting Redis backup to ${filepath}`);
  
  try {
    const redisHost = config.get('redis.host');
    const redisPort = config.get('redis.port');
    const redisPassword = config.get('redis.password');
    
    const command = `redis-cli -h ${redisHost} -p ${redisPort} ${redisPassword ? `-a ${redisPassword}` : ''} --rdb ${filepath}`;
    
    await execPromise(command);
    
    const stats = fs.statSync(filepath);
    logger.info(`Redis backup completed: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    return { filename, filepath, size: stats.size };
  } catch (error) {
    logger.error('Redis backup failed:', error);
    throw error;
  }
};

const backupUploads = async () => {
  const uploadsDir = process.env.UPLOADS_DIR || './uploads';
  const filename = getBackupFilename('uploads').replace('.sql', '.tar.gz');
  const filepath = path.join(BACKUP_DIR, filename);
  
  if (!fs.existsSync(uploadsDir)) {
    logger.warn('Uploads directory not found, skipping');
    return null;
  }
  
  logger.info(`Starting uploads backup to ${filepath}`);
  
  try {
    const command = `tar -czf ${filepath} -C ${path.dirname(uploadsDir)} ${path.basename(uploadsDir)}`;
    
    await execPromise(command);
    
    const stats = fs.statSync(filepath);
    logger.info(`Uploads backup completed: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    return { filename, filepath, size: stats.size };
  } catch (error) {
    logger.error('Uploads backup failed:', error);
    throw error;
  }
};

const cleanupOldBackups = async (daysToKeep = 7) => {
  const now = Date.now();
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
  
  const files = fs.readdirSync(BACKUP_DIR);
  let deletedCount = 0;
  
  for (const file of files) {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filepath);
    const age = now - stats.mtimeMs;
    
    if (age > maxAge) {
      fs.unlinkSync(filepath);
      deletedCount++;
      logger.info(`Deleted old backup: ${file} (${Math.round(age / 86400000)} days old)`);
    }
  }
  
  logger.info(`Cleaned up ${deletedCount} old backups`);
  return deletedCount;
};

const uploadToCloud = async (filepath, filename) => {
  // Implement cloud upload (S3, GCS, etc.)
  logger.info(`Uploading ${filename} to cloud storage...`);
  
  // Example for AWS S3 (uncomment and configure if needed)
  /*
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  const fileContent = fs.readFileSync(filepath);
  const params = {
    Bucket: process.env.S3_BACKUP_BUCKET,
    Key: `backups/${filename}`,
    Body: fileContent,
  };
  
  await s3.upload(params).promise();
  logger.info(`Uploaded to S3: ${filename}`);
  */
  
  return { uploaded: false, message: 'Cloud upload not configured' };
};

const sendNotification = async (results) => {
  // Send notification about backup status (email, Slack, etc.)
  logger.info('Backup completed', results);
  
  // Example: Send to Slack (if configured)
  /*
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhook) {
    await axios.post(slackWebhook, {
      text: `✅ Database backup completed\n\nFiles:\n${results.map(r => `- ${r.filename} (${(r.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}`,
    });
  }
  */
};

const main = async () => {
  try {
    await ensureBackupDir();
    
    const results = [];
    
    // Backup database
    const dbBackup = await backupDatabase();
    results.push(dbBackup);
    
    // Backup Redis
    const redisBackup = await backupRedis();
    results.push(redisBackup);
    
    // Backup uploads (if exists)
    const uploadsBackup = await backupUploads();
    if (uploadsBackup) results.push(uploadsBackup);
    
    // Upload to cloud (optional)
    for (const result of results) {
      await uploadToCloud(result.filepath, result.filename);
    }
    
    // Cleanup old backups
    await cleanupOldBackups(7);
    
    // Send notification
    await sendNotification(results);
    
    logger.info('Backup process completed successfully');
  } catch (error) {
    logger.error('Backup process failed:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  backupDatabase,
  backupRedis,
  backupUploads,
  cleanupOldBackups,
};