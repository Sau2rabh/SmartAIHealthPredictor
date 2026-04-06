const Medication = require('../models/Medication');

// @desc    Get user medications
// @route   GET /api/medications
exports.getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add medication
// @route   POST /api/medications
exports.addMedication = async (req, res) => {
    try {
        const { name, dosage, frequency, time, notes } = req.body;
        const medication = await Medication.create({
            user: req.user._id,
            name,
            dosage,
            frequency,
            time,
            notes
        });
        res.status(201).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update medication status
// @route   PATCH /api/medications/:id
exports.updateMedication = async (req, res) => {
    try {
        const { status } = req.body;
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );
        if (!medication) return res.status(404).json({ message: 'Medication not found' });
        res.json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!medication) return res.status(404).json({ message: 'Medication not found' });
        res.json({ message: 'Medication removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
