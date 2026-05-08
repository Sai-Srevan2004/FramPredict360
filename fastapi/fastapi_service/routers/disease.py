from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi_service.services.disease_service import analyze_disease
import numpy as np
from PIL import Image
import io
import tensorflow as tf

router = APIRouter()

# ── Load model once at startup ────────────────────────────────────────────────
MODEL = None
CLASS_NAMES = [
    'Bacterial Leaf Blight',
    'Brown Spot',
    'Healthy Rice Leaf',
    'Leaf Blast',
    'Leaf Scald',
    'Sheath Blight'
]

def load_model():
    global MODEL
    if MODEL is None:
        MODEL = tf.keras.models.load_model("rice_disease_model.keras")
        print("✅ Rice disease CNN model loaded")
    return MODEL

def predict_disease(image_bytes: bytes):
    """Preprocess image and run CNN inference."""
    model = load_model()

    # Open image with Pillow
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Resize to 128x128 — matches your training size
    img = img.resize((128, 128))

    # Convert to numpy array
    img_array = np.array(img, dtype=np.float32)

    # Add batch dimension → (1, 128, 128, 3)
    img_array = np.expand_dims(img_array, axis=0)

    # Run prediction
    predictions = model.predict(img_array, verbose=0)

    # Apply softmax to convert logits to probabilities
    probabilities = tf.nn.softmax(predictions[0]).numpy()

    # Get top prediction
    predicted_index = int(np.argmax(probabilities))
    confidence = float(probabilities[predicted_index])
    disease_name = CLASS_NAMES[predicted_index]

    return disease_name, confidence

# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/detect")
async def detect_disease(
    file: UploadFile = File(...),
    crop_type: str = Form(default="Rice")
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    try:
        image_bytes = await file.read()

        # Run CNN model
        disease_name, confidence = predict_disease(image_bytes)

        # Handle healthy result
        if disease_name == "Healthy Rice Leaf":
            return {
                "disease_name": "Healthy Rice Leaf",
                "confidence": confidence,
                "severity": "None",
                "affected_area": "0%",
                "description": "The rice plant appears healthy. No disease detected.",
                "treatment": ["No treatment required"],
                "prevention": [
                    "Continue regular field monitoring every 5 to 7 days",
                    "Maintain proper water management and drainage",
                    "Follow balanced fertilizer schedule based on soil test"
                ],
                "organic_remedies": [
                    "Apply Panchagavya 3% foliar spray monthly as growth promoter"
                ],
                "ai_analysis": (
                    "The leaf image shows no signs of any of the six detectable rice diseases. "
                    "The plant appears healthy with normal coloration. Continue standard rice "
                    "crop management practices and monitor regularly during the growing season."
                ),
                "crop_type": crop_type
            }

        # Get LangChain AI treatment advisory for detected disease
        analysis = await analyze_disease(disease_name, confidence, crop_type)
        analysis["disease_name"] = disease_name
        analysis["confidence"] = confidence
        analysis["crop_type"] = crop_type

        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Disease detection failed: {str(e)}"
        )

@router.get("/supported-crops")
def get_supported_crops():
    return {
        "crops": ["Rice"],
        "note": "Current model supports Rice disease detection only"
    }

@router.get("/disease-classes")
def get_disease_classes():
    return {
        "classes": CLASS_NAMES,
        "total": len(CLASS_NAMES)
    }