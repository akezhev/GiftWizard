const Gift = require('../models/Gift');
const { cacheGet, cacheSet } = require('../config/redis');
const { logger } = require('../monitoring/logger');
const { AppError } = require('../middleware/errorHandler');

const searchGifts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy, limit, offset } = req.query;
    
    if (!q && !category) {
      throw new AppError('At least one search parameter is required', 400);
    }
    
    // Build cache key
    const cacheKey = `search:${q || ''}:${category || ''}:${minPrice || ''}:${maxPrice || ''}:${sortBy || ''}:${limit}:${offset}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info('Search results served from cache');
      return res.json(cached);
    }
    
    let results;
    if (q) {
      results = await Gift.search(q, { category, minPrice, maxPrice, sortBy, limit, offset });
    } else {
      results = await Gift.findAll({ category, minPrice, maxPrice, sortBy, limit, offset });
    }
    
    // Cache results for 5 minutes
    await cacheSet(cacheKey, results, 300);
    
    res.json(results);
  } catch (error) {
    next(error);
  }
};

const getGiftDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const gift = await Gift.findById(id);
    if (!gift) {
      throw new AppError('Gift not found', 404);
    }
    
    res.json(gift);
  } catch (error) {
    next(error);
  }
};

const getPopularGifts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const popular = await Gift.getPopular(limit);
    res.json(popular);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'electronics', name: 'Электроника', icon: 'smartphone', count: 0 },
      { id: 'clothing', name: 'Одежда и обувь', icon: 'shirt', count: 0 },
      { id: 'books', name: 'Книги', icon: 'book', count: 0 },
      { id: 'toys', name: 'Игрушки', icon: 'toy', count: 0 },
      { id: 'jewelry', name: 'Украшения', icon: 'diamond', count: 0 },
      { id: 'sports', name: 'Спорт', icon: 'bike', count: 0 },
      { id: 'beauty', name: 'Красота', icon: 'sparkles', count: 0 },
      { id: 'home', name: 'Для дома', icon: 'home', count: 0 },
      { id: 'gift_cards', name: 'Подарочные карты', icon: 'credit-card', count: 0 },
      { id: 'wellness', name: 'Здоровье', icon: 'heart', count: 0 },
    ];
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchGifts,
  getGiftDetails,
  getPopularGifts,
  getCategories,
};