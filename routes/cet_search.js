const express = require('express');
const router = express.Router();
const College = require('../model/cetCollege');

// Render the Search Page
router.get('/cet-predictor', (req, res) => {
    res.render('cet_predictor', { results: null });
});

// API to Search Colleges
router.post('/api/cet/predict', async (req, res) => {
    try {
        const { score, category, state, location, branch } = req.body;
        const userScore = parseFloat(score);

        if (!userScore || !category) {
            return res.render('cet_predictor', { results: [], error: 'Please enter valid score and category.', score: score, category: category });
        }

        // Map 'OPEN' to 'General' to match database format
        let searchCategory = category;
        if (category === 'OPEN') {
            searchCategory = 'General';
        }

        // Build Query
        let query = {
            "branches.cutoffs": {
                $elemMatch: {
                    category: searchCategory,
                    cetScore: { $lte: userScore }
                }
            }
        };

        // Enforce Maharashtra State Filter
        query.$or = [
            { location: { $regex: /Maharashtra|Mumbai|Pune|Nagpur|Nashik|Aurangabad/i } },
            { location: "" },
            { location: null }
        ];

        // Apply Location Filter if provided
        if (location && location !== "") {
            query.location = { $regex: new RegExp(location, 'i') };
        }

        console.log("CET Query:", JSON.stringify(query, null, 2));

        const colleges = await College.find(query).limit(50);
        console.log("Found Colleges (Before Branch Filter):", colleges.length);

        // Filter and format the results to show ONLY eligible branches matching the requested Branch
        const results = colleges.map(college => {
            const eligibleBranches = college.branches.filter(b => {
                // 1. Check Score Eligibility
                const cutoff = b.cutoffs.find(c => c.category === searchCategory);
                if (!cutoff || cutoff.cetScore > userScore) return false;

                // 2. Check Branch Name Filter (if provided)
                if (branch && branch !== "") {
                    return b.name.toLowerCase().includes(branch.toLowerCase());
                }
                return true;
            }).map(b => ({
                name: b.name,
                cutoff: b.cutoffs.find(c => c.category === searchCategory).cetScore
            }));

            if (eligibleBranches.length > 0) {
                return {
                    name: college.name,
                    location: college.location,
                    rating: college.rating,
                    infrastructure: college.infrastructure,
                    placement: college.placement,
                    fees: college.fees.ug,
                    university: college.university,
                    branches: eligibleBranches
                };
            }
            return null;
        }).filter(item => item !== null);

        // Sort by Rating (descending)
        results.sort((a, b) => b.rating - a.rating);

        res.render('cet_predictor', {
            results: results,
            score: score,
            category: category,
            location: location,
            branch: branch
        });

    } catch (err) {
        console.error("CET Prediction Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
