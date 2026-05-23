const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authenticate, requireRole } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

router.post('/stores', authenticate, requireRole(['admin']), marketplaceController.createStore);
router.get('/stores', strictLimiter, marketplaceController.getAllStores);
router.put('/stores/:id/products', authenticate, requireRole(['admin', 'merchant']), marketplaceController.updateStoreProducts);
router.get('/stats', authenticate, requireRole(['admin']), marketplaceController.getMarketplaceStats);

module.exports = router;