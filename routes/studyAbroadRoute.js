const express = require('express');
const router = express.Router();
const AdvisorBooking = require('../model/advisorBooking');

// Middleware to check if user is logged in (optional, but good for student section)
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

router.get('/study-abroad', isLoggedIn, (req, res) => {
    res.render('study_abroad', {
        title: 'Global Opportunities & Study Abroad',
        userId: req.session.userId
    });
});

// GET /book-advisor - Render the booking form
router.get('/book-advisor', isLoggedIn, (req, res) => {
    res.render('book_advisor', {
        title: 'Book Global Advisor Session',
        userId: req.session.userId,
        username: req.session.username // Assuming this is set on login
    });
});

// POST /book-advisor - Handle the booking
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

        // Redirect to a success page that gives a personal AI-like "Path Preview"
        res.render('booking_success', {
            name,
            country,
            course,
            intake,
            userId: req.session.userId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving your booking. Please try again.");
    }
});

module.exports = router;
