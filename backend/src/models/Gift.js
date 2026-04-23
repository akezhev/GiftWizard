const { query } = require('../config/database');
const { indexGift, searchGifts } = require('../config/elasticsearch');
const { cacheGet, cacheSet } = require('../config/redis');

class Gift {
  static async create(giftData) {
    const {
      name, description, category, price, oldPrice,
      image, rating, tags, isPopular, discount, available,
    } = giftData;
    
    const result = await query(
      `INSERT INTO gifts (name, description, category, price, old_price,
        image, rating, tags, is_popular, discount, available, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [name, description, category, price, oldPrice, image,
       rating || 4.5, tags || [], isPopular || false, discount || 0, available !== false]
    );
    
    const gift = result.rows[0];
    
    // Index in Elasticsearch
    await indexGift(gift);
    
    return gift;
  }
  
  static async findById(id) {
    // Try cache first
    const cached = await cacheGet(`gift:${id}`);
    if (cached) return cached;
    
    const result = await query('SELECT * FROM gifts WHERE id = $1', [id]);
    const gift = result.rows[0];
    
    if (gift) {
      await cacheSet(`gift:${id}`, gift, 3600);
    }
    
    return gift;
  }
  
  static async findAll(filters = {}) {
    const { category, minPrice, maxPrice, sortBy, limit = 20, offset = 0 } = filters;
    
    let sql = 'SELECT * FROM gifts WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (minPrice) {
      sql += ` AND price >= $${paramIndex++}`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      sql += ` AND price <= $${paramIndex++}`;
      params.push(maxPrice);
    }
    
    // Sorting
    switch (sortBy) {
      case 'price_asc':
        sql += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY rating DESC';
        break;
      default:
        sql += ' ORDER BY is_popular DESC, rating DESC';
    }
    
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) FROM gifts WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    
    if (category && category !== 'all') {
      countSql += ` AND category = $${countIndex++}`;
      countParams.push(category);
    }
    
    if (minPrice) {
      countSql += ` AND price >= $${countIndex++}`;
      countParams.push(minPrice);
    }
    
    if (maxPrice) {
      countSql += ` AND price <= $${countIndex++}`;
      countParams.push(maxPrice);
    }
    
    const countResult = await query(countSql, countParams);
    
    return {
      items: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    };
  }
  
  static async search(query, filters = {}) {
    // Use Elasticsearch for full-text search
    const esResults = await searchGifts(query, filters);
    
    if (esResults.hits.length === 0) {
      // Fallback to PostgreSQL search
      return this.fallbackSearch(query, filters);
    }
    
    return esResults;
  }
  
  static async fallbackSearch(searchQuery, filters = {}) {
    let sql = `
      SELECT *, 
        ts_rank_cd(to_tsvector('russian', name || ' ' || description), plainto_tsquery('russian', $1)) as rank
      FROM gifts
      WHERE to_tsvector('russian', name || ' ' || description) @@ plainto_tsquery('russian', $1)
    `;
    const params = [searchQuery];
    let paramIndex = 2;
    
    if (filters.category && filters.category !== 'all') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    
    sql += ' ORDER BY rank DESC, rating DESC LIMIT 20';
    
    const result = await query(sql, params);
    
    return {
      total: result.rows.length,
      hits: result.rows,
    };
  }
  
  static async getPopular(limit = 10) {
    // Try cache
    const cached = await cacheGet('popular_gifts');
    if (cached) return cached;
    
    const result = await query(
      `SELECT * FROM gifts 
       WHERE is_popular = true OR rating > 4.5
       ORDER BY rating DESC, created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    await cacheSet('popular_gifts', result.rows, 300); // Cache for 5 minutes
    
    return result.rows;
  }
  
  static async updateRating(giftId, newRating) {
    const result = await query(
      `UPDATE gifts 
       SET rating = (rating * review_count + $2) / (review_count + 1),
           review_count = review_count + 1
       WHERE id = $1
       RETURNING *`,
      [giftId, newRating]
    );
    
    // Update cache
    const gift = result.rows[0];
    if (gift) {
      await cacheSet(`gift:${giftId}`, gift, 3600);
    }
    
    return gift;
  }
}

module.exports = Gift;