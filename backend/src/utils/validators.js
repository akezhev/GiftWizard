// validators.js - Валидация входящих данных:

//     Email, телефон, URL

//     Пароли (с проверкой сложности)

//     Координаты

//     Поисковые параметры

//     Санитизация HTML

const validator = require('validator');

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number (Russian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  // Russian phone number pattern
  const phonePattern = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return phonePattern.test(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
const isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
};

/**
 * Validate price (positive number)
 * @param {number} price - Price to validate
 * @returns {boolean} True if valid
 */
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
};

/**
 * Validate age
 * @param {number} age - Age to validate
 * @returns {boolean} True if valid
 */
const isValidAge = (age) => {
  return typeof age === 'number' && age >= 1 && age <= 120;
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid
 */
const isValidLength = (str, min = 1, max = 255) => {
  return str && str.length >= min && str.length <= max;
};

/**
 * Validate UUID
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid
 */
const isValidUUID = (uuid) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid
 */
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate gift object
 * @param {Object} gift - Gift object
 * @returns {Object} Validation result
 */
const validateGift = (gift) => {
  const errors = [];
  
  if (!isValidLength(gift.name, 1, 255)) {
    errors.push('Gift name must be between 1 and 255 characters');
  }
  if (!isValidPrice(gift.price)) {
    errors.push('Gift price must be a positive number');
  }
  if (gift.category && !isValidLength(gift.category, 1, 100)) {
    errors.push('Category must be between 1 and 100 characters');
  }
  if (gift.rating && (gift.rating < 0 || gift.rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate quiz answers
 * @param {Object} answers - Quiz answers
 * @returns {Object} Validation result
 */
const validateQuizAnswers = (answers) => {
  const errors = [];
  const requiredFields = ['age', 'gender', 'hobby', 'occasion', 'budget'];
  
  for (const field of requiredFields) {
    if (!answers[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (answers.age && !isValidAge(answers.age)) {
    errors.push('Age must be between 1 and 120');
  }
  
  if (answers.gender && !['male', 'female'].includes(answers.gender)) {
    errors.push('Gender must be either "male" or "female"');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize HTML (escape special characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeHtml = (str) => {
  if (!str) return '';
  return validator.escape(str);
};

/**
 * Sanitize email (normalize)
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (!email) return '';
  return validator.normalizeEmail(email);
};

/**
 * Validate search query parameters
 * @param {Object} params - Search parameters
 * @returns {Object} Validation result
 */
const validateSearchParams = (params) => {
  const errors = [];
  const validSortBy = ['relevance', 'price_asc', 'price_desc', 'rating'];
  const validCategories = [
    'electronics', 'clothing', 'books', 'toys', 'jewelry',
    'sports', 'beauty', 'home', 'gift_cards', 'wellness',
  ];
  
  if (params.sortBy && !validSortBy.includes(params.sortBy)) {
    errors.push(`Invalid sortBy value. Must be one of: ${validSortBy.join(', ')}`);
  }
  
  if (params.category && params.category !== 'all' && !validCategories.includes(params.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  if (params.minPrice && (params.minPrice < 0 || isNaN(params.minPrice))) {
    errors.push('minPrice must be a positive number');
  }
  
  if (params.maxPrice && (params.maxPrice < 0 || isNaN(params.maxPrice))) {
    errors.push('maxPrice must be a positive number');
  }
  
  if (params.minPrice && params.maxPrice && params.minPrice > params.maxPrice) {
    errors.push('minPrice cannot be greater than maxPrice');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidPrice,
  isValidAge,
  isValidLength,
  isValidUUID,
  isValidCoordinates,
  validatePassword,
  validateGift,
  validateQuizAnswers,
  validateSearchParams,
  sanitizeHtml,
  sanitizeEmail,
};