const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/User");
const StudentProfile = require("../model/profile");
const TeacherProfile = require("../model/TeacherProfile");
const TeacherWork = require("../model/teacherwork");
const Doubt = require("../model/Doubt");
const QuizResult = require("../model/QuizResult");
const UserRoadmap = require("../model/UserRoadmap");

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() || req.session.userId) {
        return next();
    }
    res.redirect("/login");
};

// GET: Teacher Home Page
router.get("/teacher_home", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId || (req.user && req.user._id);

        // Extra safety check for role
        const user = await User.findById(userId);
        if (!user || user.role !== 'teacher') {
            req.flash('error', 'Access denied. Teachers only.');
            return res.redirect('/login');
        }

        // Fetch teacher profile based on user ID
        const teacherProfile = await TeacherProfile.findOne({ userId });
        console.log("Teacher Profile Loading for ID:", userId, "Found:", teacherProfile ? teacherProfile.collegeName : "NONE");

        if (!teacherProfile) {
            console.log("Teacher profile missing for user:", userId);
            return res.render("teacher_home", {
                username: user.username,
                collegeName: "Complete Your Profile",
                teacherCode: "PENDING",
                students: [],
                tasks: [],
                announcements: [],
                resources: [],
                doubts: [],
                doubtSessions: [],
                topPerformers: [],
                liveSessions: [],
                classAverages: { quantitative: 0, verbal: 0, logical: 0, total: 0 },
                syllabusHealth: 0,
                analytics: {
                    avgProgress: 0,
                    studentCount: 0,
                    topPerformer: null
                }
            });
        }

        const safeCollegeName = teacherProfile.collegeName ? teacherProfile.collegeName.trim() : "";
        const collegeRegex = new RegExp(`^${safeCollegeName}$`, 'i');

        // Fetch ALL students in the same college for institutional analysis
        const rawStudents = await StudentProfile.find({ collegeName: collegeRegex }).lean();

        // Enrich students with their actual roadmap progress
        const students = await Promise.all(rawStudents.map(async (student) => {
            const roadmap = await UserRoadmap.findOne({ userId: student.userId }).lean();
            return {
                ...student,
                progress: roadmap && roadmap.progress ? Math.round(roadmap.progress.overall_percentage) : 0
            };
        }));

        // Sort students by progress (descending)
        students.sort((a, b) => b.progress - a.progress);

        // Basic Analytics
        const avgProgress = students.length > 0
            ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
            : 0;

        // Top performer
        const topPerformer = students.length > 0
            ? students.reduce((max, s) => (s.progress > max.progress ? s : max), students[0])
            : null;

        // Fetch work (tasks, announcements, resources)
        const tasks = await TeacherWork.find({ collegeName: collegeRegex, type: "task" });
        const announcements = await TeacherWork.find({ collegeName: collegeRegex, type: "announcement" }).sort({ createdAt: -1 });
        const resources = await TeacherWork.find({ collegeName: collegeRegex, type: "resource" }).sort({ createdAt: -1 });
        const doubtSessions = await TeacherWork.find({ collegeName: collegeRegex, type: "doubt_session" });

        // Fetch pending doubts
        const doubts = await Doubt.find({ collegeName: collegeRegex, status: "pending" }).populate('studentId', 'username').sort({ createdAt: -1 });

        // LEADERBOARD LOGIC: Get top performance scores
        const collegeStudentIds = rawStudents.map(s => s.userId);
        const topPerformers = await QuizResult.find({ userId: { $in: collegeStudentIds } })
            .select('userId score date')
            .populate('userId', 'username email')
            .sort({ score: -1 })
            .limit(5);

        // Fetch active live session links
        const liveSessions = await TeacherWork.find({
            type: "meeting",
            collegeName: collegeRegex
        }).sort({ createdAt: -1 }).limit(1);

        // AGGREGATE ANALYTICS: Calculate class-wide averages for aptitude sections
        const results = await QuizResult.find({ userId: { $in: collegeStudentIds } });
        let sectionTotals = { quantitative: 0, verbal: 0, logical: 0 };
        let totalScoreValue = 0;
        let resultCount = results.length;

        results.forEach(resItem => {
            sectionTotals.quantitative += resItem.sectionScores ? resItem.sectionScores.quantitative || 0 : 0;
            sectionTotals.verbal += resItem.sectionScores ? resItem.sectionScores.verbal || 0 : 0;
            sectionTotals.logical += resItem.sectionScores ? resItem.sectionScores.logical || 0 : 0;
            totalScoreValue += resItem.score || 0;
        });

        const classAverages = resultCount > 0 ? {
            quantitative: Math.round(sectionTotals.quantitative / resultCount),
            verbal: Math.round(sectionTotals.verbal / resultCount),
            logical: Math.round(sectionTotals.logical / resultCount),
            total: Math.round(totalScoreValue / resultCount)
        } : { quantitative: 0, verbal: 0, logical: 0, total: 0 };

        // SYLLABUS HEALTH: Mock calculation based on content depth
        const contentDensity = await TeacherWork.countDocuments({
            collegeName: collegeRegex,
            type: { $in: ["task", "resource", "quiz"] }
        });
        const syllabusHealth = Math.min(Math.round((contentDensity / 12) * 100), 100) || 5;

        res.render("teacher_home", {
            username: user.username,
            teacherCode: teacherProfile.uniqueCode,
            collegeName: safeCollegeName,
            students,
            tasks,
            announcements,
            resources,
            doubts,
            doubtSessions,
            topPerformers,
            liveSessions,
            classAverages,
            syllabusHealth,
            analytics: {
                avgProgress,
                studentCount: students.length,
                topPerformer
            }
        });

    } catch (error) {
        console.error("Error loading teacher home page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/addTask", isAuthenticated, async (req, res) => {
    try {
        const { title, dueDate } = req.body;
        const userId = req.session.userId || (req.user && req.user._id);
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!title || !dueDate || !teacherProfile) return res.redirect("/teacher_home");

        await TeacherWork.create({
            type: "task", title, dueDate, teacherId: userId, collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        res.status(500).send("Error adding task");
    }
});

// POST: Add Announcement
router.post("/addAnnouncement", isAuthenticated, async (req, res) => {
    try {
        const { title, date } = req.body;
        const userId = req.session.userId || (req.user && req.user._id);

        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!title || !date || !teacherProfile) {
            return res.redirect("/teacher_home");
        }

        await TeacherWork.create({
            type: "announcement",
            title,
            date,
            teacherId: userId,
            collegeName: teacherProfile.collegeName // Save college name for direct connection
        });

        res.redirect("/teacher_home");
    } catch (error) {
        res.status(500).send("Error adding announcement");
    }
});

// POST: Add Resource
router.post("/addResource", isAuthenticated, async (req, res) => {
    try {
        const { title, link } = req.body;
        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!title || !link || !teacherProfile) return res.redirect("/teacher_home");

        await TeacherWork.create({
            type: "resource", title, link, teacherId: userId, collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        res.status(500).send("Error adding resource");
    }
});

// POST: Answer Doubt
router.post("/answerDoubt", isAuthenticated, async (req, res) => {
    try {
        const { doubtId, answer } = req.body;
        const userId = req.session.userId;

        await Doubt.findByIdAndUpdate(doubtId, {
            answer,
            answeredBy: userId,
            status: "resolved"
        });

        res.redirect("/teacher_home");
    } catch (error) {
        res.status(500).send("Error answering doubt");
    }
});

// POST: Add Doubt Session
router.post("/addDoubtSession", isAuthenticated, async (req, res) => {
    try {
        const { title, date, sessionTime, sessionDuration, sessionLink } = req.body;
        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!title || !date || !sessionTime || !teacherProfile) return res.redirect("/teacher_home");

        await TeacherWork.create({
            type: "doubt_session",
            title,
            date,
            sessionTime,
            sessionDuration,
            link: sessionLink,
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        console.error("Error adding doubt session:", error);
        res.status(500).send("Error adding doubt session");
    }
});

// POST: Add Resource
router.post("/addResource", async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).send("Title is required");

        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });
        if (!teacherProfile) return res.status(403).send("Profile required");

        await TeacherWork.create({
            type: "resource",
            title,
            description,
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        console.error("Error adding resource:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST: Reply to Doubt
router.post("/replyDoubt", async (req, res) => {
    try {
        const { doubtId, reply } = req.body;
        if (!doubtId || !reply) return res.status(400).send("Fields required");

        const userId = req.session.userId;

        // Update the doubt if it belongs to this teacher
        const updatedDoubt = await Doubt.findOneAndUpdate(
            { _id: doubtId, teacherId: userId },
            {
                teacherReply: reply,
                status: 'answered'
            },
            { new: true }
        );

        if (!updatedDoubt) return res.status(404).send("Doubt not found or not assigned to you");

        res.redirect("/teacher_home");
    } catch (error) {
        console.error("Error replying to doubt:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST: Add Quiz (Simple version for making it interesting as requested)
router.post("/addQuiz", async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).send("Quiz title is required");

        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });
        if (!teacherProfile) return res.status(403).send("Profile required");

        await TeacherWork.create({
            type: "quiz",
            title,
            description: description || "Interactive quiz shared by faculty.",
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        console.error("Error adding quiz:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST: Start Live Session (Share meeting link)
router.post("/startLiveSession", async (req, res) => {
    try {
        const { title, description } = req.body; // description will be the link
        if (!title || !description) return res.status(400).send("Meeting title and link required");

        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });
        if (!teacherProfile) return res.status(403).send("Profile required");

        // Clear previous meetings for this teacher to avoid clutter (Optional)
        await TeacherWork.deleteMany({ type: "meeting", teacherId: userId });

        await TeacherWork.create({
            type: "meeting",
            title,
            description, // This is the URL
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home");
    } catch (error) {
        console.error("Error starting live session:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
