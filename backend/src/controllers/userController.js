const User = require('../models/User');
const Gift = require('../models/Gift');
const { logger } = require('../monitoring/logger');
const { AppError } = require('../middleware/errorHandler');
const { cacheDel } = require('../config/redis');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }
    
    const user = await User.create({ email, password, name });
    const token = User.generateToken(user);
    
    logger.info('User registered', { userId: user.id, email });
    
    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.validatePassword(email, password);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    const token = User.generateToken(user);
    
    logger.info('User logged in', { userId: user.id, email });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { giftId } = req.params;
    
    // Check if gift exists
    const gift = await Gift.findById(giftId);
    if (!gift) {
      throw new AppError('Gift not found', 404);
    }
    
    await User.addFavorite(req.user.id, giftId);
    
    // Clear cache
    await cacheDel(`user:favorites:${req.user.id}`);
    
    logger.info('Favorite added', { userId: req.user.id, giftId });
    
    res.json({ message: 'Favorite added successfully' });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { giftId } = req.params;
    
    await User.removeFavorite(req.user.id, giftId);
    
    // Clear cache
    await cacheDel(`user:favorites:${req.user.id}`);
    
    logger.info('Favorite removed', { userId: req.user.id, giftId });
    
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await User.getFavorites(req.user.id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
};