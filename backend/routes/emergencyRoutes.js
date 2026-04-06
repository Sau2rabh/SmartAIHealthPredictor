const express = require('express');
const router = express.Router();
const axios = require('axios');
const twilio = require('twilio');
const { protect } = require('../middleware/authMiddleware');
const HealthProfile = require('../models/HealthProfile');

// @desc    Send SOS alert via SMS
// @route   POST /api/emergency/sos
router.post('/sos', protect, async (req, res) => {
    const { location, message } = req.body;
    
    try {
        const profile = await HealthProfile.findOne({ user: req.user._id });
        
        if (!profile || !profile.emergencyInfo?.emergencyContact?.phone) {
            return res.status(400).json({ message: "Emergency contact not found. Please update your profile." });
        }

        const contactPhone = profile.emergencyInfo.emergencyContact.phone;
        const contactName = profile.emergencyInfo.emergencyContact.name;
        
        const googleMapsLink = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : "Location not available";
        
        const smsBody = `EMERGENCY ALERT from ${req.user.name}!\n` +
                        `Message: ${message || "I need immediate help!"}\n` +
                        `Location: ${googleMapsLink}\n` +
                        `Medical Info: Blood ${profile.emergencyInfo.bloodGroup || 'Unknown'}, Allergies: ${profile.emergencyInfo.allergies.join(', ') || 'None'}`;

        let sentStatus = false;

        // Try Fast2SMS first (India-friendly, easy signup)
        if (process.env.FAST2SMS_API_KEY) {
            try {
                const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                    params: {
                        authorization: process.env.FAST2SMS_API_KEY,
                        route: 'q',
                        message: smsBody,
                        language: 'english',
                        flash: '0',
                        numbers: contactPhone
                    }
                });
                if (response.data.return) {
                    sentStatus = true;
                    console.log("Fast2SMS: Success!", response.data);
                }
            } catch (fastErr) {
                console.error("Fast2SMS failed:", fastErr.response?.data || fastErr.message);
            }
        }

        // Fallback or explicit Twilio
        if (!sentStatus && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            try {
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: smsBody,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: contactPhone
                });
                sentStatus = true;
                console.log("Twilio: Success!");
            } catch (twilioErr) {
                console.error("Twilio failed:", twilioErr.message);
            }
        }

        // Console log for visibility during development
        console.log("--- SOS ALERT LOG ---");
        console.log(`To: ${contactName} (${contactPhone})`);
        console.log(`Content: ${smsBody}`);
        console.log(`Status: ${sentStatus ? "SENT" : "NOT SENT (Check API Keys)"}`);
        console.log("----------------------");

        if (sentStatus) {
            res.json({ success: true, message: "SOS Alert sent to your emergency contact." });
        } else {
            res.status(500).json({ message: "Failed to send SMS. Please ensure FAST2SMS_API_KEY is added to .env" });
        }

    } catch (error) {
        console.error("SOS Error:", error);
        res.status(500).json({ message: "Failed to process SOS alert." });
    }
});

// @desc    Enhance hospital list with AI details
// @route   POST /api/emergency/enhance-hospitals
router.post('/enhance-hospitals', async (req, res) => {
    const { hospitals } = req.body;
    try {
        const response = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/enhance-hospitals`, {
            hospitals: hospitals.map(h => ({ 
                id: h.id,
                name: h.tags?.name || "Hospital",
                lat: parseFloat(h.lat),
                lon: parseFloat(h.lon)
            }))
        });
        res.json(response.data);
    } catch (error) {
        console.error("AI Enhancement Error:", error.message);
        res.status(500).json({ message: "Failed to fetch AI details" });
    }
});

module.exports = router;
