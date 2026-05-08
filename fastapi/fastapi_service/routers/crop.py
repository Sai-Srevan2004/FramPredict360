from fastapi import APIRouter, HTTPException
from fastapi_service.models.schemas import CropPredictionRequest, CropPredictionResponse
from fastapi_service.services.crop_service import predict_crops

router = APIRouter()

@router.post("/predict", response_model=None)
async def predict_crop(request: CropPredictionRequest):
    """
    Predict best crops based on soil parameters, location, and weather.
    """
    try:
        result = await predict_crops(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/soil-types")
def get_soil_types():
    return {
        "soil_types": [
            "Loamy", "Sandy", "Clay", "Silty", "Peaty",
            "Chalky", "Black Cotton Soil", "Red Soil",
            "Laterite", "Alluvial", "Sandy Loam"
        ]
    }

@router.get("/common-crops")
def get_common_crops():
    return {
        "crops": [
            "Rice", "Wheat", "Maize", "Jowar", "Bajra", "Cotton",
            "Sugarcane", "Groundnut", "Soybean", "Sunflower",
            "Tomato", "Onion", "Chilli", "Turmeric", "Bengal Gram",
            "Green Gram", "Black Gram", "Castor", "Paddy", "None"
        ]
    }
