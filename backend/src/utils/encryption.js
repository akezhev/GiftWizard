// encryption.js - Безопасность:

//     Хэширование паролей (bcrypt)

//     Шифрование данных (AES-256)

//     HMAC подписи

//     Маскирование чувствительных данных

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ALGORITHM = 'aes-256-cbc';
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if match
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate JWT secret
 * @returns {string} JWT secret
 */
const generateJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Encrypt data
 * @param {string} text - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Encrypted data with IV
 */
const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
};

/**
 * Decrypt data
 * @param {Object} data - Encrypted data with IV
 * @param {string} key - Encryption key
 * @returns {string} Decrypted data
 */
const decrypt = (data, key) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(data.iv, 'hex')
  );
  let decrypted = decipher.update(data.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
const createHMAC = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if valid
 */
const verifyHMAC = (data, signature, secret) => {
  const expectedSignature = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Sanitize input to prevent injection
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[&<>]/g, (match) => {
      if (match === '&') return '&amp;';
      if (match === '<') return '&lt;';
      if (match === '>') return '&gt;';
      return match;
    })
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (match) => {
      // Keep emojis, don't sanitize them
      return match;
    });
};

/**
 * Mask sensitive data (e.g., email, phone)
 * @param {string} data - Data to mask
 * @param {string} type - Type of data ('email', 'phone', 'card')
 * @returns {string} Masked data
 */
const maskData = (data, type = 'email') => {
  if (!data) return '';
  
  switch (type) {
    case 'email': {
      const [local, domain] = data.split('@');
      if (!domain) return data;
      const maskedLocal = local.length > 3
        ? local.slice(0, 2) + '*'.repeat(local.length - 2)
        : '*'.repeat(local.length);
      return `${maskedLocal}@${domain}`;
    }
    case 'phone': {
      const digits = data.replace(/\D/g, '');
      if (digits.length < 4) return '***';
      return `+${digits.slice(0, 1)}****${digits.slice(-4)}`;
    }
    case 'card': {
      const digits = data.replace(/\D/g, '');
      if (digits.length < 4) return '****';
      return `**** **** **** ${digits.slice(-4)}`;
    }
    default:
      return '*'.repeat(Math.min(data.length, 8));
  }
};

/**
 * Generate secure API key
 * @param {string} prefix - Optional prefix
 * @returns {string} API key
 */
const generateApiKey = (prefix = 'gw') => {
  const random = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${random}`;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateJWTSecret,
  encrypt,
  decrypt,
  createHMAC,
  verifyHMAC,
  sanitizeInput,
  maskData,
  generateApiKey,
};