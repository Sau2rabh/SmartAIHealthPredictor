from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from model import HealthModel

load_dotenv()

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model_name = 'gemini-2.5-flash' # Using 2.5 Flash as requested (standard for 2026)

app = FastAPI(title="AI Health Risk Predictor API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
health_model = HealthModel()

class HospitalFeature(BaseModel):
    id: int
    name: str
    lat: float
    lon: float

class EnhanceInput(BaseModel):
    hospitals: list[HospitalFeature]

class HealthInput(BaseModel):
    age: int
    gender: int  # 0: Female, 1: Male
    bmi: float
    smoking: int # 0/1
    alcohol: int # 0/1
    activity_level: int # 0-2
    # Vitals
    spO2: float
    heart_rate: float
    bp_systolic: float
    # Symptoms (0: None, 1: Mild, 2: Severe)
    fever: int
    cough: int
    fatigue: int
    shortness_breath: int
    taste_smell_loss: int # 0/1
    chest_pain: int
    headache: int
    nausea: int

class ChatInput(BaseModel):
    message: str
    history: list[dict] = []
    user_profile: dict = {}

class ReportAnalysisInput(BaseModel):
    image_data: str # Base64 encoded image or URL

@app.get("/")
def read_root():
    return {"message": "AI Health Risk Predictor API is running"}

@app.post("/predict")
def predict_risk(data: HealthInput):
    try:
        # Check if model is initialized
        if health_model.model is None:
             raise HTTPException(status_code=500, detail="Model is not trained yet. Run /train")
             
        features = [
            data.age, data.gender, data.bmi, data.smoking, data.alcohol,
            data.activity_level, data.spO2, data.heart_rate, data.bp_systolic,
            data.fever, data.cough, data.fatigue, data.shortness_breath,
            data.taste_smell_loss, data.chest_pain, data.headache, data.nausea
        ]
        
        prediction, probability = health_model.predict(features)
        
        risk_labels = ["Low", "Medium", "High"]
        risk_label = risk_labels[prediction]
        
        # Actionable recommendations
        recommendations = []
        if risk_label == "Low":
            recommendations = ["Keep up healthy lifestyle", "Regular exercise", "Drink plenty of water"]
        elif risk_label == "Medium":
            recommendations = ["Consult a doctor for follow-up", "Monitor symptoms daily", "Avoid smoking and alcohol"]
        else: # High
            recommendations = ["Seek immediate medical attention", "Consult specialist", "Rest and follow prescribed medication"]
            
        return {
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_label,
            "recommendations": recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_ai(data: ChatInput):
    try:
        profile_context = ""
        if data.user_profile:
            p = data.user_profile
            profile_context = f"User Profile: Age: {p.get('age')}, BMI: {p.get('bmi')}, Name: {p.get('name')}. "
            if p.get('last_risk'):
                 profile_context += f"Last recorded health risk: {p.get('last_risk')}. "

        context_prompt = f"""
        {profile_context}
        You are 'AI MedGuide', a premium health assistant. 
        Personality: Empathetic, friendly, and highly professional.
        Bhasha: You speak in natural Hinglish (Hindi + English mix).
        Guidelines:
        1. Always start with a warm greeting.
        2. Use the user's profile data (Age, BMI, etc.) if provided to give tailored advice.
        3. If the user is worried, comfort them first: "Chinta mat kijiye, main yahan hoon."
        4. Provide clear, medically-sound advice but always include a disclaimer: "Main AI hoon, kripya dr. se consult karein."
        5. Use simple terms. Avoid jargon.
        6. Current User query: {data.message}
        """
        response = client.models.generate_content(
            model=gemini_model_name,
            contents=context_prompt
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-report")
async def analyze_report(data: ReportAnalysisInput):
    try:
        import base64
        # Assuming data.image_data is base64 string
        image_content = base64.b64decode(data.image_data.split(",")[-1])
        
        prompt = """
        You are a medical lab report analyzer. Analyze the provided image of a medical report.
        1. Extract key markers (e.g., Hemoglobin, Glucose, Cholesterol, etc.) and their values.
        2. Explain if they are within normal range or not.
        3. Provide a simple, easy-to-understand summary.
        4. List 3 potential risks if any value is abnormal.
        5. Suggest 2 immediate lifestyle changes.
        Return the result in a clean, structured Markdown format.
        """
        
        response = client.models.generate_content(
            model=gemini_model_name,
            contents=[
                types.Part.from_bytes(data=image_content, mime_type="image/jpeg"),
                prompt
            ]
        )
        return {"analysis": response.text}
    except Exception as e:
        print(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/wellness-plan")
async def generate_wellness_plan(data: HealthInput):
    try:
        prompt = f"""
        Based on the following health profile:
        - Age: {data.age}, Gender: {'Male' if data.gender == 1 else 'Female'}
        - BMI: {data.bmi}, Activity Level: {data.activity_level}
        - Current Symptoms: Fever({data.fever}), Cough({data.cough}), Fatigue({data.fatigue}), etc.
        
        Generate a comprehensive Wellness Plan including:
        1. Diet Recommendations (Breakfast, Lunch, Dinner, Snacks)
        2. Exercise Regimen (tailored to activity level)
        3. Sleep & Hydration goals
        4. Stress Management tips
        Return as a structured JSON with keys: 'diet', 'exercise', 'vitals_goals', 'tips'.
        """
        response = client.models.generate_content(
            model=gemini_model_name,
            contents=prompt
        )
        
        # Simple extraction
        import json
        import re
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"plan": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train_model():
    try:
        global health_model
        from data_gen import generate_health_data
        data_path = generate_health_data()
        
        # Fresh instance to ensure clean training
        nm = HealthModel()
        report = nm.train(data_path)
        
        # Update current model in memory
        health_model = nm
        
        return {"message": "Model trained successfully. New accuracy logic applied.", "report": str(report)}
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance-hospitals")
async def enhance_hospitals(data: EnhanceInput):
    try:
        hospital_names = [h.name for h in data.hospitals if h.name]
        if not hospital_names:
            return {"enhancements": {}}
            
        prompt = f"""
        Analyze these hospitals (id, name, lat, lon): {data.hospitals}
        Return a JSON object where each key is the hospital ID from the list.
        Each value should be:
        {{
            "name": "Actual hospital name if missing (otherwise the provided name)",
            "specialties": "string listing 3 specialties e.g. Cardiology, Orthopedics",
            "ai_tip": "1-sentence strategic emergency tip",
            "is_24_7": true/false,
            "likely_address": "precise local area/street address based on coordinates"
        }}
        Provide realistic and helpful data. Return ONLY valid JSON.
        """
        
        response = client.models.generate_content(
            model=gemini_model_name,
            contents=prompt
        )
        
        # Simple JSON extraction
        import json
        import re
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"enhancements": {}}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"enhancements": {}}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
