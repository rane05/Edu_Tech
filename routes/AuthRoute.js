const express = require('express');
const router = express.Router();
const User = require('../model/User'); // Assuming you have a User model
const passport = require('passport');
require('dotenv').config();
// require('../passport'); // Ensure you have passport strategies configured

// Environment variables
const sessionSecret = process.env.SESSION_SECRET;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Registration route
router.get('/register', (req, res) => {
    res.render('register');
});

//router post ka jaha tole dega 
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = new User({ username, role });

        await User.register(user, password); // Use `await` instead of callback

        // After successful registration, redirect to login page
        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/login');

    } catch (err) {
        console.error("Registration error:", err);
        req.flash('error', err.message || 'Error registering user.');
        res.redirect('/register');
    }
});



// Login routes
router.get('/login', (req, res) => {
    res.render('login');
});

// Login POST request
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = await User.findOne({ username, role });
        if (!user) {
            req.flash('error', 'Invalid username, password, or role.');
            return res.redirect('/login');
        }

        const { user: authedUser, error } = await user.authenticate(password);
        if (error || !authedUser) {
            req.flash('error', 'Invalid username, password, or role.');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.role = user.role;

        req.flash('success', 'Successfully logged in!');

        // Redirect based on role
        if (role === 'student') {
            return res.redirect('/');
        } else if (role === 'parent') {
            return res.redirect('/parent_home');
        } else if (role === 'teacher') {
            return res.redirect('/teacher_home');
        }

    } catch (err) {
        console.error("Login error:", err);
        req.flash('error', 'An unexpected error occurred during login.');
        res.redirect('/login');
    }
});


// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
            return res.redirect('/'); // Just redirect rather than crashing
        }
        res.redirect('/login');
    });
});

// Google Auth Routes



// Google authentication route
/*
// Google authentication route
router.get('/auth/google', passport.authenticate('google', { 
    scope: [ 'email', 'profile' ] 
})); 

// Google authentication callback
router.get('/auth/google/callback', passport.authenticate('google', { 
    successRedirect: '/success', 
    failureRedirect: '/failure'
}));
*/

// Success route
router.get('/success', (req, res) => {
    if (!req.user) {
        return res.redirect('/failure');
    }
    console.log(req.user);
    res.send("Welcome " + req.user.email);
});

// Failure route
router.get('/failure', (req, res) => {
    res.send("Error during authentication");
});

module.exports = router;
