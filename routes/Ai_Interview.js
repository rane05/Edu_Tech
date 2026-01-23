const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Interview Simulator - Main page
router.get('/interview-simulator', (req, res) => {
    res.render('interview_simulator');
});

// Generate AI interview questions
router.post('/interview/questions', async (req, res) => {
    try {
        const { role, seniority, name, background, interests } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Act as an expert Technical Interviewer and Career Coach.
        Generate 5 relevant interview questions for a candidate with the following profile:
        - Name: ${name}
        - Target Role: ${role}
        - Seniority Level: ${seniority}
        - Background/Current Details: ${background}
        - Interests: ${interests}

        The questions should assess their suitability for the ${role} role, considering their background and interests.
        Make the questions a mix of technical, behavioral, and situational questions.
        Return ONLY a JSON array of strings, for example: ["Question 1", "Question 2", ...]. Do not include markdown formatting like \`\`\`json.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let questions;
        try {
            questions = JSON.parse(text);
        } catch (e) {
            // Fallback if parsing fails (simple split)
            questions = text.split('\n').filter(q => q.trim().length > 0).slice(0, 5);
        }

        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate questions. Please try again.'
        });
    }
});

// Analyze interview answers with AI
router.post('/interview/analyze', async (req, res) => {
    try {
        const { role, seniority, transcript, question } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Act as an expert Interview Coach.
        Analyze the following interview response:
        
        Role: ${role} (${seniority})
        Question: ${question || "General Interview Context"}
        Candidate's Response: "${transcript}"

        Provide a structured evaluation in JSON format with the following keys:
        - sentiment: 'positive', 'neutral', or 'negative'
        - confidence: number (0-100) based on the tone and clarity
        - summary: A brief 1-2 sentence summary of their answer
        - strengths: Array of strings (3-4 points)
        - gaps: Array of strings (areas for improvement)
        - recommendations: Array of strings (actionable advice)
        - followUpQuestion: A specific technical or behavioral follow-up question based on their answer.

        Return ONLY the raw JSON object. Do not include markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Return a safe fallback
            analysis = {
                sentiment: 'neutral',
                confidence: 50,
                summary: 'Analysis could not be parsed correctly, but response was recorded.',
                strengths: ['Response recorded'],
                gaps: [],
                recommendations: ['Please try again for detailed analysis'],
                followUpQuestion: 'Could you elaborate further?'
            }
        }

        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze response'
        });
    }
});

module.exports = router;