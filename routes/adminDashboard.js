const express = require('express');
const router = express.Router();
const User = require('../model/User');
const College = require('../model/cetCollege');
const Feedback = require('../model/Feedback');
const AdmissionRequest = require('../model/AdmissionRequest');

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Unauthorized access.');
    res.redirect('/login');
}

// Admin Dashboard Home
router.get('/admin/dashboard', isAdmin, async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const parentCount = await User.countDocuments({ role: 'parent' });
        const collegeCount = await User.countDocuments({ role: 'college' });

        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10);
        const recentColleges = await College.find().sort({ _id: -1 }).limit(5);

        res.render('admin/dashboard', {
            stats: { studentCount, teacherCount, parentCount, collegeCount },
            feedbacks,
            recentColleges,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Manage Users (Students, Teachers, Parents)
router.get('/admin/users/:role', isAdmin, async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role }).sort({ username: 1 });
        res.render('admin/users_list', { users, role, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Manage Colleges
router.get('/admin/colleges', isAdmin, async (req, res) => {
    try {
        const colleges = await College.find().sort({ isSponsored: -1, name: 1 });
        res.render('admin/colleges_list', { colleges, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Toggle College Sponsorship
router.post('/admin/college/sponsor/:id', isAdmin, async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) return res.status(404).send('College not found');

        college.isSponsored = !college.isSponsored;
        await college.save();

        req.flash('success', `College sponsorship ${college.isSponsored ? 'enabled' : 'disabled'}.`);
        res.redirect('/admin/colleges');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// View All Feedback
router.get('/admin/feedback', isAdmin, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.render('admin/feedback_list', { feedbacks, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Feedback
router.post('/admin/feedback/delete/:id', isAdmin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        req.flash('success', 'Feedback deleted.');
        res.redirect('/admin/feedback');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
