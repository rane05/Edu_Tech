require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./model/cetCollege');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-predictor';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB available for JEE seeding'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const seedJeeData = async () => {
    try {
        const cursor = College.find({}).cursor();

        let processed = 0;
        let updated = 0;

        console.log("Starting JEE Data Backfill (Cloning General/OPEN -> AI)...");

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            let modified = false;
            if (doc.branches) {
                for (const branch of doc.branches) {
                    if (branch.cutoffs) {
                        const hasAI = branch.cutoffs.some(c => ['AI', 'All India', 'ALL INDIA'].includes(c.category));

                        if (!hasAI) {
                            // Regex match for any category containing General or OPEN (case-insensitive)
                            // This handles 'General Home', 'GOPEN', 'GOPENH', 'OPEN', etc.
                            const baseCutoff = branch.cutoffs.find(c => /General|OPEN|GOPEN/i.test(c.category));

                            if (baseCutoff) {
                                // Clone it
                                branch.cutoffs.push({
                                    category: 'AI',
                                    cetScore: baseCutoff.cetScore,
                                    round: baseCutoff.round,
                                    year: baseCutoff.year
                                });
                                modified = true;
                            }
                        }
                    }
                }
            }

            if (modified) {
                await doc.save();
                updated++;
            }
            processed++;
            if (processed % 2000 === 0) console.log(`Processed ${processed} colleges...`);
        }

        console.log(`Finished. Processed: ${processed}, Updated: ${updated}`);
        process.exit(0);

    } catch (err) {
        console.error('Error seeding JEE data:', err);
        process.exit(1);
    }
};

seedJeeData();
