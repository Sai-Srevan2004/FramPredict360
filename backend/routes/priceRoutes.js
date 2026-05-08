const express = require('express');
const router = express.Router();
const { predictPrice, getHistory, getDistricts, getMarkets, getCrops } = require('../controllers/priceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/predict', protect, predictPrice);
router.get('/history', protect, getHistory);
router.get('/districts', protect, getDistricts);
router.get('/markets/:district', protect, getMarkets);
router.get('/crops', protect, getCrops);

module.exports = router;
