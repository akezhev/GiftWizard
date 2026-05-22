const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { relaxedLimiter } = require('../middleware/rateLimiter');

router.get('/gifts', relaxedLimiter, searchController.searchGifts);
router.get('/gifts/popular', relaxedLimiter, searchController.getPopularGifts);
router.get('/gifts/:id', relaxedLimiter, searchController.getGiftDetails);
router.get('/categories', relaxedLimiter, searchController.getCategories);

module.exports = router;