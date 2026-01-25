const mongoose = require('mongoose');
const College = require('./model/cetCollege');
require('dotenv').config();

async function checkDB() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Edu_Tech');

    const colleges = await College.find({}, { rating: 1 });
    const ratings = colleges.map(c => c.rating);
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    console.log(`Ratings Stats: Min=${min}, Max=${max}, Avg=${avg.toFixed(2)}`);
    console.log(`Count < 7.0: ${ratings.filter(r => r < 7).length}`);
    console.log(`Count >= 7.0 & < 8.0: ${ratings.filter(r => r >= 7 && r < 8).length}`);
    console.log(`Count >= 8.0: ${ratings.filter(r => r >= 8).length}`);

    process.exit();
}

checkDB();
