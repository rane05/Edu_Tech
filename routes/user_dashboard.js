const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QuizResult = require('../model/QuizResult');
const User = require('../model/User');
const AdmissionRequest = require('../model/AdmissionRequest');
const College = require('../model/cetCollege');

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

        // Fetch Teacher Updates (Direct Institutional Connection)
        const Profile = require('../model/profile');
        const TeacherWork = require('../model/teacherwork');
        const Doubt = require('../model/Doubt');
        const studentProfile = await Profile.findOne({
            $or: [{ userId: userId }, { userId: new mongoose.Types.ObjectId(userId) }, { userId: userId.toString() }]
        });

        let teacherUpdates = [];
        let resources = [];
        let doubtSessions = [];
        let myDoubts = [];

        if (studentProfile && studentProfile.collegeName) {
            const safeCollegeName = studentProfile.collegeName.trim();
            const collegeRegex = new RegExp(`^${safeCollegeName}$`, 'i'); // Case-insensitive exact match

            // Find all work shared with THIS college
            teacherUpdates = await TeacherWork.find({ collegeName: collegeRegex, type: { $in: ["task", "announcement"] } })
                .sort({ createdAt: -1 })
                .limit(10);

            resources = await TeacherWork.find({ collegeName: collegeRegex, type: "resource" })
                .sort({ createdAt: -1 });

            doubtSessions = await TeacherWork.find({ collegeName: collegeRegex, type: "doubt_session" })
                .sort({ date: 1 });

            myDoubts = await Doubt.find({ studentId: userId }).sort({ createdAt: -1 });
        }

        const admissionRequests = await AdmissionRequest.find({ studentId: userId })
            .populate('collegeId', 'name location userId')
            .sort({ createdAt: -1 });

        res.render('user_dashboard', {
            username: req.user.username,
            totalAttempts,
            bestScore,
            avgScore,
            results, // Added back
            teacherUpdates,
            resources,
            doubtSessions,
            myDoubts,
            admissionRequests
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// POST: Submit Doubt
router.post('/submitDoubt', async (req, res) => {
    try {
        const { subject, question } = req.body;
        const userId = req.user._id;

        const Profile = require('../model/profile');
        const Doubt = require('../model/Doubt');

        const studentProfile = await Profile.findOne({ userId });
        if (!studentProfile || !studentProfile.collegeName) {
            return res.status(400).send("Student profile or college name not found.");
        }

        await Doubt.create({
            studentId: userId,
            studentName: studentProfile.fullName,
            collegeName: studentProfile.collegeName,
            subject,
            question
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Doubt submission error:", err);
        res.status(500).send("Error submitting doubt");
    }
});

module.exports = router;
