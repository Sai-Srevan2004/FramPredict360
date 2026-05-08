const express = require('express');
const router = express.Router();
const { detectDisease, getSupportedCrops, uploadMiddleware } = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/detect', protect, uploadMiddleware, detectDisease);
router.get('/supported-crops', protect, getSupportedCrops);


module.exports = router;
