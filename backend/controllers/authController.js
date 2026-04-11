const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const sendOTPEmail = async (email, otp, name) => {
    const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
    if (!APPS_SCRIPT_URL) {
        console.warn('⚠️ APPS_SCRIPT_URL not set. OTP will not be sent.');
        return;
    }

    try {
        await axios.post(APPS_SCRIPT_URL, {
            email,
            otp,
            name
        });
    } catch (error) {
        console.error('❌ Error sending OTP via Apps Script:', error.message);
    }
};

// @desc    Request OTP for email verification (Step 1)
// @route   POST /api/auth/request-otp
exports.requestOTP = async (req, res) => {
    const { name, email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save or update verification code
        await VerificationCode.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        await sendOTPEmail(email, otp, name);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP only (Step 2)
// @route   POST /api/auth/verify-otp-only
exports.verifyOTPOnly = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const record = await VerificationCode.findOne({ email });

        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Finalize registration (Step 3)
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
    const { name, email, password, otp } = req.body;

    try {
        // Re-verify OTP one last time for security
        const record = await VerificationCode.findOne({ email });
        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Verification failed. Please request a new OTP.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        // Delete verification code after success
        await VerificationCode.deleteOne({ email });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
exports.updateAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.avatar = req.body.avatar || user.avatar;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
