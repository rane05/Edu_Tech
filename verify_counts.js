require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./model/cetCollege');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-predictor';

mongoose.connect(MONGO_URI)
    .then(() => checkCounts())
    .catch(err => console.error(err));

async function checkCounts() {
    try {
        const totalColleges = await College.countDocuments();
        console.log(`Total Colleges: ${totalColleges}`);

        // Check for AI Category
        const sample = await College.findOne({
            "branches.cutoffs.category": { $in: ['AI', 'All India', 'ALL INDIA'] }
        });

        if (sample) {
            console.log("Found college with AI Quota:", sample.name);
            console.log("Branch:", sample.branches[0].name);
            const aiCutoff = sample.branches[0].cutoffs.find(c => ['AI', 'All India', 'ALL INDIA'].includes(c.category));
            console.log("AI Cutoff Sample:", aiCutoff);
        } else {
            console.log("WARNING: No colleges found with AI Quota data.");
        }

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
