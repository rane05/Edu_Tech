const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QuizResult = require('../model/QuizResult');
const User = require('../model/User');
const Profile = require('../model/profile');
const TeacherWork = require('../model/teacherwork');
const TeacherProfile = require('../model/TeacherProfile');
const Doubt = require('../model/Doubt');
const AdmissionRequest = require('../model/AdmissionRequest');
const College = require('../model/cetCollege');

// Task 9: Social Learning Feed Snippet (cron job simulation)
let currentSocialFeeds = [
    "A batchmate just aced the Machine Learning mock interview!",
    "A peer from your college completed their Software Engineering Roadmap."
];
setInterval(() => {
    const pool = [
        "A student in your district unlocked the 'Innovator' badge.",
        "Batchmate aced mock interview with a 95% rating.",
        "A peer completed their Data Structures roadmap.",
        "Someone from your course just ranked top 10 in a recent aptitude quiz."
    ];
    currentSocialFeeds = pool.sort(() => 0.5 - Math.random()).slice(0, 2);
}, 3600000); // refresh every hour

router.get('/dashboard', async (req, res) => {
    const userId = req.session.userId || (req.user && req.user._id);
    if (!userId) return res.redirect('/login');

    try {
        const user = await User.findById(userId);
        const results = await QuizResult.find({ userId: userId }).sort({ date: 1 });
        const profile = await Profile.findOne({ userId });

        // Institutional Feed Linkage
        let institutionalTasks = [];
        let institutionalAnnouncements = [];
        let institutionalResources = [];
        let collegeTeachers = [];
        let doubtSessions = [];
        let teacherUpdates = [];

        if (profile && profile.collegeName) {
            const safeCollegeName = profile.collegeName.trim();
            const collegeRegex = new RegExp(`^${safeCollegeName}$`, 'i');

            institutionalTasks = await TeacherWork.find({
                type: "task",
                collegeName: collegeRegex
            }).limit(10).sort({ createdAt: -1 });

            institutionalAnnouncements = await TeacherWork.find({
                type: "announcement",
                collegeName: collegeRegex
            }).limit(10).sort({ createdAt: -1 });

            institutionalResources = await TeacherWork.find({
                type: "resource",
                collegeName: collegeRegex
            }).limit(10).sort({ createdAt: -1 });

            teacherUpdates = await TeacherWork.find({
                collegeName: collegeRegex,
                type: { $in: ["task", "announcement"] }
            }).sort({ createdAt: -1 }).limit(10);

            const quizzes = await TeacherWork.find({
                type: "quiz",
                collegeName: collegeRegex
            }).limit(10).sort({ createdAt: -1 });

            const meetings = await TeacherWork.find({
                type: "meeting",
                collegeName: collegeRegex
            }).limit(5).sort({ createdAt: -1 });

            doubtSessions = await TeacherWork.find({
                collegeName: collegeRegex,
                type: "doubt_session"
            }).sort({ date: 1 });

            collegeTeachers = await TeacherProfile.find({
                collegeName: collegeRegex
            }).select('userId fullName email profileImage');

            res.locals.institutionalQuizzes = quizzes;
            res.locals.institutionalMeetings = meetings;
        }

        // Fetch My Doubts
        const myDoubts = await Doubt.find({ studentId: userId }).sort({ createdAt: -1 });

        // Calculate Stats
        const totalAttempts = results.length;
        const bestScore = totalAttempts > 0 ? Math.max(...results.map(r => r.score)) : 0;
        const avgScore = totalAttempts > 0 ? (results.reduce((a, b) => a + b.score, 0) / totalAttempts).toFixed(1) : 0;

        // Admission Requests
        const admissionRequests = await AdmissionRequest.find({ studentId: userId })
            .populate('collegeId', 'name location userId')
            .sort({ createdAt: -1 });

        // Calculate Profile Completion
        let profileCompletion = 0;
        if (profile) {
            const fields = ['fullName', 'email', 'phone', 'state', 'district', 'collegeName', 'course', 'year', 'skills', 'careerGoal'];
            const filledFields = fields.filter(f => profile[f] && profile[f] !== 'N/A' && profile[f] !== '');
            profileCompletion = Math.round((filledFields.length / fields.length) * 100);
        }

        res.render('user_dashboard', {
            user: user,
            username: user.username,
            results,
            profile,
            totalAttempts,
            bestScore,
            avgScore,
            teacherUpdates,
            resources: institutionalResources, // Using institutionalResources for consistency
            doubtSessions,
            myDoubts,
            admissionRequests,
            stats: { totalAttempts, bestScore, avgScore, profileCompletion },
            feed: {
                tasks: institutionalTasks,
                announcements: institutionalAnnouncements,
                resources: institutionalResources || [],
                quizzes: res.locals.institutionalQuizzes || [],
                meetings: res.locals.institutionalMeetings || [],
                teachers: collegeTeachers,
                doubts: myDoubts
            },
            socialFeed: currentSocialFeeds
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send("Something went wrong");
    }
});

// POST: Student asks a doubt
router.post('/ask-doubt', async (req, res) => {
    try {
        const userId = req.session.userId || (req.user && req.user._id);
        if (!userId) return res.redirect('/login');

        const { teacherId, title, description } = req.body;
        if (!teacherId || !title || !description) {
            return res.status(400).send("All fields are required");
        }

        const profile = await Profile.findOne({ userId });
        if (!profile || !profile.collegeName || profile.collegeName === 'N/A') {
            return res.status(400).send("Please complete your profile and link your college first.");
        }

        const teacherProfile = await TeacherProfile.findOne({ userId: teacherId });
        if (!teacherProfile || teacherProfile.collegeName !== profile.collegeName) {
            return res.status(400).send("Invalid teacher selection.");
        }

        await Doubt.create({
            studentId: userId,
            teacherId: teacherId,
            title,
            description,
            collegeName: profile.collegeName,
            status: 'pending'
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error("Ask Doubt Error:", error);
        res.status(500).send("Internal Server Error");
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

// POST: Submit AI Suggestion Feedback
router.post('/submitAIFeedback', async (req, res) => {
    try {
        const { subject, message, rating } = req.body;
        const userId = req.session.userId || (req.user && req.user._id);

        const User = require('../model/User');
        const Feedback = require('../model/Feedback');

        const user = await User.findById(userId);

        await Feedback.create({
            userId,
            username: user.username,
            role: user.role || 'student',
            subject: subject || "AI Suggestion Rating",
            message: message || "Rated through carousel",
            rating: parseInt(rating) || 5
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error("AI Feedback submission error:", err);
        res.status(500).send("Error submitting feedback");
    }
});

module.exports = router;
