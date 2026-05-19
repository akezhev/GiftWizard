const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate, userSchema, loginSchema } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(userSchema), userController.register);
router.post('/login', authLimiter, validate(loginSchema), userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.post('/favorites/:giftId', authenticate, userController.addFavorite);
router.delete('/favorites/:giftId', authenticate, userController.removeFavorite);
router.get('/favorites', authenticate, userController.getFavorites);

module.exports = router;