const mongoose = require('mongoose');

const cropPredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  input: {
    latitude: Number,
    longitude: Number,
    soil_type: String,
    previous_crop: String,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    ph_level: Number,
    organic_matter: Number
  },
  result: {
    top_recommendations: [mongoose.Schema.Types.Mixed],
    weather_summary: mongoose.Schema.Types.Mixed,
    soil_health_score: Number,
    ai_analysis: String,
    season: String,
    location_name: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropPrediction', cropPredictionSchema);
