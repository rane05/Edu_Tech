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

<<<<<<< Updated upstream
        // Apply Location Filter if provided
        if (location && location !== "") {
            query.location = { $regex: new RegExp(location, 'i') };
=======
        // --- Fetch from MongoDB ---
        const query = {};
        if (location && location.trim() !== "") {
            const locRegex = new RegExp(location, 'i');
            query.$or = [
                { location: locRegex },
                { name: locRegex }
            ];
        }

        // Fetch colleges that have at least one branch with a matching cutoff category and score
        // This pre-filters the data significantly
        const matchingColleges = await College.find({
            ...query,
            'branches.cutoffs': {
                $elemMatch: {
                    category: { $in: searchCategories },
                    cetScore: { $lte: userScore }
                }
            }
        }).lean();

        // --- Process Results ---
        const results = matchingColleges.map(college => {
            const branchesVal = Array.isArray(college.branches)
                ? college.branches
                : Object.values(college.branches);

            const eligibleBranches = branchesVal.map(b => {
                // Filter cutoffs
                const qualifyingCutoffs = b.cutoffs.filter(c =>
                    searchCategories.includes(c.category) && c.cetScore <= userScore
                );
                if (qualifyingCutoffs.length === 0) return null;

                // Sort: Newest Year -> Latest Round -> Highest Score
                qualifyingCutoffs.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return b.round - a.round;
                });

                // Branch Name Filter
                if (branch && branch.trim() !== "") {
                    const bName = b.name.toLowerCase();
                    const filter = branch.toLowerCase();
                    if (filter === 'cs' || filter === 'computer') {
                        if (!bName.includes('computer') && !bName.includes('data science') && !bName.includes('artificial')) return null;
                    } else if (filter === 'it') {
                        if (!bName.includes('information') && !bName.includes('it')) return null;
                    } else if (filter === 'entc' || filter === 'electronics') {
                        if (!bName.includes('electronics') && !bName.includes('e&tc')) return null;
                    } else if (!bName.includes(filter)) {
                        return null;
                    }
                }

                // Update: Capture data for each round
                const roundData = {};
                qualifyingCutoffs.forEach(c => {
                    const roundKey = `Round ${c.round}`;
                    if (!roundData[roundKey]) {
                        // Calculation logic per round
                        const roundGap = userScore - c.cetScore;
                        let rFit, rType, rBadge;
                        if (roundGap > 5) {
                            rFit = Math.min(99, Math.round(85 + (roundGap / 2)));
                            rType = 'Safe';
                            rBadge = 'badge-success-soft';
                        } else if (roundGap >= 2) {
                            rFit = Math.round(70 + roundGap * 5);
                            rType = 'Moderate';
                            rBadge = 'badge-warning-soft';
                        } else {
                            rFit = Math.round(60 + roundGap * 10);
                            rType = 'Dream';
                            rBadge = 'badge-danger-soft';
                        }
                        roundData[roundKey] = {
                            score: c.cetScore,
                            year: c.year,
                            fitScore: rFit,
                            type: rType,
                            badgeClass: rBadge
                        };
                    }
                });

                const bestMatch = qualifyingCutoffs[0];

                // Trend Data
                const yearlyData = {};
                qualifyingCutoffs.forEach(c => {
                    const key = `${c.year}-R${c.round}`;
                    if (!yearlyData[key]) yearlyData[key] = c.cetScore;
                });

                // Overall Calculation logic (based on latest round best match)
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
                    trend: yearlyData,
                    roundData: roundData, // Added rounds data
                    category: bestMatch.category,
                    fitScore, type, badgeClass
                };
            }).filter(Boolean);

            if (eligibleBranches.length === 0) return null;

            // College-level stats
            const topBranches = eligibleBranches.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
            const avgFit = Math.round(topBranches.reduce((sum, b) => sum + b.fitScore, 0) / topBranches.length);
            const bestType = topBranches[0].type;
            const bestBadge = topBranches[0].badgeClass;

            return {
                name: college.name,
                location: college.location || "Maharashtra",
                branches: eligibleBranches,
                fitScore: avgFit,
                type: bestType,
                badgeClass: bestBadge
            };
        }).filter(Boolean);

        // Sort by Fit Score High -> Low
        results.sort((a, b) => b.fitScore - a.fitScore);

        // Limit results to top 100
        const limitedResults = results.slice(0, 100);

        // --- Similar Colleges Logic ---
        let similarColleges = [];
        if (limitedResults.length < 10) {
            // Find colleges where lowest eligible cutoff is slightly > userScore
            const slightlyAboveColleges = await College.find({
                ...query,
                'branches.cutoffs': {
                    $elemMatch: {
                        category: { $in: searchCategories },
                        cetScore: { $gt: userScore, $lte: userScore + 5 }
                    }
                }
            }).limit(20).lean();

            similarColleges = slightlyAboveColleges.map(c => {
                const branchesVal = Array.isArray(c.branches) ? c.branches : Object.values(c.branches);
                const matchingBranch = branchesVal.find(b => {
                    return b.cutoffs.some(cu =>
                        searchCategories.includes(cu.category) &&
                        cu.cetScore > userScore &&
                        cu.cetScore <= userScore + 5
                    );
                });

                if (!matchingBranch) return null;

                const relevantCutoffs = matchingBranch.cutoffs
                    .filter(cu => searchCategories.includes(cu.category) && cu.cetScore > userScore && cu.cetScore <= userScore + 5)
                    .sort((a, b) => a.cetScore - b.cetScore);

                if (relevantCutoffs.length === 0) return null;
                const bestNearMiss = relevantCutoffs[0];

                return {
                    name: c.name,
                    location: c.location || 'Maharashtra',
                    branch: matchingBranch.name,
                    cutoff: bestNearMiss.cetScore,
                    gap: (bestNearMiss.cetScore - userScore).toFixed(2)
                };
            }).filter(Boolean).slice(0, 5);
>>>>>>> Stashed changes
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

