const mongoose = require('mongoose');

const pricePredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  input: {
    district: String,
    market: String,
    crop: String
  },
  result: mongoose.Schema.Types.Mixed,
  alertThreshold: {
    enabled: { type: Boolean, default: false },
    minPrice: Number,
    maxPrice: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PricePrediction', pricePredictionSchema);
