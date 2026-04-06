const express = require('express');
const router = express.Router();
const { getVitals, addVital, deleteVital } = require('../controllers/vitalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVitals)
    .post(protect, addVital);

router.route('/:id')
    .delete(protect, deleteVital);

module.exports = router;
