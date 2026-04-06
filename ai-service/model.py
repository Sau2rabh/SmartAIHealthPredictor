import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

class HealthModel:
    def __init__(self, model_path='health_model.joblib', scaler_path='health_scaler.joblib'):
        self.model_path = os.path.join(os.path.dirname(__file__), model_path)
        self.scaler_path = os.path.join(os.path.dirname(__file__), scaler_path)
        self.model = None
        self.scaler = None
        
        self.feature_names = [
            'age', 'gender', 'bmi', 'smoking', 'alcohol', 'activity_level', 
            'spO2', 'heart_rate', 'bp_systolic', 'fever', 'cough', 'fatigue', 
            'shortness_breath', 'taste_smell_loss', 'chest_pain', 'headache', 'nausea'
        ]
        
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.load()
            
    def train(self, data_path='synthetic_health_data.csv'):
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), data_path))
        X = df.drop('risk_level', axis=1)
        y = df['risk_level']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Save model and scaler
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        print("Model trained and saved.")
        return classification_report(y_test, self.model.predict(X_test_scaled))
        
    def load(self):
        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        print("Model loaded.")
        
    def predict(self, features):
        if self.model is None or self.scaler is None:
            raise Exception("Model not loaded or trained yet.")
        
        # Features should be a list in the same order as in data_gen.py
        features_df = pd.DataFrame([features], columns=self.feature_names)
        features_scaled = self.scaler.transform(features_df)
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0].tolist()
        
        return int(prediction), probability

if __name__ == "__main__":
    hm = HealthModel()
    # Check if data exists, if not generate it
    data_path = os.path.join(os.path.dirname(__file__), 'synthetic_health_data.csv')
    if not os.path.exists(data_path):
        from data_gen import generate_health_data
        generate_health_data()
        
    report = hm.train()
    print(report)
    
    # Test prediction
    # [30, 1, 22.5, 0, 0, 2, 0, 0, 0, 0] -> age: 30, male, bmi: 22.5, non-smoker, non-drinker, active, no symptoms
    prediction, proba = hm.predict([30, 1, 22.5, 0, 0, 2, 0, 0, 0, 0])
    print(f"Test Prediction: {prediction}, Proba: {proba}")
