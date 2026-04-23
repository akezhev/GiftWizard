const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class QuizResult {
  static async create(quizData) {
    const id = uuidv4();
    const { userId, answers, recommendations } = quizData;
    
    const result = await query(
      `INSERT INTO quiz_results (id, user_id, answers, recommendations, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, created_at`,
      [id, userId || null, JSON.stringify(answers), JSON.stringify(recommendations)]
    );
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM quiz_results WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async findByUserId(userId, limit = 10) {
    const result = await query(
      `SELECT id, answers, recommendations, created_at
       FROM quiz_results
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
  
  static async getCachedRecommendations(answers) {
    const { age, gender, hobby, zodiac } = answers;
    
    // Check for exact match in last 24 hours
    const result = await query(
      `SELECT recommendations, created_at
       FROM quiz_results
       WHERE answers->>'age' = $1
         AND answers->>'gender' = $2
         AND answers->>'hobby' = $3
         AND answers->>'zodiac' = $4
         AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      [age.toString(), gender, hobby, zodiac]
    );
    
    return result.rows[0];
  }
  
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_quizzes,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(EXTRACT(EPOCH FROM (created_at - answers->>'timestamp'::timestamp))) as avg_completion_time,
        DATE(created_at) as date,
        COUNT(*) as daily_count
      FROM quiz_results
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    return result.rows;
  }
  
  static async deleteOldResults(days = 30) {
    const result = await query(
      'DELETE FROM quiz_results WHERE created_at < NOW() - INTERVAL $1 days RETURNING id',
      [days]
    );
    return result.rowCount;
  }
}

module.exports = QuizResult;