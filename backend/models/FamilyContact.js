const mongoose = require('mongoose');

const familyContactSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    notifyOnHighRisk: { type: Boolean, default: true },
    email: { type: String },
    lastNotified: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FamilyContact', familyContactSchema);
