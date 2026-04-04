import pandas as pd
import numpy as np
import os

def generate_health_data(n_samples=5000):
    np.random.seed(42)
    
    # Features
    age = np.random.randint(18, 85, n_samples)
    gender = np.random.choice([0, 1], n_samples) # 0: Female, 1: Male
    bmi = np.random.normal(26, 6, n_samples).clip(15, 50)
    smoking = np.random.choice([0, 1], n_samples, p=[0.75, 0.25])
    alcohol = np.random.choice([0, 1], n_samples, p=[0.65, 0.35])
    activity_level = np.random.choice([0, 1, 2], n_samples) # 0: Low, 1: Moderate, 2: High
    
    # Symptoms (0: None, 1: Mild, 2: Severe)
    fever = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.25, 0.15])
    cough = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.25, 0.15])
    fatigue = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.35, 0.15])
    shortness_breath = np.random.choice([0, 1, 2], n_samples, p=[0.75, 0.15, 0.1])
    
    # Calculate Risk Score (More clinical weighting)
    # Severe symptoms weighted very heavily now
    risk_score = (
        (age / 80) * 1.5 +
        (bmi / 25) * np.where(bmi > 25, 1.2, 0.8) +
        smoking * 2.5 +
        alcohol * 1.5 +
        (2 - activity_level) * 1.0 +
        (fever * 3.5) +  # Higher weight for fever
        (cough * 2.5) +
        (fatigue * 1.5) +
        (shortness_breath * 5.0) # Critical symptom weighting
    )
    
    # Add some randomness/noise to simulate real-world variability
    risk_score += np.random.normal(0, 1, n_samples)
    
    # Assign Risk Level with adjusted thresholds
    # We want more clear separation for High-Risk cases
    risk_level = []
    for score in risk_score:
        if score < 8:
            risk_level.append(0) # Low
        elif score < 16:
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
