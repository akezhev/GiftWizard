const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, quizSchema } = require('../middleware/validation');
const { mediumLimiter } = require('../middleware/rateLimiter');

router.post('/generate', mediumLimiter, optionalAuth, validate(quizSchema), quizController.generateRecommendations);
router.get('/result/:id', optionalAuth, quizController.getQuizResult);
router.get('/user/quizzes', authenticate, quizController.getUserQuizzes);
router.get('/stats', quizController.getQuizStats);

module.exports = router;