const HealthProfile = require('../models/HealthProfile');
const Prediction = require('../models/Prediction');
const axios = require('axios');

// @desc    Create or update health profile
// @route   POST /api/health/profile
exports.upsertProfile = async (req, res) => {
    const { age, gender, weight, height, lifestyle, emergencyInfo } = req.body;

    try {
        let profile = await HealthProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile.age = age || profile.age;
            profile.gender = gender || profile.gender;
            profile.weight = weight || profile.weight;
            profile.height = height || profile.height;
            profile.lifestyle = lifestyle || profile.lifestyle;
            profile.emergencyInfo = emergencyInfo || profile.emergencyInfo;
            await profile.save();
        } else {
            // Create
            profile = await HealthProfile.create({
                user: req.user._id,
                age,
                gender,
                weight,
                height,
                lifestyle,
                emergencyInfo
            });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/health/profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await HealthProfile.findOne({ user: req.user._id });
        res.json(profile); // Returns null if not found (200 OK)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSpecialistAndOTC = (symptoms, riskLevel) => {
    let specialist = "General Physician";
    let otc = [];
    
    // Map array of symptom objects to array of lowercase strings
    const symps = symptoms.map(s => s.name.toLowerCase());
    const isSevere = symptoms.some(s => s.severity === 'severe');

    // Emergency/Red-Flag Symptoms
    const redFlags = ['chest_pain', 'shortness_breath', 'severe_chest_pain'];
    const hasRedFlag = symps.some(s => redFlags.includes(s.replace(/\s/g, '_')));

    // Suggested Specialist logic
    if (hasRedFlag && (riskLevel === 'High' || isSevere)) {
        specialist = "EMERGENCY ROOM (ER) / CARDIOLOGIST";
        otc.push("CALL EMERGENCY SERVICES IMMEDIATELY! Do not drive yourself.");
    } else if (symps.includes('chest_pain') || symps.includes('shortness_breath')) {
        specialist = "Cardiologist / Pulmonologist";
    } else if (symps.includes('headache') && riskLevel === 'High') {
        specialist = "Neurologist";
    } else if (symps.includes('nausea') || symps.includes('fatigue')) {
        specialist = "General Physician / Internal Medicine";
    }

    // OTC Medicines / Immediate Actions Logic
    if (symps.includes('fever')) otc.push("Paracetamol / Acetaminophen (for fever)");
    if (symps.includes('cough')) otc.push("Cough syrup / Lozenges (for throat relief)");
    if (symps.includes('headache') || symps.includes('chest_pain')) otc.push("Avoid strenuous activity immediately. Rest in a comfortable position.");
    if (symps.includes('nausea')) otc.push("Oral Rehydration Salts (ORS), clear fluids");
    if (symps.includes('fatigue')) otc.push("Rest, Hydration, Vitamin C supplements");

    return { specialist, otc, isEmergency: hasRedFlag && (riskLevel === 'High' || isSevere) };
};

const calculateHealthScore = (aiInput, riskLevel, symptoms) => {
    let score = 100;
    
    // 1. Risk Level Impact
    if (riskLevel === 'High') score -= 40;
    else if (riskLevel === 'Medium') score -= 20;

    // 2. Symptoms Impact
    symptoms.forEach(s => {
        if (s.severity === 'severe') score -= 10;
        else if (s.severity === 'mild') score -= 5;
    });

    // 3. Vitals Impact
    if (aiInput.spO2 < 95) score -= 15;
    if (aiInput.bp_systolic > 140 || aiInput.bp_systolic < 90) score -= 10;
    if (aiInput.heart_rate > 100 || aiInput.heart_rate < 60) score -= 5;

    // 4. Lifestyle Impact
    if (aiInput.smoking) score -= 5;
    if (aiInput.alcohol) score -= 5;
    if (aiInput.bmi > 25 || aiInput.bmi < 18.5) score -= 5;

    return Math.max(10, score); // Minimum score of 10
};

// @desc    Get prediction results
// @route   POST /api/health/predict
exports.predictRisk = async (req, res) => {
    const { symptoms, durationDays } = req.body;

    try {
        const profile = await HealthProfile.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(400).json({ message: 'Please complete your health profile first' });
        }

        // Map symptoms to model inputs (0: None, 1: Mild, 2: Severe)
        const getSeverity = (name) => {
            const s = symptoms.find(sym => sym.name.toLowerCase() === name.toLowerCase());
            if (!s) return 0;
            if (s.severity === 'mild') return 1;
            if (s.severity === 'severe') return 2;
            return 0;
        };

        // Prepare data for AI Service (17 features)
        // Prepare data for AI Service (17 features)
        const getVal = (name) => {
            const sym = symptoms.find(s => 
                s.name.toLowerCase().replace(/[\s_/]/g, '') === name.toLowerCase().replace(/[\s_/]/g, '')
            );
            if (!sym) return 0;
            switch(sym.severity) {
                case 'mild': return 1;
                case 'moderate': return 1.5; // Fine-tuned severity
                case 'severe': return 2;
                default: return 0;
            }
        };

        const aiInput = {
            age: profile.age,
            gender: profile.gender === 'male' ? 1 : 0,
            bmi: parseFloat(profile.bmi),
            smoking: profile.lifestyle.smoking ? 1 : 0,
            alcohol: profile.lifestyle.alcohol ? 1 : 0,
            activity_level: profile.lifestyle.activityLevel === 'low' ? 0 : (profile.lifestyle.activityLevel === 'moderate' ? 1 : 2),
            
            spO2: parseFloat(req.body.vitals?.spO2) || 98.0,
            heart_rate: parseFloat(req.body.vitals?.heartRate) || 75.0,
            bp_systolic: parseFloat(req.body.vitals?.bpSystolic) || 120.0,

            fever: getVal('fever'),
            cough: getVal('cough'),
            fatigue: getVal('fatigue'),
            shortness_breath: getVal('shortnessofbreath'),
            taste_smell_loss: getVal('tastesmellloss') > 0 ? 1 : 0,
            chest_pain: getVal('chestpain'),
            headache: getVal('headache'),
            nausea: getVal('nausea')
        };

        try {
            // Call AI Service
            const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, aiInput);

            // Extract correct probability based on prediction index and convert to percentage (0-100)
            let probabilityValue = aiResponse.data.probability;
            if (Array.isArray(probabilityValue)) {
                const predIndex = aiResponse.data.prediction;
                probabilityValue = (probabilityValue[predIndex] * 100);
            }

            const enrichedData = getSpecialistAndOTC(symptoms, aiResponse.data.risk_level);

            // Save prediction to DB
            const prediction = await Prediction.create({
                user: req.user._id,
                symptoms,
                durationDays,
                vitals: {
                    spO2: aiInput.spO2,
                    heartRate: aiInput.heart_rate,
                    bpSystolic: aiInput.bp_systolic
                },
                prediction: {
                    riskLevel: aiResponse.data.risk_level,
                    probability: probabilityValue,
                    recommendations: aiResponse.data.recommendations,
                    suggestedSpecialist: enrichedData.specialist,
                    otcMedicines: enrichedData.otc,
                    healthScore: calculateHealthScore(aiInput, aiResponse.data.risk_level, symptoms)
                }
            });

            return res.json(prediction);
        } catch (error) {
            console.error("AI Service Error:", error.message);
            
            // Fallback: Mock AI Logic if service is down
            console.log("⚠️ Using Mock AI Fallback...");
            
            // Simple heuristic: Risk increases with symptoms severity and age
            const totalSeverity = symptoms.reduce((acc, s) => {
                if (s.severity === 'severe') return acc + 30;
                if (s.severity === 'mild') return acc + 10;
                return acc;
            }, 0);
            
            const ageFactor = profile.age > 50 ? 15 : 0;
            const lifestyleFactor = (profile.lifestyle.smoking ? 10 : 0) + (profile.lifestyle.alcohol ? 5 : 0);
            
            const probability = Math.min(95, totalSeverity + ageFactor + lifestyleFactor + (Math.random() * 5));
            let riskLevel = 'Low';
            if (probability > 60) riskLevel = 'High';
            else if (probability > 30) riskLevel = 'Medium';
            
            const allRecs = [
                "Maintain hydration and monitor symptoms closely.",
                "Schedule a consultation with a healthcare professional.",
                "Rest and avoid strenuous physical activity.",
                "Keep a log of temperature readings twice daily.",
                "Consider isolation if symptoms persist or worsen."
            ];
            
            // Select 3 random recommendations
            const recommendations = allRecs.sort(() => 0.5 - Math.random()).slice(0, 3);

            const enrichedData = getSpecialistAndOTC(symptoms, riskLevel);

            const prediction = await Prediction.create({
                user: req.user._id,
                symptoms,
                durationDays,
                prediction: {
                    riskLevel,
                    probability,
                    recommendations,
                    suggestedSpecialist: enrichedData.specialist,
                    otcMedicines: enrichedData.otc,
                    healthScore: calculateHealthScore(aiInput, riskLevel, symptoms)
                }
            });

            return res.json(prediction);
        }
    } catch (error) {
        console.error("Database or Server Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get prediction history
// @route   GET /api/health/history
exports.getHistory = async (req, res) => {
    try {
        const history = await Prediction.find({ user: req.user._id }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
