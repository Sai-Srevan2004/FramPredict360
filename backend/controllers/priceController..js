const axios = require('axios');
const PricePrediction = require('../models/PricePrediction');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// POST /api/price/predict
exports.predictPrice = async (req, res) => {
  const { district, market, crop } = req.body;

  const response = await axios.post(`${FASTAPI_URL}/api/price/predict`, { district, market, crop }, {
    timeout: 60000
  });

  const result = response.data;

  // Save to history
  const prediction = await PricePrediction.create({
    user: req.user._id,
    input: { district, market, crop },
    result
  });

  // Emit real-time alert via Socket.IO if price spike detected
  const io = req.app.get('io');
  if (io && result.trend === 'Bullish') {
    const roomName = `price_${crop}_${district}`;
    io.to(roomName).emit('price_alert', {
      type: 'PRICE_SPIKE',
      crop,
      district,
      market,
      tomorrow: result.tomorrow_prediction,
      trend: result.trend,
      message: `🚨 Price Alert: ${crop} prices trending UP in ${district}!`,
      timestamp: new Date()
    });
  }

  res.json({ success: true, data: result });
};

// GET /api/price/history
exports.getHistory = async (req, res) => {
  const history = await PricePrediction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, data: history });
};

// GET /api/price/districts
exports.getDistricts = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/price/districts`);
  res.json({ success: true, data: response.data });
};

// GET /api/price/markets/:district
exports.getMarkets = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/price/markets/${req.params.district}`);
  res.json({ success: true, data: response.data });
};

// GET /api/price/crops
exports.getCrops = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/price/crops`);
  res.json({ success: true, data: response.data });
};
