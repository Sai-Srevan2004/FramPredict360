import os
import httpx
import json
from datetime import datetime, timedelta
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import random

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.2
)

# Telangana markets data
TELANGANA_MARKETS = {
    "Hyderabad": ["Bowenpally", "L.B.Nagar", "Gudimalkapur", "Markets of Hyderabad"],
    "Warangal": ["Warangal", "Hanamkonda"],
    "Nizamabad": ["Nizamabad", "Bodhan"],
    "Karimnagar": ["Karimnagar", "Huzurabad"],
    "Khammam": ["Khammam", "Kothagudem"],
    "Nalgonda": ["Nalgonda", "Miryalaguda"],
    "Mahbubnagar": ["Mahbubnagar", "Jadcherla"],
    "Medak": ["Medak", "Sangareddy"],
    "Adilabad": ["Adilabad", "Mancherial"],
    "Rangareddy": ["Shadnagar", "Tandur"]
}

# Base price ranges for common crops (in INR/quintal) - realistic Telangana market prices
CROP_BASE_PRICES = {
    "Tomato": (800, 3500),
    "Onion": (600, 2800),
    "Potato": (700, 2000),
    "Rice": (1800, 2800),
    "Wheat": (1900, 2500),
    "Cotton": (5500, 7500),
    "Maize": (1400, 2000),
    "Soybean": (3500, 4800),
    "Groundnut": (4500, 6500),
    "Sugarcane": (280, 380),
    "Turmeric": (6000, 14000),
    "Chilli": (5000, 15000),
    "Brinjal": (400, 1800),
    "Cabbage": (300, 1200),
    "Cauliflower": (400, 1800),
    "Bitter Gourd": (800, 2500),
    "Lady Finger": (600, 2000),
    "Jowar": (1500, 2200),
    "Bajra": (1400, 2100),
    "Sunflower": (4500, 6000),
    "Paddy": (1800, 2800),
    "Bengal Gram": (4500, 6000),
    "Green Gram": (6000, 8500),
    "Black Gram": (5500, 7500),
    "Castor": (4000, 6500),
    "Banana": (800, 2500),
    "Mango": (2000, 8000),
}

def get_base_price(crop: str):
    """Get base price range for crop, use defaults if not found."""
    for key in CROP_BASE_PRICES:
        if key.lower() in crop.lower() or crop.lower() in key.lower():
            return CROP_BASE_PRICES[key]
    return (1000, 4000)

def generate_historical_prices(crop: str, days: int = 7) -> list:
    """Generate realistic historical prices with market fluctuations."""
    base_min, base_max = get_base_price(crop)
    prices = []
    
    # Add seasonal variation and trend
    trend_factor = random.choice([-1, 1]) * random.uniform(0.01, 0.03)
    volatility = 0.08
    
    current_min = base_min * random.uniform(0.85, 1.15)
    current_max = base_max * random.uniform(0.85, 1.15)
    
    for i in range(days, 0, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Apply trend and volatility
        noise = random.gauss(0, volatility)
        current_min = current_min * (1 + trend_factor + noise)
        current_max = current_max * (1 + trend_factor + noise * 0.8)
        
        # Ensure min < max and prices are positive
        min_price = max(100, min(current_min, current_max) * 0.95)
        max_price = max(min_price + 50, max(current_min, current_max))
        modal_price = (min_price + max_price) / 2 * random.uniform(0.92, 1.05)
        
        prices.append({
            "date": date,
            "min_price": round(min_price, 2),
            "max_price": round(max_price, 2),
            "modal_price": round(modal_price, 2)
        })
    
    return prices

async def predict_prices(district: str, market: str, crop: str) -> dict:
    """Use LangChain + Groq to predict crop prices with historical context."""
    historical_prices = generate_historical_prices(crop, 7)
    
    # Format historical data for LLM
    history_text = "\n".join([
        f"  {p['date']}: Min=₹{p['min_price']}/q, Max=₹{p['max_price']}/q, Modal=₹{p['modal_price']}/q"
        for p in historical_prices
    ])
    
    # Calculate trends
    recent_modal = [p['modal_price'] for p in historical_prices[-3:]]
    older_modal = [p['modal_price'] for p in historical_prices[:3]]
    avg_recent = sum(recent_modal) / len(recent_modal)
    avg_older = sum(older_modal) / len(older_modal)
    trend_pct = ((avg_recent - avg_older) / avg_older) * 100

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an expert agricultural market analyst for Telangana state, India. 
        You analyze market price trends and provide accurate forecasts for agricultural commodities.
        You know Telangana's agricultural seasons, local market dynamics, government MSP policies, 
        and regional demand patterns.
        
        Always respond in valid JSON only. No preamble or extra text."""),
        ("human", """Analyze the following market data and predict prices:

CROP: {crop}
DISTRICT: {district}, Telangana
MARKET: {market}
TODAY'S DATE: {today}

HISTORICAL PRICES (Last 7 Days) in INR per Quintal:
{history}

TREND: {trend_direction} ({trend_pct:.1f}% change over week)

Based on:
1. Historical price trend analysis
2. Seasonal patterns in Telangana for {crop}
3. Supply-demand dynamics
4. Post-harvest timing considerations
5. Government MSP and market regulations

Provide tomorrow's predicted price AND 7-day forecast.

Respond ONLY with this exact JSON:
{{
  "tomorrow_prediction": {{
    "date": "YYYY-MM-DD",
    "min_price": 1234.56,
    "max_price": 1567.89,
    "modal_price": 1400.00
  }},
  "week_forecast": [
    {{
      "date": "YYYY-MM-DD",
      "min_price": 1234.56,
      "max_price": 1567.89,
      "modal_price": 1400.00
    }}
  ],
  "trend": "Bullish/Bearish/Stable",
  "price_insight": "2-3 sentences about why prices are moving this way",
  "recommendation": "Specific actionable advice for farmers/traders - whether to sell now, hold, or when to sell for maximum profit"
}}

The week_forecast array must have exactly 7 entries for the next 7 days.
""")
    ])

    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    trend_direction = "Upward" if trend_pct > 1 else "Downward" if trend_pct < -1 else "Stable"

    chain = prompt_template | llm
    result = chain.invoke({
        "crop": crop,
        "district": district,
        "market": market,
        "today": datetime.now().strftime("%Y-%m-%d"),
        "history": history_text,
        "trend_direction": trend_direction,
        "trend_pct": trend_pct
    })

    raw_content = result.content.strip()
    if raw_content.startswith("```"):
        raw_content = raw_content.split("```")[1]
        if raw_content.startswith("json"):
            raw_content = raw_content[4:]
    raw_content = raw_content.strip()

    parsed = json.loads(raw_content)
    parsed["crop"] = crop
    parsed["district"] = district
    parsed["market"] = market
    parsed["historical_prices"] = historical_prices

    return parsed

def get_telangana_districts():
    return list(TELANGANA_MARKETS.keys())

def get_markets_for_district(district: str):
    return TELANGANA_MARKETS.get(district, [district])
