const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- Phase 1: Authentication ---');
        // 1. Signup
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        });
        const token = signupRes.data.token;
        console.log('Signup Successful, Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- Phase 2: Health Profile ---');
        // 2. Create Profile
        const profileRes = await axios.post(`${API_URL}/health/profile`, {
            age: 35,
            gender: 'male',
            weight: 80,
            height: 175,
            lifestyle: {
                smoking: true,
                alcohol: false,
                activityLevel: 'moderate'
            }
        }, config);
        console.log('Profile Created:', profileRes.data.bmi);

        console.log('\n--- Phase 3: AI Risk Prediction ---');
        // 3. Predict Risk
        const predictRes = await axios.post(`${API_URL}/health/predict`, {
            symptoms: [
                { name: 'fever', severity: 'mild' },
                { name: 'cough', severity: 'none' }
            ],
            durationDays: 3
        }, config);
        console.log('Prediction Result:', predictRes.data.prediction.riskLevel);
        console.log('Recommendations:', predictRes.data.prediction.recommendations);

        console.log('\n--- Phase 4: History ---');
        // 4. Get History
        const historyRes = await axios.get(`${API_URL}/health/history`, config);
        console.log('History Count:', historyRes.data.length);

        console.log('\n✅ All Phase 1 Backend tests passed!');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
