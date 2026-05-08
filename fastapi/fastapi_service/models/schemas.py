from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class PredictionMode(str, Enum):
    recommend = "recommend"
    analyze = "analyze"

class CropPredictionRequest(BaseModel):
    latitude: float = Field(..., example=17.385)
    longitude: float = Field(..., example=78.486)
    soil_type: str = Field(..., example="Loamy")
    previous_crop: str = Field(..., example="Wheat")
    nitrogen: float = Field(..., ge=0, le=200, example=45)
    phosphorus: float = Field(..., ge=0, le=200, example=25)
    potassium: float = Field(..., ge=0, le=200, example=75)
    ph_level: float = Field(..., ge=0, le=14, example=6.5)
    organic_matter: float = Field(..., ge=0, le=10, example=2.0)
    mode: PredictionMode = PredictionMode.recommend

class CropRecommendation(BaseModel):
    crop_name: str
    confidence: float
    reason: str
    expected_yield: str
    best_sowing_time: str
    water_requirement: str
    fertilizer_tips: str

class CropPredictionResponse(BaseModel):
    top_recommendations: List[CropRecommendation]
    weather_summary: dict
    soil_health_score: float
    ai_analysis: str
    season: str
    location_name: str

class PricePredictionRequest(BaseModel):
    district: str = Field(..., example="Hyderabad")
    market: str = Field(..., example="Bowenpally")
    crop: str = Field(..., example="Tomato")

class DailyPrice(BaseModel):
    date: str
    min_price: float
    max_price: float
    modal_price: float

class PricePredictionResponse(BaseModel):
    crop: str
    district: str
    market: str
    historical_prices: List[DailyPrice]
    tomorrow_prediction: DailyPrice
    week_forecast: List[DailyPrice]
    trend: str
    price_insight: str
    recommendation: str

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence: float
    severity: str
    affected_area: str
    description: str
    treatment: List[str]
    prevention: List[str]
    organic_remedies: List[str]
    ai_analysis: str
