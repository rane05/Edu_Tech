const express = require('express');
const router = express.Router();
const QuizResult = require('../model/QuizResult');
const User = require('../model/User');

router.get('/dashboard', async (req, res) => {
    const userId = req.session.userId || (req.user && req.user._id);
    if (!userId) return res.redirect('/login');

    try {
        const user = await User.findById(userId);
        const results = await QuizResult.find({ userId: userId }).sort({ date: 1 });

        // Calculate Stats
        const totalAttempts = results.length;
        const bestScore = totalAttempts > 0 ? Math.max(...results.map(r => r.score)) : 0;
        const avgScore = totalAttempts > 0 ? (results.reduce((a, b) => a + b.score, 0) / totalAttempts).toFixed(1) : 0;

        res.render('user_dashboard', {
            user: user,
            results,
            stats: { totalAttempts, bestScore, avgScore }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

module.exports = router;
