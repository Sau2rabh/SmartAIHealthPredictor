const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'AI Health Risk Predictor API is running...', status: 'OK' });
});

app.get('/api/health-check', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected';
    res.json({ status: 'OK', database: dbStatus });
});

const PORT = process.env.PORT || 5000;

// Start Server immediately
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Connect to DB in background
    console.log('⏳ Connecting to MongoDB...');
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // 5 second timeout
    })
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Server will continue running, but DB-dependent features will fail.');
    });
});

