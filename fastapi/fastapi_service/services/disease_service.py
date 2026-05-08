import os
import json
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.2
)

async def analyze_disease(disease_name: str, confidence: float, crop_type: str = "Rice") -> dict:
    """Generate treatment advisory for detected rice disease using LangChain + Groq."""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are a plant pathologist and agricultural expert 
        specialising in rice crop diseases in Telangana and Andhra Pradesh, India. 
        You provide accurate, practical treatment advice for rice farmers.
        Always respond in valid JSON only. No extra text."""),
        ("human", """A rice leaf image was analysed by a CNN model.

DETECTED DISEASE: {disease_name}
CONFIDENCE: {confidence:.1f}%
CROP: {crop_type}

Provide a complete disease advisory.

Respond ONLY with this JSON:
{{
  "description": "What this disease is, how it spreads, and impact on rice yield",
  "severity": "Mild/Moderate/Severe",
  "affected_area": "estimated percentage like 20-35%",
  "treatment": [
    "Chemical treatment 1 with exact dosage in g/litre or ml/litre",
    "Chemical treatment 2 with exact dosage",
    "Biological treatment option"
  ],
  "prevention": [
    "Prevention measure 1",
    "Prevention measure 2",
    "Prevention measure 3"
  ],
  "organic_remedies": [
    "Organic remedy 1 specific to Telangana farming",
    "Organic remedy 2",
    "Organic remedy 3"
  ],
  "ai_analysis": "3-4 sentences covering disease urgency, spread risk, expected recovery timeline, and economic impact on rice yield"
}}""")
    ])

    chain = prompt_template | llm
    result = chain.invoke({
        "disease_name": disease_name,
        "confidence": confidence * 100,
        "crop_type": crop_type
    })

    raw = result.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)