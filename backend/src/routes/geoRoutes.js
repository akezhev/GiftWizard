const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');
const { relaxedLimiter } = require('../middleware/rateLimiter');

router.get('/nearby', relaxedLimiter, geoController.getNearbyStores);
router.get('/stores/:id', relaxedLimiter, geoController.getStoreDetails);
router.post('/stores/products', relaxedLimiter, geoController.getStoreProducts);
router.get('/geocode', relaxedLimiter, geoController.geocodeAddress);
router.get('/reverse', relaxedLimiter, geoController.reverseGeocode);
router.get('/map', relaxedLimiter, geoController.getMapImage);

module.exports = router;