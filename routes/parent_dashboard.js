const express = require('express');
const router = express.Router();
const ParentProfile = require('../model/ParentProfile');
const User = require('../model/User');
const Profile = require('../model/profile');
const QuizResult = require('../model/QuizResult');
const TeacherWork = require('../model/teacherwork');

router.get('/parent_home', async (req, res) => {
    const parentId = req.session.userId || (req.user && req.user._id);
    if (!parentId) return res.redirect('/login');

    try {
        const parentUser = await User.findById(parentId);
        if (!parentUser || parentUser.role !== 'parent') {
            return res.redirect('/login');
        }

        // Find parent profile to get linked student
        const parentProfile = await ParentProfile.findOne({ username: parentUser.username });

        let studentData = null;
        let results = [];
        let teacherUpdates = [];
        let studentProfileDoc = null;

        if (parentProfile && parentProfile.linkedStudent) {
            studentProfileDoc = await Profile.findById(parentProfile.linkedStudent);
            if (studentProfileDoc) {
                studentData = studentProfileDoc;
                results = await QuizResult.find({ userId: studentProfileDoc.userId }).sort({ date: 1 });

                // Fetch teacher updates for the student's college
                teacherUpdates = await TeacherWork.find({
                    collegeName: studentProfileDoc.collegeName,
                    type: { $in: ["task", "announcement"] }
                }).sort({ createdAt: -1 }).limit(10);
            }
        }

        // Stats for the student
        const totalAttempts = results.length;
        const bestScore = totalAttempts > 0 ? Math.max(...results.map(r => r.score)) : 0;
        const avgScore = totalAttempts > 0 ? (results.reduce((a, b) => a + b.score, 0) / totalAttempts).toFixed(1) : 0;

        res.render('parent_home', {
            username: parentUser.username,
            parentProfile,
            studentData,
            results,
            teacherUpdates,
            bestScore,
            avgScore,
            totalAttempts
        });

    } catch (err) {
        console.error("Parent Dashboard Error:", err);
        res.status(500).send("Error loading parent dashboard");
    }
});

module.exports = router;
