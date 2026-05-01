const axios = require('axios');
const config = require('../config/validateEnv');
const { logger } = require('../monitoring/logger');
const { cacheGet, cacheSet } = require('../config/redis');

class GeocodingService {
  constructor() {
    this.opencageKey = config.get('geocoding.opencageApiKey');
    this.mapboxToken = config.get('geocoding.mapboxToken');
  }
  
  async geocodeAddress(address) {
    const cacheKey = `geocode:${address}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    
    try {
      // Try OpenCage first
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: address,
          key: this.opencageKey,
          language: 'ru',
          limit: 1,
        },
        timeout: 5000,
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          formatted: result.formatted,
          confidence: result.confidence,
        };
        
        await cacheSet(cacheKey, location, 86400); // Cache for 24 hours
        return location;
      }
      
      throw new Error('No results found');
    } catch (error) {
      logger.error('Geocoding failed:', error);
      return null;
    }
  }
  
  async reverseGeocode(lat, lng) {
    const cacheKey = `reverse:${lat}:${lng}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${lat}+${lng}`,
          key: this.opencageKey,
          language: 'ru',
          limit: 1,
        },
        timeout: 5000,
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const address = {
          formatted: result.formatted,
          city: result.components.city || result.components.town || result.components.village,
          street: result.components.road,
          house: result.components.house_number,
          postalCode: result.components.postcode,
          country: result.components.country,
        };
        
        await cacheSet(cacheKey, address, 86400);
        return address;
      }
      
      return null;
    } catch (error) {
      logger.error('Reverse geocoding failed:', error);
      return null;
    }
  }
  
  async getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  async getMapboxStaticMap(lat, lng, zoom = 13, width = 600, height = 400) {
    if (!this.mapboxToken) return null;
    
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${this.mapboxToken}`;
  }
  
  async getSuggestions(query) {
    if (!this.mapboxToken) return [];
    
    try {
      const response = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json', {
        params: {
          access_token: this.mapboxToken,
          language: 'ru',
          limit: 5,
          types: 'address,poi',
        },
        timeout: 3000,
      });
      
      return response.data.features.map((feature) => ({
        id: feature.id,
        text: feature.place_name,
        lat: feature.center[1],
        lng: feature.center[0],
        category: feature.properties.category,
      }));
    } catch (error) {
      logger.error('Mapbox suggestions failed:', error);
      return [];
    }
  }
}

module.exports = new GeocodingService();