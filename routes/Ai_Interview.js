const express = require('express');
const router = express.Router();
const { generateQuestions, analyzeResponse } = require('../utils/ollamaHelper');

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

// A simple sentiment and soft skills analyzer (Rule-based hook for Task 6)
function analyzeSoftSkills(transcript) {
    if(!transcript) return { confidenceScore: 0, clarityScore: 0, hesitationCount: 0, overallSentiment: 'Unknown' };
    const text = transcript.toLowerCase();
    
    // Confident words
    const confidentWords = ['confident', 'believe', 'successfully', 'achieved', 'led', 'managed', 'resolved', 'improved', 'increased', 'developed', 'exactly', 'absolutely', 'definitely'];
    // Hesitation words
    const hesitationWords = ['uh', 'um', 'like', 'guess', 'maybe', 'not sure', 'kind of', 'sort of', 'perhaps'];
    // Structure words
    const structureWords = ['first', 'second', 'therefore', 'however', 'moreover', 'conclusion', 'example', 'specifically', 'because', 'result'];

    let confidentCount = 0;
    let hesitationCount = 0;
    let structureCount = 0;

    confidentWords.forEach(word => { if (text.includes(word)) confidentCount++; });
    hesitationWords.forEach(word => { if (text.includes(word)) hesitationCount++; });
    structureWords.forEach(word => { if (text.includes(word)) structureCount++; });
    
    // Score soft skills out of 100
    let confidenceScore = Math.min(100, 50 + (confidentCount * 10) - (hesitationCount * 5));
    let clarityScore = Math.min(100, 50 + (structureCount * 8) - (hesitationCount * 2));
    
    // Bound scores
    confidenceScore = Math.max(0, confidenceScore);
    clarityScore = Math.max(0, clarityScore);
    
    let overallSentiment = 'Neutral';
    if (confidenceScore > 75) overallSentiment = 'Highly Confident';
    else if (confidenceScore > 55) overallSentiment = 'Confident';
    else if (confidenceScore < 40) overallSentiment = 'Hesitant';

    return { confidenceScore, clarityScore, hesitationCount, overallSentiment };
}

// 2. Analyze Response
router.post('/interview/analyze', async (req, res) => {
    try {
        const { role, seniority, transcript } = req.body;
        const analysis = await analyzeResponse(role, seniority, transcript);
        
        // Task 6: Basic Sentiment Analysis Hook
        const softSkills = analyzeSoftSkills(transcript);
        
        // Append to profile iteratively if logged in
        if (req.session && req.session.userId) {
            const Profile = require('../model/profile');
            await Profile.updateOne(
                { userId: req.session.userId },
                { $push: { 
                    'interviewStats': {
                        role: role || 'Unknown Role', 
                        date: new Date(),
                        confidenceScore: softSkills.confidenceScore,
                        clarityScore: softSkills.clarityScore,
                        overallSentiment: softSkills.overallSentiment
                    }
                }}
            );
        }

        res.json({ success: true, analysis, softSkills });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: "Analysis failed" });
    }
});

module.exports = router;