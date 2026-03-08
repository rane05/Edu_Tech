const Groq = require('groq-sdk');

async function generateJSON(prompt) {
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
    } catch (error) {
        console.error("Groq Generation Error:", error.message);
        throw error;
    }
}

/**
 * Generates 5 interview questions based on role and seniority.
 */
async function generateQuestions(role, seniority) {
    const prompt = `
    You are an expert Technical Interviewer.
    Role: ${role}
    Seniority: ${seniority}

    Task: Generate 5 relevant interview questions for this candidate.
    
    Output exactly this JSON format:
    {
        "questions": [
            "Question 1...",
            "Question 2...",
            "Question 3...",
            "Question 4...",
            "Question 5..."
        ]
    }
    `;

    try {
        const data = await generateJSON(prompt);
        return data.questions || [];
    } catch (e) {
        console.error("Failed to generate questions", e);
        return [
            `Tell me about your experience as a ${role}.`,
            "What is your greatest technical strength?",
            "Describe a challenging project you worked on.",
            "How do you handle tight deadlines?",
            "Do you have any questions for us?"
        ];
    }
}

/**
 * Analyzes the candidate's answer.
 */
async function analyzeResponse(role, seniority, transcript) {
    // Note: We don't have the specific question in the simplified 'analyze' endpoint of the enhanced UI 
    // (the frontend just sends transcript, role, seniority). 
    // We'll trust the transcript contains enough context or assumes a general technical/behavioral answer check.

    const prompt = `
    You are an expert Interview Coach.
    Candidate Role: ${role}
    Seniority: ${seniority}
    Candidate Answer Transcript: "${transcript}"

    Task: Analyze the answer provided by the candidate.
    
    Output exactly this JSON format:
    {
        "sentiment": "positive" | "neutral" | "negative",
        "confidence": number, // 0-100
        "summary": "Brief summary of their answer...",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "gaps": ["Area for improvement 1", "Area for improvement 2"],
        "recommendations": ["Tip 1", "Tip 2"],
        "followUpQuestion": "A relevant follow-up question..."
    }
    `;

    try {
        return await generateJSON(prompt);
    } catch (e) {
        console.error("Failed to analyze response", e);
        return {
            sentiment: "neutral",
            confidence: 50,
            summary: "Could not analyze detailed feedback at this moment.",
            strengths: ["Communication"],
            gaps: ["Technical Detail"],
            recommendations: ["Try to be more specific."],
            followUpQuestion: "Could you elaborate?"
        };
    }
}

module.exports = {
    generateQuestions,
    analyzeResponse
};
