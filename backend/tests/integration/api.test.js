const request = require('supertest');
const app = require('../../src/app');

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('uptime');
    });
  });
  
  describe('POST /api/quiz/generate', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/quiz/generate')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.errors).toBeDefined();
    });
    
    test('should generate recommendations with valid data', async () => {
      const quizData = {
        age: 25,
        gender: 'male',
        hobby: 'спорт',
        zodiac: 'Лев',
        occasion: 'День рождения',
        budget: '3000-5000 ₽',
        interests: ['технологии', 'музыка'],
        relationship: 'friend',
      };
      
      const response = await request(app)
        .post('/api/quiz/generate')
        .send(quizData)
        .expect(200);
      
      expect(response.body).toHaveProperty('gifts');
      expect(Array.isArray(response.body.gifts)).toBe(true);
    });
  });
});