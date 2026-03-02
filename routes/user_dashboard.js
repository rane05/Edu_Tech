const express = require('express');
const router = express.Router();
const QuizResult = require('../model/QuizResult');
const User = require('../model/User');
const Profile = require('../model/profile');
const TeacherWork = require('../model/teacherwork');
const TeacherProfile = require('../model/TeacherProfile');
const Doubt = require('../model/Doubt');

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

        if (profile && profile.collegeName) {
            institutionalTasks = await TeacherWork.find({
                type: "task",
                collegeName: profile.collegeName
            }).limit(10).sort({ createdAt: -1 });

            institutionalAnnouncements = await TeacherWork.find({
                type: "announcement",
                collegeName: profile.collegeName
            }).limit(10).sort({ createdAt: -1 });

            institutionalResources = await TeacherWork.find({
                type: "resource",
                collegeName: profile.collegeName
            }).limit(10).sort({ createdAt: -1 });

            const quizzes = await TeacherWork.find({
                type: "quiz",
                collegeName: profile.collegeName
            }).limit(10).sort({ createdAt: -1 });

            const meetings = await TeacherWork.find({
                type: "meeting",
                collegeName: profile.collegeName
            }).limit(5).sort({ createdAt: -1 });

            collegeTeachers = await TeacherProfile.find({
                collegeName: profile.collegeName
            }).select('userId fullName email profileImage');

            // Store in locals or pass in feed
            res.locals.institutionalQuizzes = quizzes;
            res.locals.institutionalMeetings = meetings;
        }

        // Fetch My Doubts
        const myDoubts = await Doubt.find({ studentId: userId }).populate('teacherId', 'username').sort({ createdAt: -1 });

        // Calculate Stats
        const totalAttempts = results.length;
        const bestScore = totalAttempts > 0 ? Math.max(...results.map(r => r.score)) : 0;
        const avgScore = totalAttempts > 0 ? (results.reduce((a, b) => a + b.score, 0) / totalAttempts).toFixed(1) : 0;

        // Calculate Profile Completion
        let profileCompletion = 0;
        if (profile) {
            const fields = ['fullName', 'email', 'phone', 'state', 'district', 'collegeName', 'course', 'year', 'skills', 'careerGoal'];
            const filledFields = fields.filter(f => profile[f] && profile[f] !== 'N/A' && profile[f] !== '');
            profileCompletion = Math.round((filledFields.length / fields.length) * 100);
        }

        res.render('user_dashboard', {
            user: user,
            results,
            profile,
            stats: { totalAttempts, bestScore, avgScore, profileCompletion },
            feed: {
                tasks: institutionalTasks,
                announcements: institutionalAnnouncements,
                resources: institutionalResources || [],
                quizzes: res.locals.institutionalQuizzes || [],
                meetings: res.locals.institutionalMeetings || [],
                teachers: collegeTeachers,
                doubts: myDoubts
            }
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

module.exports = router;
