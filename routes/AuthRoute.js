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

        if (role === 'admin') {
            req.flash('error', 'Admin registration is disabled for security reasons.');
            return res.redirect('/register');
        }

        const user = new User({ username, role });

        await User.register(user, password); // Use `await` instead of callback

        // If registering as a college, immediately create the profile document
        if (role === 'college') {
            const College = require('../model/cetCollege');
            await College.create({
                userId: user._id,
                name: username.split('@')[0],
                contactEmail: username,
                university: 'Pending Update',
                location: 'Pending Update',
                description: 'A newly registered college on EduTech platform.'
            });
            console.log("Registered and initialized college profile for:", username);
        }

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

router.post('/login', async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        if (!role) {
            req.flash('error', 'Please select a role.');
            return res.redirect('/login');
        }

        // Special check for Admin credentials - Direct login
        if (role === 'admin') {
            if (username === 'admin@gmail.com' && password === 'Admin@2005') {
                let adminUser = await User.findOne({ username: 'admin@gmail.com', role: 'admin' });
                if (!adminUser) {
                    try {
                        const newAdmin = new User({ username: 'admin@gmail.com', role: 'admin' });
                        adminUser = await User.register(newAdmin, 'Admin@2005');
                        console.log('Admin user auto-created.');
                    } catch (seedErr) {
                        console.error('Error auto-creating admin:', seedErr);
                        req.flash('error', 'System error initializing admin access.');
                        return res.redirect('/login');
                    }
                }

                // Directly login the admin without multi-step passport.authenticate
                return req.login(adminUser, (err) => {
                    if (err) return next(err);
                    req.session.userId = adminUser._id;
                    req.session.role = adminUser.role;
                    req.flash('success', 'Master Admin Access Granted.');
                    return res.redirect('/admin/dashboard');
                });
            } else {
                req.flash('error', 'Invalid Administrative Credentials.');
                return res.redirect('/login');
            }
        }

        // First find user by username to provide better feedback
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'No account found with this email.');
            return res.redirect('/login');
        }

        // Check if role matches
        if (user.role !== role) {
            req.flash('error', `This account is registered as a ${user.role}, not a ${role}.`);
            return res.redirect('/login');
        }

        // Use passport to authenticate the user's password
        passport.authenticate('local', (err, authedUser, info) => {
            if (err) {
                console.error("Passport auth error:", err);
                return next(err);
            }
            if (!authedUser) {
                req.flash('error', info.message || 'Invalid username or password.');
                return res.redirect('/login');
            }

            // Establish passport session
            req.login(authedUser, (err) => {
                if (err) return next(err);

                console.log("LOGIN SUCCESS:", authedUser.username);
                console.log("AUTHED USER ID TYPE:", typeof authedUser._id, "VALUE:", authedUser._id);
                // Set custom session data for legacy route checks
                req.session.userId = authedUser._id;
                req.session.role = authedUser.role;

                req.flash('success', `Welcome back, ${authedUser.username}!`);

                // Redirect based on role
                if (authedUser.role === 'student') {
                    return res.redirect('/'); // Redirect to home page for student
                } else if (authedUser.role === 'parent') {
                    return res.redirect('/parentprofile'); // Consistent with parent dashboard
                } else if (authedUser.role === 'teacher') {
                    return res.redirect('/teacher_home');
                } else if (authedUser.role === 'college') {
                    // Ensure college profile exists in MongoDB
                    const College = require('../model/cetCollege');
                    College.findOne({ userId: authedUser._id }).then(college => {
                        if (!college) {
                            College.create({
                                userId: authedUser._id,
                                name: authedUser.username.split('@')[0], // Default name from email/username
                                contactEmail: authedUser.username,
                                university: 'Pending Update',
                                location: 'Pending Update'
                            }).then(() => {
                                console.log("Auto-initialized college profile for:", authedUser.username);
                            }).catch(err => console.error("Auto-initialization error:", err));
                        }
                    }).catch(err => console.error("Profile check error:", err));

                    return res.redirect('/college/dashboard');
                } else if (authedUser.role === 'admin') {
                    return res.redirect('/admin/dashboard');
                }
                res.redirect('/');
            });
        })(req, res, next);

    } catch (err) {
        console.error("Login unexpected error:", err);
        req.flash('error', 'An unexpected error occurred during login.');
        res.redirect('/login');
    }
});


// Logout route
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
            }
            res.redirect('/login');
        });
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
