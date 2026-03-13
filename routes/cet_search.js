const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const College = require('../model/cetCollege');

const COLLEGES_DATA_PATH = path.join(__dirname, '../all_colleges_data.json');
let allColleges = [];

// Load data into memory on startup
const loadColleges = async () => {
    try {
        if (fs.existsSync(COLLEGES_DATA_PATH)) {
            console.log("Loading predictor colleges from JSON...");
            const rawData = fs.readFileSync(COLLEGES_DATA_PATH, 'utf8');
            const collegesObj = JSON.parse(rawData);
            allColleges = Object.values(collegesObj);
            console.log(`Loaded ${allColleges.length} colleges from JSON.`);
        } else {
            console.log("JSON file missing, no predictor data loaded.");
        }
    } catch (err) {
        console.error("Error loading college data:", err);
    }
};

loadColleges();

// Render the Search Page
router.get('/cet-predictor', (req, res) => {
    res.render('cet_predictor', { results: null });
});

// API to Search Colleges
router.post('/api/cet/predict', async (req, res) => {
    try {
        const { score, category, location, branch } = req.body;
        const userScore = parseFloat(score);

        if (!userScore || !category) {
            return res.render('cet_predictor', { results: [], error: 'Please enter valid score and category.', score, category });
        }

<<<<<<< HEAD
        const categoryMap = {
            'OPEN': ['OPEN', 'GOPENH', 'GOPENS', 'LOPENH', 'LOPENS', 'General'],
            'SC': ['SC', 'GSCH', 'GSCS', 'LSCH', 'LSCS'],
            'ST': ['ST', 'GSTH', 'GSTS', 'LSTH', 'LSTS'],
            'VJ': ['VJ', 'GVJH', 'GVJS', 'LVJH', 'LVJS'],
            'NT1': ['NT1', 'GNT1H', 'GNT1S', 'LNT1H', 'LNT1S'],
            'NT2': ['NT2', 'GNT2H', 'GNT2S', 'LNT2H', 'LNT2S'],
            'NT3': ['NT3', 'GNT3H', 'GNT3S', 'LNT3H', 'LNT3S'],
            'OBC': ['OBC', 'GOBCH', 'GOBCS', 'LOBCH', 'LOBCS'],
            'TFWS': ['TFWS'],
            'EWS': ['EWS'],
            'PWD': ['PWD', 'PWDOPENH', 'PWDOPENS'],
            'DEF': ['DEF', 'DEFOPENH', 'DEFOPENS']
=======
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
>>>>>>> origin/Teachers-students-connect
        };

        const searchCategories = categoryMap[category] || [category];

<<<<<<< HEAD
        // --- Filter from Memory ---
        // 1. Filter by Location & Basic Eligibility
        const candidateColleges = allColleges.filter(college => {
            // Location Filter
            let locMatch = true;
            if (location && location.trim() !== "") {
                const locRegex = new RegExp(location, 'i');
                const cLoc = college.location || "";
                const cName = college.name || "";
                // Match location or name (similar to previous "OR" logic)
                if (!locRegex.test(cLoc) && !locRegex.test(cName)) {
                    return false;
                }
            } else {
                // Default: restrict to Maharashtra-ish scope if needed, 
                // but original logic had explicit "Maharashtra" or list of cities.
                // If location is empty, we generally show all valid matches in previous logic
                // assuming filtering by score will narrow it down.
                // However, the original had:
                // { $or: [ { location: regex... }, { location: "" }, ... ] }
                // Let's keep it simple: if no location specified, allow all.
            }

            // Check if ANY branch has a cutoff <= userScore for the category
            // We can do this lazily during mapping, but filtering here optimizes a bit.
            // But strict filtering here might be expensive if branches are complex.
            // Let's do the rigorous branch filtering in the map step.
            return true;
        });

        // --- Process Results ---
        const results = candidateColleges.map(college => {
            // Convert branches object to array if it is not already
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

                const bestMatch = qualifyingCutoffs[0];

                // Trend Data
                const yearlyData = {};
                qualifyingCutoffs.forEach(c => {
                    const key = `${c.year}-R${c.round}`;
                    // Keep distinct year-round points
                    if (!yearlyData[key]) yearlyData[key] = c.cetScore;
                });

                // Calculation logic
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
                    category: bestMatch.category, // helpful to know which cat matched
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

        // Limit results to top 100 to avoid rendering performance issues
        const limitedResults = results.slice(0, 100);

        // --- Similar Colleges Logic ---
        // (Similar logic but accessing JSON)
        let similarColleges = [];
        if (limitedResults.length < 10) {
            // Find colleges where lowest eligible cutoff is slightly > userScore
            // Gap between 0 and 5

            const slightlyAbove = allColleges.map(c => {
                const branchesVal = Array.isArray(c.branches) ? c.branches : Object.values(c.branches);

                // Check valid branches
                const matchingBranch = branchesVal.find(b => {
                    // Check for any cutoff just above user score
                    return b.cutoffs.some(cu =>
                        searchCategories.includes(cu.category) &&
                        cu.cetScore > userScore &&
                        cu.cetScore <= userScore + 5
                    );
                });

                if (!matchingBranch) return null;

                // Get specific cutoff detail
                const relevantCutoffs = matchingBranch.cutoffs
                    .filter(cu => searchCategories.includes(cu.category) && cu.cetScore > userScore && cu.cetScore <= userScore + 5)
                    .sort((a, b) => a.cetScore - b.cetScore); // lowest of the high ones

                if (relevantCutoffs.length === 0) return null;
                const bestNearMiss = relevantCutoffs[0];

                return {
                    name: c.name,
                    location: c.location || 'Maharashtra',
                    branch: matchingBranch.name,
                    cutoff: bestNearMiss.cetScore,
                    gap: (bestNearMiss.cetScore - userScore).toFixed(2)
                };
            }).filter(Boolean);

            similarColleges = slightlyAbove.slice(0, 5);
        }

        res.render('cet_predictor', {
            results: limitedResults,
            similarColleges,
=======
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
>>>>>>> origin/Teachers-students-connect
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

