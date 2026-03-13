const express = require('express');
const router = express.Router();
const Feedback = require('../model/Feedback');

// Middleware to check if logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'Please log in to give feedback.');
    res.redirect('/login');
}

// Get feedback form
router.get('/feedback', isLoggedIn, (req, res) => {
    res.render('feedback/form', { user: req.user });
});

// Post feedback
router.post('/feedback', isLoggedIn, async (req, res) => {
    try {
        const { subject, message, rating } = req.body;
        const feedback = new Feedback({
            userId: req.user._id,
            username: req.user.username,
            role: req.user.role,
            subject,
            message,
            rating
        });
        await feedback.save();
        req.flash('success', 'Thank you for your feedback! We will use it to improve.');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error submitting feedback.');
        res.redirect('/feedback');
    }
});

module.exports = router;
