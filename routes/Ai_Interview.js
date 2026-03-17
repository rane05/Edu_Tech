const express = require('express');
const router = express.Router();
const { generateQuestions, analyzeResponse, deepAnalyzeResponse } = require('../utils/ollamaHelper');

// Constants
const MAX_QUESTIONS = 5;

// AI Interview Simulator - Main page
router.get('/interview-simulator', (req, res) => {
    res.render('interview_simulator_enhanced', { user: req.session || {} });
});

// 1. Generate Questions
router.post('/interview/questions', async (req, res) => {
    try {
        const { role, seniority } = req.body;
        const questions = await generateQuestions(role, seniority);
        res.json({ success: true, questions });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: "Generations failed" });
    }
});

// 2. Analyze Response
router.post('/interview/analyze', async (req, res) => {
    try {
        const { role, seniority, transcript } = req.body;
        
        // Task 6 & 12: Advanced AI-powered Sentiment & Skills Analysis using Groq
        const analysis = await deepAnalyzeResponse(role, seniority, transcript);
        
        // Append to profile iteratively if logged in
        if (req.session && req.session.userId) {
            const Profile = require('../model/profile');
            await Profile.updateOne(
                { userId: req.session.userId },
                { $push: { 
                    'interviewStats': {
                        role: role || 'Unknown Role', 
                        date: new Date(),
                        confidenceScore: analysis.confidenceScore,
                        clarityScore: analysis.communicationScore,
                        overallSentiment: analysis.overallSentiment,
                        technicalScore: analysis.technicalScore
                    }
                }}
            );
        }

        res.json({ success: true, analysis });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: "Analysis failed" });
    }
});

module.exports = router;