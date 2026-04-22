const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/validateEnv');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { email, password, name } = userData;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO users (id, email, password_hash, name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, name, created_at`,
      [id, email, hashedPassword, name]
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT id, email, name, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    return user;
  }
  
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      config.get('jwt.secret'),
      { expiresIn: config.get('jwt.expiresIn') }
    );
  }
  
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.get('jwt.secret'));
      return await this.findById(decoded.id);
    } catch (error) {
      return null;
    }
  }
  
  static async addFavorite(userId, giftId) {
    await query(
      `INSERT INTO user_favorites (user_id, gift_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, gift_id) DO NOTHING`,
      [userId, giftId]
    );
  }
  
  static async removeFavorite(userId, giftId) {
    await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND gift_id = $2',
      [userId, giftId]
    );
  }
  
  static async getFavorites(userId) {
    const result = await query(
      `SELECT g.* FROM gifts g
       JOIN user_favorites uf ON uf.gift_id = g.id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = User;