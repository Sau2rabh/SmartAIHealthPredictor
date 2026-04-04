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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
