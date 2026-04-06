const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    weight: { type: Number, required: true }, // in kg
    height: { type: Number, required: true }, // in cm
    bmi: { type: Number },
    lifestyle: {
        smoking: { type: Boolean, default: false },
        alcohol: { type: Boolean, default: false },
        activityLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' }
    },
    emergencyInfo: {
        bloodGroup: { type: String, default: "" },
        allergies: [{ type: String }],
        chronicConditions: [{ type: String }],
        medications: [{ type: String }],
        emergencyContact: {
            name: { type: String, default: "" },
            relationship: { type: String, default: "" },
            phone: { type: String, default: "" }
        }
    },
    updatedAt: { type: Date, default: Date.now }
});

// Calculate BMI before saving
healthProfileSchema.pre('save', function() {
    if (this.weight && this.height) {
        const heightInMeters = this.height / 100;
        this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
