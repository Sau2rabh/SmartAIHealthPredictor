const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    systolicBP: { type: Number }, // mmHg
    diastolicBP: { type: Number }, // mmHg
    heartRate: { type: Number }, // bpm
    spO2: { type: Number }, // %
    bloodSugar: { type: Number }, // mg/dL
    weight: { type: Number }, // kg
    temperature: { type: Number }, // °C
    note: { type: String },
    recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Vital', vitalSchema);
