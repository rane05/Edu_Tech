const express = require('express');
const router = express.Router();
const College = require('../model/cetCollege');

// Render the JEE Search Page
router.get('/jee-predictor', (req, res) => {
    res.render('jee_predictor', { results: null });
});

// API to Search Colleges for JEE (AI Quota)
router.post('/api/jee/predict', async (req, res) => {
    try {
        const { jeeScore, state, location, branch } = req.body;
        const userScore = parseFloat(jeeScore);

        if (!userScore) {
            return res.render('jee_predictor', {
                results: [],
                error: 'Please enter a valid JEE Percentile.',
                jeeScore
            });
        }

        // Logic: Find colleges where 'AI' (All India) category cutoff <= userScore

        let query = {
            "branches.cutoffs": {
                $elemMatch: {
                    category: { $in: ['AI', 'All India', 'ALL INDIA'] },
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

        // Apply Location Filter
        if (location && location !== "") {
            query.location = { $regex: new RegExp(location, 'i') };
        }

        console.log("JEE Query:", JSON.stringify(query, null, 2));

        const colleges = await College.find(query).limit(50);
        console.log("Found JEE Colleges (Before Branch Filter):", colleges.length);

        // Filter valid branches
        const results = colleges.map(college => {
            const eligibleBranches = college.branches.filter(branch => {
                // 1. Check Score Eligibility
                const cutoff = branch.cutoffs.find(c => ['AI', 'All India', 'ALL INDIA'].includes(c.category));
                if (!cutoff || cutoff.cetScore > userScore) return false;

                // 2. Check Branch Filter
                if (branch && branch !== "") {
                    // Note: 'branch' variable here shadows request param 'branch'. Renaming request param usage.
                    // The outer scope variable 'branch' from req.body is accessible if we rename the argument.
                    // Let's rely on lowercased match.
                    // Wait, 'branch' is the iteration variable. Access req.body.branch explicitly or rename.
                    // Actually, I can just use the outer variable if I avoid shadowing.
                }
                return true;
            });

            // Re-filtering with correct variable naming to avoid shadowing issues
            const filteredBranches = college.branches.filter(b => {
                const cutoff = b.cutoffs.find(c => ['AI', 'All India', 'ALL INDIA'].includes(c.category));
                if (!cutoff || cutoff.cetScore > userScore) return false;

                if (branch && branch !== "") {
                    return b.name.toLowerCase().includes(branch.toLowerCase());
                }
                return true;
            }).map(b => {
                const cutoffObj = b.cutoffs.find(c => ['AI', 'All India', 'ALL INDIA'].includes(c.category));
                return {
                    name: b.name,
                    cutoff: cutoffObj ? cutoffObj.cetScore : 'N/A'
                };
            });

            if (filteredBranches.length > 0) {
                return {
                    name: college.name,
                    location: college.location,
                    rating: college.rating,
                    infrastructure: college.infrastructure,
                    placement: college.placement,
                    fees: college.fees.ug,
                    university: college.university,
                    branches: filteredBranches
                };
            }
            return null;
        }).filter(item => item !== null);

        // Sort by Rating
        results.sort((a, b) => b.rating - a.rating);

        res.render('jee_predictor', {
            results: results,
            jeeScore,
            location,
            branch
        });

    } catch (err) {
        console.error("JEE Prediction Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
