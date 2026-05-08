import os
import httpx
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from dotenv import load_dotenv
import json

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.3
)

async def fetch_weather(latitude: float, longitude: float) -> dict:
    """Fetch current weather data for given coordinates."""
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}&units=metric"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            data = response.json()
            return {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "wind_speed": data["wind"]["speed"],
                "rainfall": data.get("rain", {}).get("1h", 0),
                "location_name": f"{data.get('name', 'Unknown')}, India",
                "feels_like": data["main"]["feels_like"],
                "pressure": data["main"]["pressure"]
            }
    except Exception as e:
        return {
            "temperature": 28,
            "humidity": 65,
            "description": "partly cloudy",
            "wind_speed": 10,
            "rainfall": 0,
            "location_name": "Telangana, India",
            "feels_like": 30,
            "pressure": 1013
        }

async def get_forecast_weather(latitude: float, longitude: float) -> list:
    """Fetch 5-day weather forecast."""
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}&units=metric&cnt=5"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            data = response.json()
            forecasts = []
            for item in data.get("list", [])[:5]:
                forecasts.append({
                    "temp": item["main"]["temp"],
                    "humidity": item["main"]["humidity"],
                    "description": item["weather"][0]["description"],
                    "dt_txt": item["dt_txt"]
                })
            return forecasts
    except Exception:
        return []

async def predict_crops(request_data: dict) -> dict:
    """Use LangChain + Groq to predict best crops."""
    weather = await fetch_weather(request_data["latitude"], request_data["longitude"])
    forecast = await get_forecast_weather(request_data["latitude"], request_data["longitude"])

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an expert agricultural advisor specializing in Indian farming, 
        particularly for Telangana and Andhra Pradesh regions. You analyze soil conditions, 
        weather data, and farming history to recommend the best crops.
        
        Always respond in valid JSON format only. No extra text."""),
        ("human", """Based on the following data, recommend the top 3 most suitable crops:

SOIL DATA:
- Soil Type: {soil_type}
- Previous Crop: {previous_crop}
- Nitrogen (N): {nitrogen} kg/ha
- Phosphorus (P): {phosphorus} kg/ha
- Potassium (K): {potassium} kg/ha
- pH Level: {ph_level}
- Organic Matter: {organic_matter}%

WEATHER CONDITIONS:
- Temperature: {temperature}°C (feels like {feels_like}°C)
- Humidity: {humidity}%
- Description: {weather_description}
- Rainfall: {rainfall} mm/hr
- Wind Speed: {wind_speed} km/h

LOCATION: {location_name} (Lat: {latitude}, Lon: {longitude})
FORECAST: {forecast_summary}

Respond ONLY with this JSON structure:
{{
  "top_recommendations": [
    {{
      "crop_name": "string",
      "confidence": 0.95,
      "reason": "detailed reason",
      "expected_yield": "X-Y tons/acre",
      "best_sowing_time": "month/season",
      "water_requirement": "low/medium/high - X mm/week",
      "fertilizer_tips": "specific tips"
    }}
  ],
  "soil_health_score": 7.5,
  "ai_analysis": "comprehensive analysis paragraph",
  "season": "Kharif/Rabi/Zaid"
}}
""")
    ])

    forecast_summary = " | ".join([f"{f['dt_txt']}: {f['temp']}°C, {f['description']}" for f in forecast[:3]]) if forecast else "No forecast data"

    chain = prompt_template | llm

    result = chain.invoke({
        "soil_type": request_data["soil_type"],
        "previous_crop": request_data["previous_crop"],
        "nitrogen": request_data["nitrogen"],
        "phosphorus": request_data["phosphorus"],
        "potassium": request_data["potassium"],
        "ph_level": request_data["ph_level"],
        "organic_matter": request_data["organic_matter"],
        "temperature": weather["temperature"],
        "feels_like": weather["feels_like"],
        "humidity": weather["humidity"],
        "weather_description": weather["description"],
        "rainfall": weather["rainfall"],
        "wind_speed": weather["wind_speed"],
        "location_name": weather["location_name"],
        "latitude": request_data["latitude"],
        "longitude": request_data["longitude"],
        "forecast_summary": forecast_summary
    })

    raw_content = result.content.strip()
    # Clean up if wrapped in markdown code blocks
    if raw_content.startswith("```"):
        raw_content = raw_content.split("```")[1]
        if raw_content.startswith("json"):
            raw_content = raw_content[4:]
    raw_content = raw_content.strip()

    parsed = json.loads(raw_content)
    parsed["weather_summary"] = weather
    parsed["location_name"] = weather["location_name"]

    return parsed
