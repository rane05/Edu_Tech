const express = require('express');
const router = express.Router();

// AI Career Trend Predictor - Main page
router.get('/career-trends-predictor', (req, res) => {
    res.render('career_trends_predictor');
});

// API endpoint for career trend analysis
const axios = require('axios');

async function analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon) {
    // Construct the AI Prompt
    const prompt = `
    Role: Expert Labor Market Analyst.
    Task: specific career trend prediction.
    Input Data:
    - Interests: ${interests}
    - Skills: ${skills}
    - Location: ${location}
    - Education: ${educationLevel}
    - Time Horizon: ${timeHorizon}

    Output Requirement: Provide a JSON object with this EXACT structure (no markdown, just JSON):
    {
        "emergingCareers": [
            { "title": "Job Title", "growthRate": Number, "salaryRange": "String", "demand": "String", "skills": ["Skill1", "Skill2"] }
        ],
        "decliningCareers": [
             { "title": "Job Title", "declineRate": Number, "reason": "Short string", "alternatives": ["Alt1", "Alt2"] }
        ],
        "skillDemand": [
            { "skill": "Skill Name", "demand": "High/Critical", "growth": "Percentage String" }
        ],
        "growthRate": Number (Overall sector growth),
        "riskLevel": "Low/Medium/High",
        "marketInsights": {
           "localMarket": "String",
           "regionalTrends": "String",
           "futurePrediction": "String"
        },
        "recommendations": [
            { "type": "Career Path", "title": "String", "description": "String", "action": "String", "priority": "High" }
        ]
    }
    Make predictions realistic based on 2024-2030 trends.
    `;

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3",
            prompt: prompt,
            stream: false,
            format: "json"
        });

        // Parse the JSON response
        let aiData = JSON.parse(response.data.response);
        return aiData;

    } catch (e) {
        console.error("AI Prediction Error:", e);
        // Fallback to basic data if AI fails
        return {
            emergingCareers: [{ title: "AI Specialist (Fallback)", growthRate: 20, salaryRange: "$80k+", demand: "High", skills: ["AI"] }],
            decliningCareers: [],
            skillDemand: [],
            growthRate: 5,
            riskLevel: "Medium",
            recommendations: [],
            marketInsights: {}
        };
    }
}

// Routes
router.post('/api/career-trends/analyze', async (req, res) => {
    try {
        const { interests, skills, location, educationLevel, timeHorizon } = req.body;

        // Real AI Analysis
        const trends = await analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon);

        // Structure for Frontend (merging insights/recs into root if needed, but the AI returns them inside)
        // The frontend expects: { success: true, trends: ..., recommendations: ..., marketInsights: ... }

        res.json({
            success: true,
            trends: trends, // The AI object contains all the nested lists
            recommendations: trends.recommendations || [],
            marketInsights: trends.marketInsights || {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze career trends'
        });
    }
});

// Get market insights based on location and time horizon
function getMarketInsights(location, timeHorizon) {
    const insights = {
        localMarket: 'Strong technology sector growth',
        regionalTrends: 'Healthcare and renewable energy expanding',
        nationalOutlook: 'Digital transformation driving job creation',
        globalPerspective: 'Remote work increasing global opportunities'
    };

    if (location && location.toLowerCase().includes('tech')) {
        insights.localMarket = 'Leading technology innovation hub';
        insights.regionalTrends = 'AI and software development booming';
    }

    if (timeHorizon === '5-10 years') {
        insights.futurePrediction = 'AI will create more jobs than it replaces';
    } else if (timeHorizon === '1-3 years') {
        insights.futurePrediction = 'Digital skills will be essential for all careers';
    }

    return insights;
}

module.exports = router;
