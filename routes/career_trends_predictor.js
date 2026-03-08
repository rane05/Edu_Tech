const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

router.get('/career-trends-predictor', (req, res) => {
    res.render('career_trends_predictor');
});

async function analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon) {
    const prompt = `
    Role: Expert AI Career Analytics Predictor.
    Task: predict sequential career progression and market data.
    Input Data:
    - Interests: ${interests}
    - Skills: ${skills}
    - Location: ${location}
    - Education: ${educationLevel}
    - Time Horizon: ${timeHorizon}

    Output Requirement: Provide a JSON object with this EXACT structure (no markdown, just JSON):
    {
        "careerPath": [
            { "stage": "e.g. Student", "role": "Job Title", "salaryRange": "e.g. $80k - $100k", "demandScore": "90/100", "keySkills": ["Skill1", "Skill2"] }
        ],
        "skillGapAnalysis": {
            "missingSkills": [
                { "skill": "React", "currentProgress": 20 }
            ],
            "recommendedLearning": ["Concept 1", "Concept 2"]
        },
        "salaryTrends": {
            "labels": ["2025", "2027", "2030"],
            "data": [80000, 110000, 150000]
        },
        "demandForecast": {
            "labels": ["2025", "2027", "2030"],
            "data": [82, 90, 95]
        }
    }
    The careerPath must show a sequential progression of 3-5 roles.
    `;

    try {
        if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0]?.message?.content || "{}");
    } catch (e) {
        console.error("AI Prediction Error:", e);
        // Fallback
        return {
            careerPath: [
                { stage: "Stage 1", role: "Junior Developer", salaryRange: "$70k - $90k", demandScore: "80/100", keySkills: ["HTML", "CSS", "JS"] },
                { stage: "Stage 2", role: "Software Engineer", salaryRange: "$100k - $130k", demandScore: "85/100", keySkills: ["React", "Node.js"] },
                { stage: "Stage 3", role: "Senior Engineer", salaryRange: "$140k - $180k", demandScore: "92/100", keySkills: ["System Design", "Cloud"] },
                { stage: "Stage 4", role: "AI Architect", salaryRange: "$180k - $250k", demandScore: "98/100", keySkills: ["AI/ML", "Architecture"] }
            ],
            skillGapAnalysis: {
                missingSkills: [
                    { skill: "Machine Learning", currentProgress: 15 },
                    { skill: "Cloud Architecture", currentProgress: 30 }
                ],
                recommendedLearning: ["Advanced Algorithms", "AWS/GCP Basics", "System Design patterns"]
            },
            salaryTrends: {
                labels: ["2024", "2026", "2028", "2030"],
                data: [75000, 115000, 160000, 215000]
            },
            demandForecast: {
                labels: ["2024", "2026", "2028", "2030"],
                data: [78, 85, 92, 97]
            }
        };
    }
}

router.post('/api/career-trends/analyze', async (req, res) => {
    try {
        const { interests, skills, location, educationLevel, timeHorizon } = req.body;
        const analysis = await analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon);
        res.json({ success: true, ...analysis });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to analyze career trends' });
    }
});

module.exports = router;
