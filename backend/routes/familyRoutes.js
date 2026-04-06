const express = require('express');
const router = express.Router();
const FamilyContact = require('../models/FamilyContact');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all family contacts
// @route   GET /api/family
router.get('/', protect, async (req, res) => {
    try {
        const contacts = await FamilyContact.find({ user: req.user._id });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a family contact
// @route   POST /api/family
router.post('/', protect, async (req, res) => {
    const { name, relation, phoneNumber, email, notifyOnHighRisk } = req.body;
    try {
        const contact = await FamilyContact.create({
            user: req.user._id,
            name,
            relation,
            phoneNumber,
            email,
            notifyOnHighRisk
        });
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a family contact
// @route   DELETE /api/family/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const contact = await FamilyContact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!contact) return res.status(404).json({ message: 'Contact not found' });
        res.json({ message: 'Contact removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
