const { query } = require('../config/database');
const { cacheGet, cacheSet } = require('../config/redis');

class Marketplace {
  static async create(storeData) {
    const {
      name, address, lat, lng, phone, website, hours, products,
    } = storeData;
    
    const result = await query(
      `INSERT INTO marketplaces (name, address, location, phone, website, hours, products, created_at)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, NOW())
       RETURNING id, name, address, ST_X(location) as lng, ST_Y(location) as lat, phone, website, hours, products`,
      [name, address, lng, lat, phone, website, JSON.stringify(hours), products || []]
    );
    
    return result.rows[0];
  }
  
  static async findNearby(lat, lng, radiusKm = 5, limit = 50) {
    const cacheKey = `nearby:${lat}:${lng}:${radiusKm}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    
    const result = await query(
      `SELECT 
        id, name, address, phone, website, hours, products,
        ST_X(location) as lng,
        ST_Y(location) as lat,
        ST_DistanceSphere(location, ST_MakePoint($1, $2)) as distance
       FROM marketplaces
       WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3 * 1000)
       ORDER BY distance
       LIMIT $4`,
      [lng, lat, radiusKm, limit]
    );
    
    const stores = result.rows;
    await cacheSet(cacheKey, stores, 300); // Cache for 5 minutes
    
    return stores;
  }
  
  static async findById(id) {
    const result = await query(
      `SELECT 
        id, name, address, phone, website, hours, products,
        ST_X(location) as lng,
        ST_Y(location) as lat
       FROM marketplaces
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }
  
  static async findProductsInStock(productIds) {
    const result = await query(
      `SELECT 
        m.id, m.name, m.address, m.phone, m.website,
        ST_X(m.location) as lng,
        ST_Y(m.location) as lat,
        array_agg(p.product_id) as available_products
       FROM marketplaces m,
       UNNEST(m.products) AS p(product_id)
       WHERE p.product_id = ANY($1::text[])
       GROUP BY m.id
       ORDER BY array_length(array_agg(p.product_id), 1) DESC`,
      [productIds]
    );
    return result.rows;
  }
  
  static async updateProducts(storeId, products) {
    const result = await query(
      `UPDATE marketplaces 
       SET products = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [storeId, products]
    );
    return result.rows[0];
  }
  
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_stores,
        COUNT(DISTINCT products) as total_products,
        AVG(products_count) as avg_products_per_store
      FROM (
        SELECT id, array_length(products, 1) as products_count
        FROM marketplaces
      ) subquery
    `);
    return result.rows[0];
  }
}

module.exports = Marketplace;