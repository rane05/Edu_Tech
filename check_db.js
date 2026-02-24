const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./model/questions');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Question.countDocuments();
        console.log(`Total questions: ${count}`);

        const sections = await Question.distinct('section');
        console.log('Sections found:', sections);

        for (const section of sections) {
            const sCount = await Question.countDocuments({ section });
            console.log(`Section "${section}": ${sCount}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
