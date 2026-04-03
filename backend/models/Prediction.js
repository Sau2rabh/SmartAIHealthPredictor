const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: [{ 
        name: { type: String, required: true },
        severity: { type: String, enum: ['none', 'mild', 'moderate', 'severe'], required: true }
    }],
    durationDays: { type: Number, required: true },
    prediction: {
        riskLevel: { type: String, required: true },
        probability: [Number],
        recommendations: [String],
        suggestedSpecialist: { type: String },
        otcMedicines: [{ type: String }]
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
