const axios = require('axios');
const CropPrediction = require('../models/CropPrediction');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// POST /api/crop/predict
exports.predictCrop = async (req, res) => {
  const response = await axios.post(`${FASTAPI_URL}/api/crop/predict`, req.body, {
    timeout: 60000
  });

  const result = response.data;

  // Save prediction to history
  await CropPrediction.create({
    user: req.user._id,
    input: req.body,
    result
  });

  res.json({ success: true, data: result });
};

// GET /api/crop/history
exports.getHistory = async (req, res) => {
  const history = await CropPrediction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, data: history });
};

// GET /api/crop/soil-types
exports.getSoilTypes = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/crop/soil-types`);
  res.json({ success: true, data: response.data });
};

// GET /api/crop/common-crops
exports.getCommonCrops = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/crop/common-crops`);
  res.json({ success: true, data: response.data });
};
