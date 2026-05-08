from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_service.routers import crop, disease
from fastapi_service.routers import price

app = FastAPI(
    title="FarmPredict 360 AI Service",
    description="LangChain + Groq powered agricultural intelligence API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop.router, prefix="/api/crop", tags=["Crop Prediction"])
app.include_router(price.router, prefix="/api/price", tags=["Price Prediction"])
app.include_router(disease.router, prefix="/api/disease", tags=["Disease Detection"])

@app.get("/")
def root():
    return {"message": "FarmPredict 360 AI Service Running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
