const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load JOSAA mock data
const josaaDataPath = path.join(__dirname, '../data/josaa_colleges.json');
let josaaColleges = [];
try {
    const rawData = fs.readFileSync(josaaDataPath, 'utf-8');
    josaaColleges = JSON.parse(rawData);
} catch (err) {
    console.error("Error reading JOSAA mock data:", err);
}

// Render the JEE Search Page
router.get('/jee-search', (req, res) => {
    res.render('jee_predictor', { results: null });
});

// API to Search Colleges for JEE (JOSAA Pattern)
router.post('/api/jee/predict', async (req, res) => {
    try {
        const { jeeRank, category, type } = req.body;
        const userRank = parseInt(jeeRank);

        if (!userRank || userRank <= 0) {
            return res.render('jee_predictor', {
                results: [],
                error: 'Please enter a valid JEE Rank.',
                jeeRank,
                category,
                type
            });
        }

        const selectedCategory = category || 'OPEN';

        // Filter valid colleges and branches
        const results = josaaColleges.map(college => {
            // Apply college type filter if provided
            if (type && type !== 'All' && college.type !== type) return null;

            const eligibleBranches = college.branches.filter(branch => {
                // Check Category Match (Simplifying to OPEN for mock data, or checking exactly if available)
                if (branch.category !== selectedCategory && branch.category !== 'OPEN') return false;

                // Check Rank Eligibility: userRank should be within closingRank
                // Using a generic check: user rank must be less than or equal to closing rank
                if (userRank > branch.closingRank) return false;

                return true;
            }).map(b => {
                return {
                    name: b.name,
                    quota: b.quota,
                    openingRank: b.openingRank,
                    closingRank: b.closingRank
                };
            });

            if (eligibleBranches.length > 0) {
                return {
                    name: college.name,
                    location: college.location,
                    type: college.type,
                    rating: college.rating,
                    placement: college.placement,
                    fees: college.fees,
                    branches: eligibleBranches
                };
            }
            return null;
        }).filter(item => item !== null);

        // Sort by Rating
        results.sort((a, b) => b.rating - a.rating);

        res.render('jee_predictor', {
            results: results,
            jeeRank,
            category: selectedCategory,
            type
        });

    } catch (err) {
        console.error("JEE Prediction Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
