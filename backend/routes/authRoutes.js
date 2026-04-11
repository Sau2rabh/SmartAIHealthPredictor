const express = require('express');
const router = express.Router();
const { signup, login, updateAvatar, requestOTP, verifyOTPOnly } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request-otp', requestOTP);
router.post('/verify-otp-only', verifyOTPOnly);
router.post('/signup', signup);
router.post('/login', login);
router.put('/avatar', protect, updateAvatar);

module.exports = router;
