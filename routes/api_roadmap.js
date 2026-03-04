const express = require('express');
const router = express.Router();
const User = require('../model/User');

// POST /api/roadmap/progress
// Toggle a completed step for the logged-in user
router.post('/progress', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not logged in' });
        }

        const { stepId } = req.body;
        if (!stepId) {
            return res.status(400).json({ error: 'Missing stepId' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize array if it somehow doesn't exist
        if (!user.roadmapProgress) {
            user.roadmapProgress = [];
        }

        const stepIndex = user.roadmapProgress.indexOf(stepId);
        let completed = false;

        if (stepIndex > -1) {
            // Uncheck: remove it
            user.roadmapProgress.splice(stepIndex, 1);
        } else {
            // Check: add it
            user.roadmapProgress.push(stepId);
            completed = true;
        }

        await user.save();
        res.json({ success: true, completed, progress: user.roadmapProgress });

    } catch (err) {
        console.error('Error toggling roadmap progress:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const RoadmapEngine = require('../services/roadmapEngine');
const UserRoadmap = require('../model/UserRoadmap');
const Career = require('../model/career');

// POST /api/roadmap/generate
// Generates a personalized roadmap using the local Algorithmic Engine
router.post('/generate', async (req, res) => {
    try {
        const { targetCareer, education, skills, weekly_hours, risk_level, location } = req.body;
        if (!targetCareer) {
            return res.status(400).json({ error: 'Target career is required' });
        }

        // 1. Fetch Career Template from DB (Populating structured Skill arrays)
        const career = await Career.findOne({ title: targetCareer }).populate('required_skills optional_skills advanced_skills');
        if (!career) {
            return res.status(404).json({ error: 'Career data not found in database. Please seed the career first.' });
        }

        // 2. Build the User Profile Input
        // Fallback to db properties if req.user exists, but override with any new form data
        let userProfile = req.user ? userProfile = {
            skills: req.user.skills || [],
            interests: req.user.interests || [],
            education: req.user.education,
            weekly_hours: req.user.weekly_hours,
            risk_level: req.user.risk_level,
            location: req.user.location
        } : {};

        if (education) userProfile.education = education;
        if (weekly_hours) userProfile.weekly_hours = Number(weekly_hours);
        if (risk_level) userProfile.risk_level = risk_level;
        if (location) userProfile.location = location;

        if (skills) {
            // Might be a comma-separated string or an array depending on frontend
            if (Array.isArray(skills)) {
                userProfile.skills = skills;
            } else if (typeof skills === 'string') {
                userProfile.skills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
            }
        }

        // 3. Call the Local Algorithmic Engine with dynamic parameters
        const roadmapData = await RoadmapEngine.generate(userProfile, career);

        // 3. Save to Database
        const newRoadmap = new UserRoadmap({
            careerTitle: targetCareer,
            generated_phases: roadmapData.phases,
            skill_gap: roadmapData.skillGap,
            backup_careers: roadmapData.backupCareers,
            overview: roadmapData.overview,
            overall_suitability_score: roadmapData.overview.suitabilityScore,
            estimated_total_weeks: roadmapData.totalEstimatedWeeks,
            progress: {
                completed_phases: [],
                completed_topics: [],
                overall_percentage: 0
            }
        });

        if (req.user) {
            newRoadmap.userId = req.user._id;
        }

        await newRoadmap.save();

        res.json({ success: true, roadmapId: newRoadmap._id, data: roadmapData });
    } catch (err) {
        console.error('Error generating Algorithmic Roadmap:', err);
        res.status(500).json({ error: 'Failed to generate roadmap' });
    }
});

module.exports = router;
