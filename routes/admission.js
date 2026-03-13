const express = require('express');
const router = express.Router();
const AdmissionRequest = require('../model/AdmissionRequest');
const College = require('../model/cetCollege');
const ChatMessage = require('../model/ChatMessage');
const User = require('../model/User');

// Middleware to check if user is a student
function isStudent(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'student') {
        return next();
    }
    req.flash('error', 'Please log in as a student.');
    res.redirect('/login');
}

// Check login for chat
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ success: false, message: 'Please log in' });
}

// List all colleges for students
router.get('/student/colleges', async (req, res) => {
    try {
        // Only show colleges that have a userId (i.e., they are registered via the platform)
        const colleges = await College.find({ userId: { $ne: null } }).sort({ isSponsored: -1, name: 1 });
        res.render('student/colleges_list', { colleges, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// View single college
router.get('/colleges/view/:id', async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) return res.status(404).send('College not found');

        // Check if student already applied
        let alreadyApplied = false;
        if (req.user && req.user.role === 'student') {
            const request = await AdmissionRequest.findOne({
                studentId: req.user._id,
                collegeId: college._id
            });
            alreadyApplied = !!request;
        }

        res.render('student/college_view', { college, alreadyApplied, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Student applies to college
router.post('/college/apply/:collegeId', isStudent, async (req, res) => {
    try {
        const { name, email, phone, marks_10th, marks_12th, preferredBranch, additionalInfo } = req.body;

        // Check if already applied
        const existing = await AdmissionRequest.findOne({
            studentId: req.user._id,
            collegeId: req.params.collegeId
        });

        if (existing) {
            req.flash('error', 'You have already applied to this college.');
            return res.redirect(`/colleges/view/${req.params.collegeId}`);
        }

        const request = new AdmissionRequest({
            studentId: req.user._id,
            collegeId: req.params.collegeId,
            studentInfo: {
                name, email, phone,
                marks_10th: Number(marks_10th),
                marks_12th: Number(marks_12th),
                preferredBranch,
                additionalInfo
            }
        });

        await request.save();
        req.flash('success', 'Application submitted successfully! The college will review it soon.');
        res.redirect(`/colleges/view/${req.params.collegeId}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error submitting application.');
        res.redirect('back');
    }
});

// Student chat with college
router.get('/student/chat/:collegeUserId', isStudent, async (req, res) => {
    try {
        const collegeUser = await User.findById(req.params.collegeUserId);
        if (!collegeUser) return res.status(404).send('College not found');

        const messages = await ChatMessage.find({
            $or: [
                { senderId: req.user._id, receiverId: collegeUser._id },
                { senderId: collegeUser._id, receiverId: req.user._id }
            ]
        }).sort({ timestamp: 1 });

        // Mark messages as read
        await ChatMessage.updateMany(
            { senderId: collegeUser._id, receiverId: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.render('student/chat', { collegeUser, messages, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Send Message (Universal)
router.post('/college/chat/send', isLoggedIn, async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const newMessage = new ChatMessage({
            senderId: req.user._id,
            receiverId,
            message
        });
        await newMessage.save();
        res.json({ success: true, message: newMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
