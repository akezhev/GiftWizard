const Marketplace = require('../models/Marketplace');
const geocodingService = require('../services/geocodingService');
const { cacheGet, cacheSet } = require('../config/redis');
const { logger } = require('../monitoring/logger');
const { AppError } = require('../middleware/errorHandler');

const getNearbyStores = async (req, res, next) => {
  try {
    let { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      // Try to get from IP or default to Moscow
      lat = 55.7558;
      lng = 37.6173;
    } else {
      lat = parseFloat(lat);
      lng = parseFloat(lng);
      radius = parseFloat(radius);
    }
    
    const stores = await Marketplace.findNearby(lat, lng, radius);
    
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

const getStoreDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const store = await Marketplace.findById(id);
    if (!store) {
      throw new AppError('Store not found', 404);
    }
    
    res.json(store);
  } catch (error) {
    next(error);
  }
};

const getStoreProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError('Product IDs are required', 400);
    }
    
    const stores = await Marketplace.findProductsInStock(productIds);
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

const geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      throw new AppError('Address is required', 400);
    }
    
    const location = await geocodingService.geocodeAddress(address);
    if (!location) {
      throw new AppError('Address not found', 404);
    }
    
    res.json(location);
  } catch (error) {
    next(error);
  }
};

const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    
    const address = await geocodingService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json(address);
  } catch (error) {
    next(error);
  }
};

const getMapImage = async (req, res, next) => {
  try {
    const { lat, lng, zoom = 13, width = 600, height = 400 } = req.query;
    
    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    
    const mapUrl = await geocodingService.getMapboxStaticMap(
      parseFloat(lat), parseFloat(lng), parseInt(zoom), parseInt(width), parseInt(height)
    );
    
    res.json({ mapUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyStores,
  getStoreDetails,
  getStoreProducts,
  geocodeAddress,
  reverseGeocode,
  getMapImage,
};