const express = require('express');
const router = express.Router();
const { getMedications, addMedication, updateMedication, deleteMedication } = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMedications)
    .post(protect, addMedication);

router.route('/:id')
    .patch(protect, updateMedication)
    .delete(protect, deleteMedication);

module.exports = router;
