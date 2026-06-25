const axios = require('axios');
const { logger } = require('../monitoring/logger');
const Gift = require('../models/Gift');
const Marketplace = require('../models/Marketplace');
const { cacheDelPattern, cacheSet } = require('../config/redis');
const config = require('../config/validateEnv');

class SyncService {
  constructor() {
    this.apiEndpoints = {
      ozon: 'https://api.ozon.ru/v1',
      wildberries: 'https://api.wildberries.ru/v1',
      yandex: 'https://api.market.yandex.ru/v1',
    };
  }

  /**
   * Sync gifts from external marketplace API
   */
  async syncGifts(source = 'ozon') {
    logger.info(`Starting gift sync from ${source}`);
    
    try {
      const gifts = await this.fetchGiftsFromAPI(source);
      let synced = 0;
      let updated = 0;
      
      for (const giftData of gifts) {
        const existing = await Gift.findById(giftData.id);
        
        if (existing) {
          await this.updateGift(existing.id, giftData);
          updated++;
        } else {
          await Gift.create(giftData);
          synced++;
        }
      }
      
      // Invalidate cache
      await cacheDelPattern('search:*');
      await cacheDelPattern('popular_gifts');
      
      logger.info(`Gift sync completed: synced=${synced}, updated=${updated}`);
      
      return { synced, updated, total: gifts.length };
    } catch (error) {
      logger.error('Gift sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync marketplaces and store locations
   */
  async syncMarketplaces(region = 'moscow') {
    logger.info(`Starting marketplace sync for region: ${region}`);
    
    try {
      const stores = await this.fetchStoresFromAPI(region);
      let created = 0;
      let updated = 0;
      
      for (const store of stores) {
        const existing = await Marketplace.findById(store.id);
        
        if (existing) {
          await Marketplace.updateProducts(store.id, store.products);
          updated++;
        } else {
          await Marketplace.create(store);
          created++;
        }
      }
      
      // Invalidate geolocation cache
      await cacheDelPattern('nearby:*');
      
      logger.info(`Marketplace sync completed: created=${created}, updated=${updated}`);
      
      return { created, updated, total: stores.length };
    } catch (error) {
      logger.error('Marketplace sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync products for a specific store
   */
  async syncProducts(storeId, products) {
    logger.info(`Syncing products for store: ${storeId}`);
    
    try {
      const store = await Marketplace.findById(storeId);
      
      if (!store) {
        throw new Error(`Store not found: ${storeId}`);
      }
      
      const updatedStore = await Marketplace.updateProducts(storeId, products);
      
      // Invalidate cache
      await cacheDelPattern(`nearby:*`);
      await cacheDelPattern(`store:${storeId}`);
      
      return updatedStore;
    } catch (error) {
      logger.error('Product sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync ratings and reviews
   */
  async syncRatings(giftId, ratings) {
    logger.info(`Syncing ratings for gift: ${giftId}`);
    
    try {
      const gift = await Gift.findById(giftId);
      
      if (!gift) {
        throw new Error(`Gift not found: ${giftId}`);
      }
      
      // Calculate new average rating
      const newRating = this.calculateAverageRating(gift.rating, gift.reviewCount, ratings);
      
      const updatedGift = await Gift.updateRating(giftId, newRating);
      
      // Invalidate cache
      await cacheDelPattern(`gift:${giftId}`);
      await cacheDelPattern('popular_gifts');
      
      return updatedGift;
    } catch (error) {
      logger.error('Rating sync failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired cache
   */
  async cleanupCache(pattern = '*') {
    logger.info(`Cleaning up cache with pattern: ${pattern}`);
    
    try {
      await cacheDelPattern(pattern);
      logger.info('Cache cleanup completed');
      
      return { success: true, pattern };
    } catch (error) {
      logger.error('Cache cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Fetch gifts from external API
   * @private
   */
  async fetchGiftsFromAPI(source) {
    const endpoints = {
      ozon: '/product/list',
      wildberries: '/catalog/product',
      yandex: '/products',
    };
    
    const url = `${this.apiEndpoints[source]}${endpoints[source]}`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.getApiKey(source)}`,
          'Content-Type': 'application/json',
        },
        params: {
          limit: 100,
          offset: 0,
        },
        timeout: 30000,
      });
      
      return this.transformGiftData(response.data, source);
    } catch (error) {
      logger.error(`Failed to fetch gifts from ${source}:`, error);
      return [];
    }
  }

  /**
   * Fetch stores from mapping API
   * @private
   */
  async fetchStoresFromAPI(region) {
    // Integration with 2GIS, Yandex Maps, or Google Places API
    const apiKey = config.get('geocoding.mapboxToken');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${region}.json`;
    
    try {
      const response = await axios.get(url, {
        params: {
          access_token: apiKey,
          types: 'poi',
          limit: 50,
        },
      });
      
      return this.transformStoreData(response.data);
    } catch (error) {
      logger.error('Failed to fetch stores:', error);
      return [];
    }
  }

  /**
   * Get API key for external service
   * @private
   */
  getApiKey(source) {
    const keys = {
      ozon: process.env.OZON_API_KEY,
      wildberries: process.env.WILDBERRIES_API_KEY,
      yandex: process.env.YANDEX_API_KEY,
    };
    return keys[source];
  }

  /**
   * Transform gift data from external API to internal format
   * @private
   */
  transformGiftData(data, source) {
    // Implementation depends on API response format
    return data.items?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image_url,
      tags: item.tags,
    })) || [];
  }

  /**
   * Transform store data from geocoding API
   * @private
   */
  transformStoreData(data) {
    return data.features?.map(feature => ({
      id: feature.id,
      name: feature.text,
      address: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      products: [],
    })) || [];
  }

  /**
   * Calculate average rating
   * @private
   */
  calculateAverageRating(currentRating, reviewCount, newRatings) {
    const totalScore = currentRating * reviewCount;
    const newTotalScore = newRatings.reduce((sum, r) => sum + r.rating, 0);
    const newReviewCount = reviewCount + newRatings.length;
    
    return (totalScore + newTotalScore) / newReviewCount;
  }

  /**
   * Update gift information
   * @private
   */
  async updateGift(giftId, newData) {
    const gift = await Gift.findById(giftId);
    
    const updatedGift = {
      ...gift,
      ...newData,
      updatedAt: new Date(),
    };
    
    // Save to database
    await Gift.update(giftId, updatedGift);
    
    return updatedGift;
  }
}

module.exports = new SyncService();