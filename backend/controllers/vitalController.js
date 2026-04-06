const Vital = require('../models/Vital');

// @desc    Get user vitals
// @route   GET /api/vitals
exports.getVitals = async (req, res) => {
    try {
        const vitals = await Vital.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(50);
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add vital
// @route   POST /api/vitals
exports.addVital = async (req, res) => {
    try {
        const { systolicBP, diastolicBP, heartRate, spO2, bloodSugar, weight, temperature, note } = req.body;
        const vital = await Vital.create({
            user: req.user._id,
            systolicBP,
            diastolicBP,
            heartRate,
            spO2,
            bloodSugar,
            weight,
            temperature,
            note
        });
        res.status(201).json(vital);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete vital
// @route   DELETE /api/vitals/:id
exports.deleteVital = async (req, res) => {
    try {
        const vital = await Vital.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!vital) return res.status(404).json({ message: 'Vital not found' });
        res.json({ message: 'Vital record removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
