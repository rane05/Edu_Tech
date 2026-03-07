const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/User");
const StudentProfile = require("../model/profile");
const TeacherProfile = require("../model/TeacherProfile");
const TeacherWork = require("../model/teacherwork");
const UserRoadmap = require("../model/UserRoadmap");
const Doubt = require("../model/Doubt");

// Middleware for authentication
// Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

// GET: Teacher Home Page
router.get("/teacher_home", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Extra safety check for role
        const user = await User.findById(userId);
        if (!user || user.role !== 'teacher') {
            req.flash('error', 'Access denied. Teachers only.');
            return res.redirect('/login');
        }
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Fetch teacher profile based on user ID
        const teacherProfile = await TeacherProfile.findOne({
            $or: [{ userId: userId }, { userId: new mongoose.Types.ObjectId(userId) }, { userId: userId.toString() }]
        });
        console.log("Teacher Profile Loading for ID:", userId, "Found:", teacherProfile ? teacherProfile.collegeName : "NONE");

        if (!teacherProfile) {
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
                analytics: {
                    avgProgress: 0,
                    studentCount: 0,
                    topPerformer: null
                }
            });
        }

        const safeCollegeName = teacherProfile.collegeName ? teacherProfile.collegeName.trim() : "";

        // Fetch ALL students in the same college for institutional analysis
        console.log("Querying Students for College:", safeCollegeName);
        const studentsRaw = await StudentProfile.find({ collegeName: safeCollegeName }).lean();
        console.log("Found Students:", studentsRaw.length);

        // Enrich students with their actual roadmap progress
        const students = await Promise.all(studentsRaw.map(async (student) => {
            const roadmap = await UserRoadmap.findOne({ userId: student.userId }).lean();
            return {
                ...student,
                progress: roadmap && roadmap.progress ? Math.round(roadmap.progress.overall_percentage) : 0
            };
        }));

        // Sort students by progress (descending) for easier analysis and display
        students.sort((a, b) => b.progress - a.progress);

        // Analytics
        const avgProgress = students.length > 0
            ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
            : 0;

        // Top performer
        const topPerformer = students.length > 0
            ? students.reduce((max, s) => (s.progress > max.progress ? s : max), students[0])
            : null;

        // Create a case-insensitive regex for the college name
        const collegeRegex = new RegExp(`^${safeCollegeName}$`, 'i');

        // Fetch work (tasks, announcements, resources)
        const tasks = await TeacherWork.find({ collegeName: collegeRegex, type: "task" });
        const announcements = await TeacherWork.find({ collegeName: collegeRegex, type: "announcement" });
        const resources = await TeacherWork.find({ collegeName: collegeRegex, type: "resource" });
        const doubtSessions = await TeacherWork.find({ collegeName: collegeRegex, type: "doubt_session" });

        // Fetch unresolved doubts in THIS college
        const doubts = await Doubt.find({ collegeName: collegeRegex, status: "pending" });

        res.render("teacher_home", {
            username: user.username,
            teacherCode: teacherProfile.uniqueCode,
            collegeName: safeCollegeName, // Pass college name to UI
            students,
            tasks,
            announcements,
            resources,
            doubtSessions,
            doubts,
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

// POST: Add Task
router.post("/addTask", isAuthenticated, async (req, res) => {
    try {
        const { title, dueDate } = req.body;
        const userId = req.session.userId;
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
        const userId = req.session.userId;

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

module.exports = router;
