const Marketplace = require('../models/Marketplace');
const { cacheGet, cacheSet } = require('../config/redis');
const { logger } = require('../monitoring/logger');
const { AppError } = require('../middleware/errorHandler');

const createStore = async (req, res, next) => {
  try {
    const storeData = req.body;
    
    const store = await Marketplace.create(storeData);
    logger.info('Store created', { storeId: store.id });
    
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

const getAllStores = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await Marketplace.findAll({ limit, offset });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStoreProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      throw new AppError('Products array is required', 400);
    }
    
    const store = await Marketplace.updateProducts(id, products);
    if (!store) {
      throw new AppError('Store not found', 404);
    }
    
    logger.info('Store products updated', { storeId: id, productsCount: products.length });
    res.json(store);
  } catch (error) {
    next(error);
  }
};

const getMarketplaceStats = async (req, res, next) => {
  try {
    const stats = await Marketplace.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStore,
  getAllStores,
  updateStoreProducts,
  getMarketplaceStats,
};