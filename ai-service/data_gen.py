import pandas as pd
import numpy as np
import os

def generate_health_data(n_samples=2000):
    np.random.seed(42)
    
    # Features
    age = np.random.randint(18, 80, n_samples)
    gender = np.random.choice([0, 1], n_samples) # 0: Female, 1: Male
    bmi = np.random.normal(25, 5, n_samples).clip(15, 45)
    smoking = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    alcohol = np.random.choice([0, 1], n_samples, p=[0.6, 0.4])
    activity_level = np.random.choice([0, 1, 2], n_samples) # 0: Low, 1: Moderate, 2: High
    
    # Symptoms (0: None, 1: Mild, 2: Severe)
    fever = np.random.choice([0, 1, 2], n_samples, p=[0.7, 0.2, 0.1])
    cough = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.3, 0.1])
    fatigue = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.4, 0.1])
    shortness_breath = np.random.choice([0, 1, 2], n_samples, p=[0.8, 0.15, 0.05])
    
    # Calculate Risk Score (Simple heuristic for synthetic data)
    # This is just a placeholder logic to create labels
    risk_score = (
        (age / 80) * 2 +
        (bmi / 30) * 1.5 +
        smoking * 2 +
        alcohol * 1 +
        (2 - activity_level) * 1.5 +
        fever * 2 +
        cough * 1.5 +
        fatigue * 1 +
        shortness_breath * 3
    )
    
    # Assign Risk Level
    # Low: < 6, Medium: 6-10, High: > 10
    risk_level = []
    for score in risk_score:
        if score < 7:
            risk_level.append(0) # Low
        elif score < 12:
            risk_level.append(1) # Medium
        else:
            risk_level.append(2) # High
            
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'bmi': bmi,
        'smoking': smoking,
        'alcohol': alcohol,
        'activity_level': activity_level,
        'fever': fever,
        'cough': cough,
        'fatigue': fatigue,
        'shortness_breath': shortness_breath,
        'risk_level': risk_level
    })
    
    data_path = os.path.join(os.path.dirname(__file__), 'synthetic_health_data.csv')
    df.to_csv(data_path, index=False)
    print(f"Dataset generated at {data_path}")
    return data_path

if __name__ == "__main__":
    generate_health_data()
