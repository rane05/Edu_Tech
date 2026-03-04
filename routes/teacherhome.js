const express = require("express");
const router = express.Router();
const User = require("../model/User");
const StudentProfile = require("../model/profile");
const TeacherProfile = require("../model/TeacherProfile");
const TeacherWork = require("../model/teacherwork");
const Doubt = require("../model/Doubt");
const QuizResult = require("../model/QuizResult");

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

// GET: Teacher Home Page
router.get("/teacher_home", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send("Unauthorized: No user ID in session");
        }

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Fetch teacher profile based on user ID
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!teacherProfile) {
            console.log("Teacher profile missing for user:", userId);
            return res.render("teacher_home", {
                username: user.username,
                collegeName: "Not Set",
                students: [],
                tasks: [],
                announcements: [],
                resources: [],
                doubts: []
            });
        }

        // Fetch students and teacher work data scoped to this college
        const rawStudents = await StudentProfile.find({ collegeName: teacherProfile.collegeName });

        // Calculate dynamic progress for each student
        const students = await Promise.all(rawStudents.map(async (s) => {
            const quizCount = await QuizResult.countDocuments({ userId: s.userId });
            // Each quiz contributes 25% to progress, capped at 100%. 
            // If 0 quizzes, default to a small realistic starting progress.
            s.progress = quizCount > 0 ? Math.min(quizCount * 25, 100) : 10;
            return s;
        }));
        const tasks = await TeacherWork.find({
            type: "task",
            collegeName: teacherProfile.collegeName
        });
        const announcements = await TeacherWork.find({
            type: "announcement",
            collegeName: teacherProfile.collegeName
        }).sort({ createdAt: -1 });

        const resources = await TeacherWork.find({
            type: "resource",
            collegeName: teacherProfile.collegeName
        }).sort({ createdAt: -1 });

        // Fetch doubts asked to this teacher
        const doubts = await Doubt.find({ teacherId: userId }).populate('studentId', 'username').sort({ createdAt: -1 });

        // LEADERBOARD LOGIC: Get top performance scores for students in this college
        // We'll calculate the top 5 scores from QuizResult for students associated with this collegeName
        const collegeStudentIds = students.map(s => s.userId);
        const topPerformers = await QuizResult.find({ userId: { $in: collegeStudentIds } })
            .select('userId score date')
            .populate('userId', 'username email')
            .sort({ score: -1 })
            .limit(5);

        // Fetch active live session links if any
        const liveSessions = await TeacherWork.find({
            type: "meeting",
            collegeName: teacherProfile.collegeName
        }).sort({ createdAt: -1 }).limit(1);

        // AGGREGATE ANALYTICS: Calculate class-wide averages for aptitude sections
        const results = await QuizResult.find({ userId: { $in: collegeStudentIds } });
        let sectionTotals = { quantitative: 0, verbal: 0, logical: 0 };
        let totalScore = 0;
        let resultCount = results.length;

        results.forEach(res => {
            sectionTotals.quantitative += res.sectionScores.quantitative || 0;
            sectionTotals.verbal += res.sectionScores.verbal || 0;
            sectionTotals.logical += res.sectionScores.logical || 0;
            totalScore += res.score;
        });

        const classAverages = resultCount > 0 ? {
            quantitative: Math.round(sectionTotals.quantitative / resultCount),
            verbal: Math.round(sectionTotals.verbal / resultCount),
            logical: Math.round(sectionTotals.logical / resultCount),
            total: Math.round(totalScore / resultCount)
        } : { quantitative: 0, verbal: 0, logical: 0, total: 0 };

        // SYLLABUS HEALTH: Mock calculation based on content depth
        const contentDensity = await TeacherWork.countDocuments({
            collegeName: teacherProfile.collegeName,
            type: { $in: ["task", "resource", "quiz"] }
        });
        const syllabusHealth = Math.min(Math.round((contentDensity / 12) * 100), 100) || 5;

        res.render("teacher_home", {
            username: user.username,
            collegeName: teacherProfile.collegeName,
            students,
            tasks,
            announcements,
            resources,
            doubts,
            topPerformers,
            liveSessions,
            classAverages,
            syllabusHealth
        });

    } catch (error) {
        console.error("Error loading teacher home page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST: Add Task
// POST: Add Task
router.post("/addTask", async (req, res) => {
    try {
        const { title, dueDate } = req.body;

        if (!title || !dueDate) {
            return res.status(400).send("Title and Due Date are required");
        }

        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!teacherProfile) {
            return res.status(403).send("Teacher profile required to add tasks");
        }

        await TeacherWork.create({
            type: "task",
            title,
            dueDate,
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home"); // Redirect to update frontend
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST: Add Announcement
router.post("/addAnnouncement", async (req, res) => {
    try {
        const { title, date } = req.body;

        if (!title || !date) {
            return res.status(400).send("Title and Date are required");
        }

        const userId = req.session.userId;
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!teacherProfile) {
            return res.status(403).send("Teacher profile required to add announcements");
        }

        await TeacherWork.create({
            type: "announcement",
            title,
            date,
            teacherId: userId,
            collegeName: teacherProfile.collegeName
        });

        res.redirect("/teacher_home"); // Redirect to update frontend
    } catch (error) {
        console.error("Error adding announcement:", error);
        res.status(500).send("Internal Server Error");
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
