const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to render the AI Resume Builder UI
router.get('/resume', (req, res) => {
    res.render('ai_resume', {
        user: req.user || { name: 'Guest' }
    });
});

// API Route to Generate Resume Content via Ollama
router.post('/api/resume/generate', async (req, res) => {
    try {
        const { name, role, experience, skills, education, projects, certifications, awards } = req.body;

        const prompt = `
        Act as a Professional Resume Writer.
        Create a high-impact resume content for the following profile:
        
        Name: ${name}
        Target Role: ${role}
        Experience Level: ${experience}
        Key Skills: ${skills}
        Education: ${education}
        Projects: ${projects}
        Certifications: ${certifications}
        Awards/Achievements: ${awards}

        INSTRUCTIONS:
        1. "summary": write a powerful 2-3 sentence professional summary.
        2. "experiencePoints": write 3-4 action-oriented bullet points for the ${experience} role.
        3. "projectDescriptions": write concise 1-sentence descriptions for the projects.
        4. "certificationPoints": format the certifications professionally.
        5. "awardPoints": format the awards/achievements professionally.

        OUTPUT FORMAT:
        Return ONLY a JSON object with this exact structure (no markdown, no latex code, just text):
        {
            "summary": "...",
            "experiencePoints": ["...", "..."],
            "projectDescriptions": ["...", "..."],
            "certificationPoints": ["...", "..."],
            "awardPoints": ["...", "..."]
        }
        `;

        // Call Ollama (Llama 3)
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3",
            prompt: prompt,
            stream: false,
            format: "json"
        });

        const aiResponse = response.data.response;

        // Parse JSON
        let structuredData;
        try {
            structuredData = JSON.parse(aiResponse);
        } catch (e) {
            console.error("JSON Parse Error, returning raw text", e);
            structuredData = {
                summary: "AI Generation failed to format correctly. Please try again.",
                experiencePoints: [],
                projectDescriptions: [],
                certificationPoints: [],
                awardPoints: []
            };
        }

        res.json({ success: true, data: structuredData });

    } catch (error) {
        console.error("AI Resume Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to generate resume. Ensure Ollama is running." });
    }
});

module.exports = router;
