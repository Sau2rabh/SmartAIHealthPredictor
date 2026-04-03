const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log('🔍 Testing connection to:', uri.split('@')[1] || 'URL hidden');

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000 
})
.then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.reason) console.error('Reason:', err.reason);
    process.exit(1);
});
