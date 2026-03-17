const express = require('express');
const router = express.Router();
const User = require('../model/User');
const College = require('../model/cetCollege');
const Feedback = require('../model/Feedback');
const AdmissionRequest = require('../model/AdmissionRequest');
const QuizResult = require('../model/QuizResult');
const Interview = require('../model/Interview');
const StudentResponse = require('../model/student_res');

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

        // Fetch Trend Data (Placement Outcomes & Progress)
        const placementOutcomes = await Interview.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: "$finalEvaluation.recommendation",
                    count: { $sum: 1 }
                }
            }
        ]);

        const quizTrends = await QuizResult.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    avgScore: { $avg: "$score" }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 12 }
        ]);

        res.render('admin/dashboard', {
            stats: { studentCount, teacherCount, parentCount, collegeCount },
            feedbacks,
            recentColleges,
            placementOutcomes,
            quizTrends,
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

// Export Analytics as CSV
router.get('/admin/export/analytics', isAdmin, async (req, res) => {
    try {
        const Profile = require('../model/profile');
        const UserRoadmap = require('../model/UserRoadmap');
        const QuizResult = require('../model/QuizResult');
        const Interview = require('../model/Interview');
        
        const students = await User.find({ role: 'student' });
        const profiles = await Profile.find({});
        const interviews = await Interview.find({ status: 'completed' }).populate('userId');
        const quizResults = await QuizResult.find().populate('userId');
        
        let csvRows = [];
        // Header
        csvRows.push(['Student Name', 'College', 'Target Career', 'Progress %', 'Avg Quiz Score', 'Interview Recommendation', 'Expected Outcome'].join(','));
        
        for (const student of students) {
            const profile = profiles.find(p => p.userId && p.userId.toString() === student._id.toString());
            const roadmap = await UserRoadmap.findOne({ userId: student._id });
            
            // Stats from Profile/Roadmap
            const progress = roadmap && roadmap.progress ? Math.round(roadmap.progress.overall_percentage) : 
                             (student.roadmapProgress ? ((student.roadmapProgress.length / 20) * 100).toFixed(0) : 0);
            const target = roadmap ? roadmap.careerTitle : (profile ? profile.careerGoal || 'N/A' : 'N/A');
            const college = (profile && profile.collegeName) ? (profile.collegeName.includes(',') ? `"${profile.collegeName}"` : profile.collegeName) : 'N/A';
            const name = (profile && profile.fullName) ? (profile.fullName.includes(',') ? `"${profile.fullName}"` : profile.fullName) : (student.username || 'Anonymous');
            
            // Stats from Quizzes/Interviews
            const studentQuizzes = quizResults.filter(q => q.userId && q.userId._id.toString() === student._id.toString());
            const avgScore = studentQuizzes.length > 0 
                ? (studentQuizzes.reduce((acc, q) => acc + q.score, 0) / studentQuizzes.length).toFixed(2) 
                : 'N/A';

            const latestInterview = interviews
                .filter(i => i.userId && i.userId._id.toString() === student._id.toString())
                .sort((a, b) => b.updatedAt - a.updatedAt)[0];

            const recommendation = latestInterview ? latestInterview.finalEvaluation.recommendation : 'None';
            const outcome = progress > 70 ? 'High Probability' : (progress > 30 ? 'On Track' : 'Needs Support');
            
            csvRows.push([
                name,
                college,
                `"${target}"`,
                `${progress}%`,
                avgScore,
                `"${recommendation}"`,
                outcome
            ].join(','));
        }
        
        const csvString = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="student_analytics_report.csv"');
        res.status(200).send(csvString);
    } catch (err) {
        console.error("Export Analytics Error:", err);
        req.flash('error', 'Failed to generate analytics export.');
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;
