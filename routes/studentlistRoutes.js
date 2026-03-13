const express = require("express");
const router = express.Router();
const User = require("../model/User");
const TeacherProfile = require("../model/TeacherProfile");
const StudentProfile = require("../model/profile");

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

// GET: Display Student List Page at /studentlist
router.get("/studentlist", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect("/login");
        }

        // Fetch the logged-in teacher's details from User.js
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

<<<<<<< HEAD
        // Fetch the teacher's profile safely
=======
>>>>>>> origin/Teachers-students-connect
        const teacherProfile = await TeacherProfile.findOne({ userId });

        if (!teacherProfile) {
            console.log("Teacher profile missing for student list:", userId);
            return res.render("student_list", {
                students: [],
                username: user.username,
                collegeName: "Not Set"
            });
        }

        // Fetch ALL students from the same college for institutional connection
        const students = await StudentProfile.find({ collegeName: teacherProfile.collegeName });

        console.log(`Found ${students.length} students for college: ${teacherProfile.collegeName}`);

        // Fetch student details
        const studentList = students.map((student, index) => ({
            srNo: index + 1,
            fullName: student.fullName, // Fix: Use fullName instead of username
            email: student.email,
            phone: student.phone,
            year: student.year,
            profileImage: student.profileImage || "/images/default-profile.png"
        }));

        res.render("student_list", {
            students: studentList,
            username: user.username,
            collegeName: teacherProfile.collegeName
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

module.exports = router;
