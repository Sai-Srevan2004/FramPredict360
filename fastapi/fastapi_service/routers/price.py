from fastapi import APIRouter, HTTPException
from fastapi_service.models.schemas import PricePredictionRequest
from fastapi_service.services.price_service import predict_prices, get_telangana_districts, get_markets_for_district

router = APIRouter()

@router.post("/predict", response_model=None)
async def predict_price(request: PricePredictionRequest):
    """
    Predict crop prices for a specific district, market, and crop in Telangana.
    Provides 1-week historical analysis + tomorrow's prediction + 7-day forecast.
    """
    try:
        result = await predict_prices(request.district, request.market, request.crop)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price prediction failed: {str(e)}")

@router.get("/districts")
def get_districts():
    return {"districts": get_telangana_districts()}

@router.get("/markets/{district}")
def get_markets(district: str):
    return {"markets": get_markets_for_district(district)}

@router.get("/crops")
def get_crops():
    return {
        "crops": [
            "Tomato", "Onion", "Potato", "Brinjal", "Cabbage",
            "Cauliflower", "Bitter Gourd", "Lady Finger", "Chilli",
            "Rice", "Wheat", "Maize", "Cotton", "Soybean", "Groundnut",
            "Turmeric", "Sugarcane", "Paddy", "Jowar", "Bajra",
            "Bengal Gram", "Green Gram", "Black Gram", "Castor",
            "Sunflower", "Banana", "Mango"
        ]
    }
