const aiService = require('../services/aiService');
const QuizResult = require('../models/QuizResult');
const { cacheGet, cacheSet } = require('../config/redis');
const { logger } = require('../monitoring/logger');
const { AppError } = require('../middleware/errorHandler');

const generateRecommendations = async (req, res, next) => {
  try {
    const answers = req.body;
    const userId = req.user?.id;
    
    // Validate required fields
    const required = ['age', 'gender', 'hobby', 'zodiac', 'occasion', 'budget'];
    for (const field of required) {
      if (!answers[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }
    
    // Check cache first
    const cacheKey = `quiz:${userId || 'anon'}:${JSON.stringify(answers)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info('Quiz result served from cache');
      return res.json({
        source: 'cache',
        gifts: cached.gifts,
        id: cached.id,
      });
    }
    
    // Generate recommendations using AI
    const recommendations = await aiService.generateGiftRecommendations(answers);
    
    // Save to database
    const quizResult = await QuizResult.create({
      userId,
      answers,
      recommendations,
    });
    
    // Cache the result
    await cacheSet(cacheKey, {
      gifts: recommendations,
      id: quizResult.id,
    }, 3600);
    
    // Track analytics
    logger.info('Quiz completed', {
      userId,
      age: answers.age,
      gender: answers.gender,
      occasion: answers.occasion,
      recommendationsCount: recommendations.length,
    });
    
    res.json({
      source: 'ai',
      gifts: recommendations,
      id: quizResult.id,
    });
  } catch (error) {
    next(error);
  }
};

const getQuizResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await QuizResult.findById(id);
    if (!result) {
      throw new AppError('Quiz result not found', 404);
    }
    
    // Check if user owns this result or it's public
    if (result.user_id && result.user_id !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }
    
    res.json({
      id: result.id,
      answers: result.answers,
      recommendations: result.recommendations,
      createdAt: result.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const getUserQuizzes = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { limit = 10, offset = 0 } = req.query;
    const quizzes = await QuizResult.findByUserId(req.user.id, limit);
    
    res.json({
      quizzes,
      total: quizzes.length,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
};

const getQuizStats = async (req, res, next) => {
  try {
    const stats = await QuizResult.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRecommendations,
  getQuizResult,
  getUserQuizzes,
  getQuizStats,
};