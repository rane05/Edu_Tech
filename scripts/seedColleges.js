const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const CollegeRecommend = require('../model/CollegeRecommend');

const COLLEGES_DATA_PATH = path.join(__dirname, '../all_colleges_data.json');

async function seedData() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully.");

        if (!fs.existsSync(COLLEGES_DATA_PATH)) {
            console.error("JSON file not found at:", COLLEGES_DATA_PATH);
            process.exit(1);
        }

        console.log("Reading JSON data...");
        const rawData = fs.readFileSync(COLLEGES_DATA_PATH, 'utf8');
        const collegesObj = JSON.parse(rawData);
        const collegesArray = Object.values(collegesObj);

        console.log(`Processing ${collegesArray.length} colleges...`);

        // Transform data slightly to match schema if necessary
        // In this case, the JSON structure mostly matches the schema structure
        // we defined in CollegeRecommend.js (branches as objects vs arrays)

        // Clear existing data (Optional: user might want to keep manual entries)
        // For now, let's just insert orphans

        let count = 0;
        for (const cData of collegesArray) {
            // Check if already exists to avoid duplicates
            const existing = await CollegeRecommend.findOne({ name: cData.name, university: cData.university });
            if (existing) continue;

            const college = new CollegeRecommend({
                name: cData.name,
                university: cData.university || 'Maharashtra',
                location: cData.location || 'Maharashtra',
                branches: Object.values(cData.branches || {}).map(b => ({
                    name: b.name,
                    cutoffs: (b.cutoffs || []).map(cu => ({
                        category: cu.category,
                        cetScore: cu.cetScore,
                        round: cu.round,
                        year: cu.year
                    }))
                }))
            });

            await college.save();
            count++;
            if (count % 100 === 0) console.log(`Inserted ${count} colleges...`);
        }

        console.log(`Seeding complete. Inserted ${count} new colleges.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seedData();
