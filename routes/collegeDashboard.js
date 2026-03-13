const express = require('express');
const router = express.Router();
const College = require('../model/cetCollege');
const AdmissionRequest = require('../model/AdmissionRequest');
const ChatMessage = require('../model/ChatMessage');
const User = require('../model/User');

// Middleware to check if user is a college
function isCollege(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'college') {
        return next();
    }
    req.flash('error', 'Unauthorized access.');
    res.redirect('/login');
}

// College Dashboard Home
router.get('/college/dashboard', isCollege, async (req, res) => {
    try {
        let college = await College.findOne({ userId: req.user._id });

        // If profile doesn't exist, redirect to profile creation
        if (!college) {
            return res.render('college/create_profile', { user: req.user });
        }

        const requests = await AdmissionRequest.find({ collegeId: college._id })
            .populate('studentId', 'username email')
            .sort({ createdAt: -1 });

        const unreadMessages = await ChatMessage.countDocuments({
            receiverId: req.user._id,
            read: false
        });

        res.render('college/dashboard', {
            college,
            requests,
            unreadMessages,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update College Profile
router.post('/college/profile/update', isCollege, async (req, res) => {
    try {
        const { name, university, location, description, contactEmail, website } = req.body;

        let college = await College.findOne({ userId: req.user._id });

        if (college) {
            college.name = name;
            college.university = university;
            college.location = location;
            college.description = description;
            college.contactEmail = contactEmail;
            college.website = website;
            await college.save();
        } else {
            college = new College({
                userId: req.user._id,
                name,
                university,
                location,
                description,
                contactEmail,
                website
            });
            await college.save();
        }

        req.flash('success', 'Profile updated successfully!');
        res.redirect('/college/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error updating profile.');
        res.redirect('/college/dashboard');
    }
});

// Handle Admission Requests
router.post('/college/request/:id/:status', isCollege, async (req, res) => {
    try {
        const { id, status } = req.params;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).send('Invalid status');
        }

        const request = await AdmissionRequest.findById(id);
        if (!request) return res.status(404).send('Request not found');

        request.status = status;
        await request.save();

        req.flash('success', `Request ${status} successfully!`);
        res.redirect('/college/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Chat List for College
router.get('/college/chat/list', isCollege, async (req, res) => {
    try {
        // Find all unique students who have sent or received messages from this college
        const studentIds = await ChatMessage.distinct('senderId', { receiverId: req.user._id });
        const receivedIds = await ChatMessage.distinct('receiverId', { senderId: req.user._id });

        const allIds = [...new Set([...studentIds, ...receivedIds])];
        const students = await User.find({ _id: { $in: allIds }, role: 'student' }).select('username email');

        res.render('college/chat_list', { students, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Chat Interface for College
router.get('/college/chat/:studentId', isCollege, async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId);
        if (!student) return res.status(404).send('Student not found');

        const messages = await ChatMessage.find({
            $or: [
                { senderId: req.user._id, receiverId: student._id },
                { senderId: student._id, receiverId: req.user._id }
            ]
        }).sort({ timestamp: 1 });

        // Mark messages as read
        await ChatMessage.updateMany(
            { senderId: student._id, receiverId: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.render('college/chat', { student, messages, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// module.exports removed duplicate route handler that is now in admission.js
module.exports = router;
