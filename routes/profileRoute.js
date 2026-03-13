const express = require("express");
const multer = require("multer");
const path = require("path");
const Profile = require("../model/profile");
const User = require("../model/User");
const router = express.Router();

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

// Route to render the profile page
router.get("/profile", async (req, res) => {
    try {
<<<<<<< HEAD
        const userId = req.session.userId || (req.user && req.user._id);
=======
        const userId = req.session.userId;
>>>>>>> origin/Teachers-students-connect
        if (!userId) {
            return res.redirect("/login");
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        let profile = await Profile.findOne({ userId });

        res.render("student_profile", {
            profile,
            username: user.username,
            role: user.role,  // Fetching the role from the User model
            profileImage: profile?.profileImage || "/images/default-profile.png"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading profile page");
    }
});

// Handle Profile Save (POST)
router.post("/profile", upload.single("profileImage"), async (req, res) => {
    try {
<<<<<<< HEAD
        const userId = req.session.userId || (req.user && req.user._id);
=======
        const userId = req.session.userId;
>>>>>>> origin/Teachers-students-connect
        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const {
            fullName,
            email,
            phone,
            state,
            district,
            collegeName,
            course,
            year,
            linkedin,
            twitter,
            // schoolName,
            // schoolBoard,
            // passingYear,
            skills,
            careerGoal
        } = req.body;
<<<<<<< HEAD

        // Auto-link to teachers from the same college
        const TeacherProfile = require("../model/TeacherProfile");
        const teachersInCollege = await TeacherProfile.find({
            collegeName: { $regex: new RegExp("^" + collegeName?.trim() + "$", "i") }
        });
        const teacherUserIds = teachersInCollege.map(t => t.userId);

        // Check if profile exists, update or create new
        let profile = await Profile.findOne({ userId });

        let finalLinkedTeachers = teacherUserIds;
        if (profile && profile.linkedTeachers) {
            // Merge institutional teachers with manually linked ones, avoiding duplicates
            const existingLinks = profile.linkedTeachers.map(id => id.toString());
            const newLinks = teacherUserIds.map(id => id.toString());
            finalLinkedTeachers = [...new Set([...existingLinks, ...newLinks])];
        }

        const profileData = {
            userId,
            fullName: fullName?.trim() || "",
            email: email?.trim() || "",
            phone: phone?.trim() || "",
            state: state?.trim() || "",
            district: district?.trim() || "",
            collegeName: collegeName?.trim() || "",
            course: course?.trim() || "",
            year: year?.trim() || "N/A",
            linkedin: linkedin?.trim() || "N/A",
            twitter: twitter?.trim() || "N/A",
            skills: skills?.trim() || "",
            careerGoal: careerGoal?.trim() || "",
            profileImage: req.file ? `/uploads/${req.file.filename}` : req.body.existingProfileImage,
            linkedTeachers: finalLinkedTeachers
        };

        if (profile) {
            await Profile.updateOne({ userId }, profileData);
        } else {
            await new Profile(profileData).save();
        }

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving profile");
    }
});

router.post("/profile/generate-code", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        if (profile.uniqueCode) {
            return res.json({ success: false, message: "Code already generated", uniqueCode: profile.uniqueCode });
        }

        const uniqueCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        profile.uniqueCode = uniqueCode;
        await profile.save();

        res.json({ success: true, uniqueCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error generating code" });
    }
});

router.post("/profile/link-parent", async (req, res) => {
    try {
        const { uniqueCode } = req.body;
        const userId = req.session.userId; // Parent's user ID

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parentUser = await User.findById(userId);
        if (!parentUser) {
            return res.status(404).json({ success: false, message: "Parent user not found" });
        }

        let studentProfile = await Profile.findOne({ uniqueCode });
        if (!studentProfile) {
            return res.status(404).json({ success: false, message: "Invalid code" });
        }

        studentProfile.parentUsername = parentUser.username; // Store parent's username
        await studentProfile.save();

        res.json({ success: true, message: "Linked successfully", parentUsername: parentUser.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error linking parent" });
    }
});

router.post("/profile/link-teacher", async (req, res) => {
    try {
        const { teacherCode } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const TeacherProfile = require('../model/TeacherProfile');
        const teacherProfile = await TeacherProfile.findOne({ uniqueCode: teacherCode });

        if (!teacherProfile) {
            return res.status(404).json({ success: false, message: "Teacher not found with this code" });
        }

        let studentProfile = await Profile.findOne({ userId });
        if (!studentProfile) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        if (!studentProfile.linkedTeachers.includes(teacherProfile.userId)) {
            studentProfile.linkedTeachers.push(teacherProfile.userId);
            await studentProfile.save();
        }

        res.json({ success: true, message: "Connected to teacher successfully", teacherName: teacherProfile.fullName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error linking teacher" });
=======

        // Ensure required fields are not undefined
        const profileData = {
            userId,
            fullName: fullName?.trim() || "N/A",
            email: email?.trim() || "N/A",
            phone: phone?.trim() || "N/A",
            state: state?.trim() || "N/A",
            district: district?.trim() || "N/A",
            collegeName: collegeName?.trim() || "N/A",
            course: course?.trim() || "N/A",
            year: year?.trim() || "N/A",
            linkedin: linkedin?.trim() || "N/A",
            twitter: twitter?.trim() || "N/A",
            // Default value if missing
            skills: skills?.trim() || "",
            careerGoal: careerGoal?.trim() || "",
            profileImage: req.file ? `/uploads/${req.file.filename}` : req.body.existingProfileImage
        };

        console.log("Saving student profile for:", userId, profileData);
        const savedProfile = await Profile.findOneAndUpdate(
            { userId },
            { $set: profileData },
            { upsert: true, new: true, runValidators: true }
        );

        console.log("Student profile saved successfully:", savedProfile._id);
        res.redirect("/profile");
    } catch (error) {
        console.error("CRITICAL Student Profile Save Error:", error);
        res.status(500).send("Error saving profile: " + error.message);
    }
});

router.post("/profile/generate-code", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        if (profile.uniqueCode) {
            return res.json({ success: false, message: "Code already generated", uniqueCode: profile.uniqueCode });
        }

        const uniqueCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        profile.uniqueCode = uniqueCode;
        await profile.save();

        res.json({ success: true, uniqueCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error generating code" });
    }
});

router.post("/profile/link-parent", async (req, res) => {
    try {
        const { uniqueCode } = req.body;
        const userId = req.session.userId; // Parent's user ID

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parentUser = await User.findById(userId);
        if (!parentUser) {
            return res.status(404).json({ success: false, message: "Parent user not found" });
        }

        let studentProfile = await Profile.findOne({ uniqueCode });
        if (!studentProfile) {
            return res.status(404).json({ success: false, message: "Invalid code" });
        }

        studentProfile.parentUsername = parentUser.username; // Store parent's username
        await studentProfile.save();

        res.json({ success: true, message: "Linked successfully", parentUsername: parentUser.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error linking parent" });
>>>>>>> origin/Teachers-students-connect
    }
});

module.exports = router;