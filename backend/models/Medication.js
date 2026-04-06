const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g., "Twice a day"
    time: { type: String }, // e.g., "08:00, 20:00"
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
