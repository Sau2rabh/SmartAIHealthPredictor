import pandas as pd
import numpy as np
import os

def generate_health_data(n_samples=5000):
    np.random.seed(42)
    
    # Core Features
    age = np.random.randint(18, 85, n_samples)
    gender = np.random.choice([0, 1], n_samples)
    bmi = np.random.normal(26, 6, n_samples).clip(15, 50)
    smoking = np.random.choice([0, 1], n_samples, p=[0.75, 0.25])
    alcohol = np.random.choice([0, 1], n_samples, p=[0.65, 0.35])
    activity_level = np.random.choice([0, 1, 2], n_samples)
    
    # Vital Signs
    spO2 = np.random.normal(97, 3, n_samples).clip(85, 100) # Normal: 95-100, Critical: < 90
    heart_rate = np.random.normal(75, 15, n_samples).clip(45, 150) # Normal: 60-100
    bp_systolic = np.random.normal(120, 20, n_samples).clip(85, 190) # Normal: 110-130
    
    # Symptoms (0: None, 1: Mild, 2: Severe)
    fever = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.25, 0.15])
    cough = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.25, 0.15])
    fatigue = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.35, 0.15])
    shortness_breath = np.random.choice([0, 1, 2], n_samples, p=[0.75, 0.15, 0.1])
    taste_smell_loss = np.random.choice([0, 1], n_samples, p=[0.9, 0.1])
    chest_pain = np.random.choice([0, 1, 2], n_samples, p=[0.8, 0.15, 0.05])
    headache = np.random.choice([0, 1, 2], n_samples, p=[0.7, 0.25, 0.05])
    nausea = np.random.choice([0, 1, 2], n_samples, p=[0.85, 0.1, 0.05])
    
    # Risk Score Calculation (Deeply Aggressive Clinical Weighting)
    risk_score = (
        (age / 80) * 1.5 +
        (bmi / 25) * np.where(bmi > 25, 1.2, 0.8) +
        smoking * 2.5 +
        alcohol * 1.5 +
        (2 - activity_level) * 1.0 +
        (fever * 3.5) +
        (cough * 2.5) +
        (fatigue * 1.5) +
        (shortness_breath * 8.0) + # Increased from 5
        (taste_smell_loss * 3.5) +
        (chest_pain * 6.0) + # Increased from 4
        (headache * 1.0) +
        (nausea * 1.5) +
        
        # Vital signs impact
        np.where(spO2 < 90, 10.0, np.where(spO2 < 94, 4.0, 0)) + # More aggressive SpO2
        np.where(heart_rate > 110, 4.0, 0) + 
        np.where(bp_systolic > 145, 4.0, 0)
    )
    
    risk_score += np.random.normal(0, 0.5, n_samples) # Reduced noise for stability
    
    risk_level = []
    for score in risk_score:
        if score < 10:
            risk_level.append(0) # Low
        elif score < 16:
            risk_level.append(1) # Medium
        else:
            risk_level.append(2) # High
            
    df = pd.DataFrame({
        'age': age, 'gender': gender, 'bmi': bmi, 'smoking': smoking, 'alcohol': alcohol, 
        'activity_level': activity_level, 'spO2': spO2, 'heart_rate': heart_rate, 
        'bp_systolic': bp_systolic, 'fever': fever, 'cough': cough, 'fatigue': fatigue, 
        'shortness_breath': shortness_breath, 'taste_smell_loss': taste_smell_loss, 
        'chest_pain': chest_pain, 'headache': headache, 'nausea': nausea, 
        'risk_level': risk_level
    })
    
    file_dir = os.path.dirname(__file__)
    data_path = os.path.join(file_dir, 'synthetic_health_data.csv')
    df.to_csv(data_path, index=False)
    print(f"Dataset generated at {data_path} with {n_samples} samples.")
    return data_path

if __name__ == "__main__":
    generate_health_data()
