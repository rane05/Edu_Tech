require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const College = require('./model/cetCollege');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-predictor';

mongoose.connect(MONGO_URI)
    .then(() => checkCategories())
    .catch(err => console.error(err));

async function checkCategories() {
    try {
        const result = await College.aggregate([
            { $unwind: "$branches" },
            { $unwind: "$branches.cutoffs" },
            { $group: { _id: "$branches.cutoffs.category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 100 }
        ]);

        fs.writeFileSync('categories_dump.txt', JSON.stringify(result, null, 2));
        console.log("Dumped categories to categories_dump.txt");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
