const express = require('express');
const router = express.Router();
const Question = require('../model/questions');
const QuizResult = require('../model/QuizResult');
const User = require('../model/User'); // Import User model

// Middleware to check login (Session Based OR Passport)
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) return next();
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    if (req.user) return next();

    console.log("Auth Failed -> Redirecting to Login");
    res.redirect('/login');
}

// 1. GET /smart-quiz - Start the Quiz
router.get('/smart-quiz', isLoggedIn, async (req, res) => {
    try {
        // Fetch User to pass to view
        let userId = req.session.userId || (req.user && req.user._id);
        const user = await User.findById(userId);

        // Fetch 15 random questions
        const questions = await Question.aggregate([{ $sample: { size: 15 } }]);
        res.render('smart_quiz', { questions, user: user });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// 2. POST /api/quiz/submit - Submit Answers
router.post('/api/quiz/submit', isLoggedIn, async (req, res) => {
    try {
        const { answers } = req.body; // { qId1: 'optionA', qId2: 'optionB' }
        let score = 0;
        let correctCount = 0;
        let sectionScores = { quantitative: 0, verbal: 0, logical: 0 };

        const questions = await Question.find({ _id: { $in: Object.keys(answers) } });

        questions.forEach(q => {
            const userAns = answers[q._id];
            if (userAns === q.correctAnswer) {
                score += 4; // +4 for correct
                correctCount++;

                // Track section scores
                const sec = q.section ? q.section.toLowerCase() : 'general';
                if (sectionScores[sec] !== undefined) sectionScores[sec] += 4;
            } else {
                // Negative marking? Let's keep it simple for now (0 for wrong)
            }
        });

        // Save Result using session userId
        const result = await QuizResult.create({
            userId: req.session.userId, // UPDATED
            score,
            correctAnswers: correctCount,
            sectionScores,
            totalQuestions: questions.length
        });

        res.json({ success: true, score, resultId: result._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Submission failed' });
    }
});

module.exports = router;
