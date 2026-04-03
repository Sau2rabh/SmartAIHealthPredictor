const express = require('express');
const router = express.Router();
const { upsertProfile, getProfile, predictRisk, getHistory } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
    .post(protect, upsertProfile)
    .get(protect, getProfile);

router.post('/predict', protect, predictRisk);
router.get('/history', protect, getHistory);

module.exports = router;
