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

        // 1. Initial Mapping & Search Category
        const searchCategories = [category];
        if (category === 'OPEN') searchCategories.push('General');

        // 2. Build Query
        let query = {
            'branches.cutoffs': {
                $elemMatch: {
                    category: { $in: searchCategories },
                    cetScore: { $lte: userScore + 5 } // Fetch slightly above to handle trends
                }
            }
        };

        // Enforce Maharashtra State Filter
        query.$or = [
            { location: { $regex: /Maharashtra|Mumbai|Pune|Nagpur|Nashik|Aurangabad/i } },
            { location: "" },
            { location: null }
        ];

        if (location && location.trim() !== "") {
            const locRegex = new RegExp(location.trim(), 'i');
            query.$and = [
                { $or: [{ location: locRegex }, { name: locRegex }] }
            ];
        }

        // 3. Fetch Data
        const matchingColleges = await College.find(query).lean();

        // 4. Process Results
        const results = matchingColleges.map(college => {
            const branchesVal = Array.isArray(college.branches) ? college.branches : Object.values(college.branches);

            const eligibleBranches = branchesVal.map(b => {
                // Filter cutoffs for this user
                const qualifyingCutoffs = b.cutoffs.filter(c =>
                    searchCategories.includes(c.category) && c.cetScore <= userScore
                );

                if (qualifyingCutoffs.length === 0) return null;

                // Branch Name Filter (if provided)
                if (branch && branch.trim() !== "") {
                    const bName = b.name.toLowerCase();
                    const filter = branch.trim().toLowerCase();
                    if (!bName.includes(filter)) return null;
                }

                // Sort and find best match
                qualifyingCutoffs.sort((a, b) => (b.year !== a.year) ? (b.year - a.year) : (b.round - a.round));
                const bestMatch = qualifyingCutoffs[0];

                // Overall Calculation logic
                const gap = userScore - bestMatch.cetScore;
                let fitScore, type, badgeClass;
                if (gap > 5) {
                    fitScore = Math.min(99, Math.round(85 + (gap / 2)));
                    type = 'Safe';
                    badgeClass = 'badge-success-soft';
                } else if (gap >= 2) {
                    fitScore = Math.round(70 + gap * 5);
                    type = 'Moderate';
                    badgeClass = 'badge-warning-soft';
                } else {
                    fitScore = Math.round(60 + gap * 10);
                    type = 'Dream';
                    badgeClass = 'badge-danger-soft';
                }

                return {
                    name: b.name,
                    cutoff: bestMatch.cetScore,
                    year: bestMatch.year,
                    round: bestMatch.round,
                    category: bestMatch.category,
                    fitScore, type, badgeClass
                };
            }).filter(Boolean);

            if (eligibleBranches.length === 0) return null;

            // Sort branches by fit score
            eligibleBranches.sort((a, b) => b.fitScore - a.fitScore);

            return {
                ...college,
                branches: eligibleBranches,
                fitScore: eligibleBranches[0].fitScore,
                type: eligibleBranches[0].type,
                badgeClass: eligibleBranches[0].badgeClass
            };
        }).filter(Boolean);

        // Sort Colleges by overall fit
        results.sort((a, b) => b.fitScore - a.fitScore);

        res.render('cet_predictor', {
            results: results.slice(0, 50),
            score,
            category,
            location,
            branch
        });

    } catch (err) {
        console.error("CET Prediction Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;

