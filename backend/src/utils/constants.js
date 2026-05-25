// constants.js - Статические данные:

//     HTTP статусы

//     Категории подарков

//     Знаки зодиака

//     Ключи для кэширования

//     Сообщения об ошибках

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };
  
  // User Roles
  const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MERCHANT: 'merchant',
    MODERATOR: 'moderator',
  };
  
  // Gift Categories
  const GIFT_CATEGORIES = {
    ELECTRONICS: 'electronics',
    CLOTHING: 'clothing',
    BOOKS: 'books',
    TOYS: 'toys',
    JEWELRY: 'jewelry',
    SPORTS: 'sports',
    BEAUTY: 'beauty',
    HOME: 'home',
    GIFT_CARDS: 'gift_cards',
    WELLNESS: 'wellness',
    HOBBIES: 'hobbies',
    PETS: 'pets',
    FOOD: 'food',
    TRAVEL: 'travel',
  };
  
  // Gift Tags
  const GIFT_TAGS = {
    POPULAR: 'popular',
    NEW: 'new',
    TRENDING: 'trending',
    BESTSELLER: 'bestseller',
    LIMITED: 'limited',
    ECO: 'eco',
    HANDMADE: 'handmade',
    PERSONALIZED: 'personalized',
  };
  
  // Zodiac Signs
  const ZODIAC_SIGNS = {
    ARIES: 'Овен',
    TAURUS: 'Телец',
    GEMINI: 'Близнецы',
    CANCER: 'Рак',
    LEO: 'Лев',
    VIRGO: 'Дева',
    LIBRA: 'Весы',
    SCORPIO: 'Скорпион',
    SAGITTARIUS: 'Стрелец',
    CAPRICORN: 'Козерог',
    AQUARIUS: 'Водолей',
    PISCES: 'Рыбы',
  };
  
  // Occasions
  const OCCASIONS = {
    BIRTHDAY: 'День рождения',
    NEW_YEAR: 'Новый год',
    MARCH_8: '8 Марта',
    FEBRUARY_23: '23 Февраля',
    WEDDING: 'Свадьба',
    ANNIVERSARY: 'Юбилей',
    NO_REASON: 'Без повода',
    GRADUATION: 'Выпускной',
    JOB: 'Новая работа',
    HOUSE_WARMING: 'Новоселье',
  };
  
  // Budget Ranges
  const BUDGET_RANGES = {
    LOW: { min: 0, max: 1000, label: 'До 1000 ₽' },
    MEDIUM_LOW: { min: 1000, max: 3000, label: '1000-3000 ₽' },
    MEDIUM: { min: 3000, max: 5000, label: '3000-5000 ₽' },
    MEDIUM_HIGH: { min: 5000, max: 10000, label: '5000-10000 ₽' },
    HIGH: { min: 10000, max: 20000, label: '10000-20000 ₽' },
    PREMIUM: { min: 20000, max: Infinity, label: '20000+ ₽' },
  };
  
  // Person Types
  const PERSON_TYPES = {
    PARTNER: 'partner',
    PARENT: 'parent',
    CHILD: 'child',
    FRIEND: 'friend',
    COLLEAGUE: 'colleague',
    OTHER: 'other',
  };
  
  // Personality Types
  const PERSONALITY_TYPES = {
    EXTROVERT: 'Экстраверт',
    INTROVERT: 'Интроверт',
    ROMANTIC: 'Романтик',
    PRAGMATIC: 'Прагматик',
    CREATIVE: 'Креативный',
    CALM: 'Спокойный',
    ACTIVE: 'Активный',
  };
  
  // Cache Keys
  const CACHE_KEYS = {
    POPULAR_GIFTS: 'popular_gifts',
    GIFT_DETAILS: (id) => `gift:${id}`,
    USER_FAVORITES: (userId) => `user:favorites:${userId}`,
    QUIZ_RESULT: (key) => `quiz:${key}`,
    AI_RECOMMENDATIONS: (key) => `ai:recommendations:${key}`,
    NEARBY_STORES: (lat, lng, radius) => `nearby:${lat}:${lng}:${radius}`,
    SEARCH_RESULTS: (query) => `search:${query}`,
  };
  
  // Cache TTL (seconds)
  const CACHE_TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    VERY_LONG: 86400,    // 24 hours
    PERMANENT: 604800,   // 7 days
  };
  
  // Queue Names
  const QUEUE_NAMES = {
    AI_RECOMMENDATIONS: 'ai-recommendations',
    EMAILS: 'emails',
    SYNC: 'sync',
    ANALYTICS: 'analytics',
  };
  
  // Rate Limits (requests per window)
  const RATE_LIMITS = {
    STRICT: { windowMs: 60 * 1000, max: 10 },     // 10 requests per minute
    MEDIUM: { windowMs: 60 * 1000, max: 30 },     // 30 requests per minute
    RELAXED: { windowMs: 60 * 1000, max: 100 },   // 100 requests per minute
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 },   // 5 requests per 15 minutes
  };
  
  // API Endpoints
  const API_ENDPOINTS = {
    QUIZ: '/api/quiz',
    SEARCH: '/api/search',
    GEO: '/api/geo',
    MARKETPLACE: '/api/marketplace',
    USERS: '/api/users',
    HEALTH: '/health',
    METRICS: '/metrics',
  };
  
  // Error Messages
  const ERROR_MESSAGES = {
    INTERNAL: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION: 'Validation failed',
    RATE_LIMIT: 'Too many requests, please try again later',
    DUPLICATE: 'Resource already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    DATABASE_ERROR: 'Database error',
    AI_SERVICE_ERROR: 'AI service unavailable',
  };
  
  // Success Messages
  const SUCCESS_MESSAGES = {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    FAVORITE_ADDED: 'Added to favorites',
    FAVORITE_REMOVED: 'Removed from favorites',
    QUIZ_COMPLETED: 'Quiz completed successfully',
  };
  
  // Default Values
  const DEFAULTS = {
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_RADIUS_KM: 5,
    DEFAULT_SORT: 'relevance',
    DEFAULT_RATING: 4.5,
    DEFAULT_LANGUAGE: 'ru',
    TIMEZONE: 'Europe/Moscow',
  };
  
  module.exports = {
    HTTP_STATUS,
    USER_ROLES,
    GIFT_CATEGORIES,
    GIFT_TAGS,
    ZODIAC_SIGNS,
    OCCASIONS,
    BUDGET_RANGES,
    PERSON_TYPES,
    PERSONALITY_TYPES,
    CACHE_KEYS,
    CACHE_TTL,
    QUEUE_NAMES,
    RATE_LIMITS,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DEFAULTS,
  };
