require('dotenv').config();
const mongoose = require('mongoose');

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected. Running seed script...');
        try {
            require('./fill.js');
        } catch (error) {
            console.error('Error requiring fill.js:', error);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
