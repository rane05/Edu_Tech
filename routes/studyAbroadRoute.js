const express = require('express');
const router = express.Router();
const AdvisorBooking = require('../model/advisorBooking');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// GET /study-abroad - Main landing page for global studies
router.get('/study-abroad', isLoggedIn, (req, res) => {
    res.render('study_abroad', {
        title: 'Global Opportunities & Study Abroad',
        userId: req.session.userId
    });
});

// GET /book-advisor - Render the booking form for 1-on-1 counseling
router.get('/book-advisor', isLoggedIn, (req, res) => {
    res.render('book_advisor', {
        title: 'Book Global Advisor Session',
        userId: req.session.userId,
        username: req.session.username
    });
});

// POST /book-advisor - Process booking request and save to MongoDB
router.post('/book-advisor', isLoggedIn, async (req, res) => {
    try {
        const { name, email, phone, country, course, intake, gpa } = req.body;

        const newBooking = new AdvisorBooking({
            userId: req.session.userId,
            name,
            email,
            phone,
            country,
            course,
            intake,
            gpa
        });

        await newBooking.save();

        // Render success view with personalized pathway preview
        res.render('booking_success', {
            name,
            country,
            course,
            intake,
            userId: req.session.userId
        });
    } catch (err) {
        console.error("Advisor Booking Error:", err);
        res.status(500).send("Error saving your booking. Please try again later.");
    }
});

module.exports = router;
