const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../model/User");
const TeacherProfile = require('../model/TeacherProfile');

// Middleware to check authentication (Modify as per your auth system)
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
// Multer storage setup for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


// GET: Display Teacher Profile Page at /tprofile
// Route to render the profile page
router.get("/tprofile", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect("/login");
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        let profile = await TeacherProfile.findOne({ userId });

        res.render("teacher_profile", {
            profile,
            username: user.username,
            role: user.role,
            collegeName: profile ? profile.collegeName : "Not Set",
            profileImage: profile?.profileImage || "/images/default-profile.png"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading profile page");
    }
});
// POST: Save or Update Teacher Profile at /tprofile

router.post("/tprofile", upload.single("profileImage"), async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const { fullName, email, phone, state, district, collegeName } = req.body;

        const profileData = {
            userId,
            fullName: fullName?.trim() || "N/A",
            email: email?.trim() || "N/A",
            phone: phone?.trim() || "N/A",
            state: state?.trim() || "N/A",
            district: district?.trim() || "N/A",
            collegeName: collegeName?.trim() || "N/A",
            profileImage: req.file ? `/uploads/${req.file.filename}` : req.body.existingProfileImage
        };

        console.log("Saving teacher profile for:", userId, profileData);
        await TeacherProfile.findOneAndUpdate(
            { userId },
            { $set: profileData },
            { upsert: true, new: true, runValidators: true }
        );

        res.redirect("/tprofile");
    } catch (error) {
        console.error("CRITICAL Teacher Profile Save Error:", error);
        res.status(500).send("Error saving teacher profile: " + error.message);
    }
});


module.exports = router;
