const express = require('express');
const router = express.Router();
const { predictCrop, getHistory, getSoilTypes, getCommonCrops } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

router.post('/predict', protect, predictCrop);
router.get('/history', protect, getHistory);
router.get('/soil-types', protect, getSoilTypes);
router.get('/common-crops', protect, getCommonCrops);

module.exports = router;
