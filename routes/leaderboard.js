const express = require('express');
const router = express.Router();
const QuizResult = require('../model/QuizResult');
const User = require('../model/User');

router.get('/leaderboard', async (req, res) => {
    try {
        let user = null;
        let userId = req.session.userId || (req.user && req.user._id);

        if (userId) {
            user = await User.findById(userId);
        }

        // Aggregate top scores
        // We want the HIGHEST score per user
        const leaderboard = await QuizResult.aggregate([
            { $sort: { score: -1 } },
            {
                $group: {
                    _id: "$userId",
                    maxScore: { $max: "$score" },
                    attempts: { $sum: 1 },
                    lastDate: { $last: "$date" }
                }
            },
            { $sort: { maxScore: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" }
        ]);

        res.render('leaderboard', { leaderboard, user: user || { username: 'Guest' } });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

module.exports = router;
