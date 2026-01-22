require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./model/cetCollege');

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected.');
        try {
            const count = await College.countDocuments();
            console.log(`Total colleges in DB: ${count}`);

            if (count > 0) {
                const sample = await College.findOne();
                console.log('Sample college:', sample.name);
            }
        } catch (err) {
            console.error('Error counting documents:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
