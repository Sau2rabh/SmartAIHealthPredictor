from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
from model import HealthModel

app = FastAPI(title="AI Health Risk Predictor API")
health_model = HealthModel()

class HealthInput(BaseModel):
    age: int
    gender: int  # 0: Female, 1: Male
    bmi: float
    smoking: int # 0/1
    alcohol: int # 0/1
    activity_level: int # 0-2
    fever: int # 0-2
    cough: int # 0-2
    fatigue: int # 0-2
    shortness_breath: int # 0-2

@app.get("/")
def read_root():
    return {"message": "AI Health Risk Predictor API is running"}

@app.post("/predict")
def predict_risk(data: HealthInput):
    try:
        # Check if model is initialized
        if health_model.model is None: # Model check
             raise HTTPException(status_code=500, detail="Model is not trained yet. Run /train")
             
        features = [
            data.age, data.gender, data.bmi, data.smoking, data.alcohol,
            data.activity_level, data.fever, data.cough, data.fatigue, data.shortness_breath
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

@app.post("/train")
def train_model():
    try:
        from data_gen import generate_health_data
        data_path = generate_health_data()
        report = health_model.train(data_path)
        return {"message": "Model trained successfully", "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
