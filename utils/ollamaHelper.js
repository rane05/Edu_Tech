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
 * Deep Analysis of candidate's answer using Groq
 */
async function deepAnalyzeResponse(role, seniority, transcript) {
    const prompt = `
    You are an expert Interview Coach and Sentiment Specialist.
    Candidate Role: ${role}
    Seniority: ${seniority}
    Answer: "${transcript}"

    Perform a deep analysis of this answer. Evaluate:
    1. Technical Accuracy (score 0-100)
    2. Communication Clarity (score 0-100)
    3. Sentiment & Confidence (Highly Confident, Neutral, Hesitant)
    4. Key Weaknesses
    5. Improvement Tips

    Output exactly this JSON format:
    {
        "technicalScore": number,
        "communicationScore": number,
        "confidenceScore": number,
        "overallSentiment": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "tips": ["string"],
        "feedback": "string",
        "followUp": "string"
    }
    `;

    try {
        return await generateJSON(prompt);
    } catch (e) {
        console.error("Deep Analysis Error:", e);
        return {
            technicalScore: 50,
            communicationScore: 50,
            confidenceScore: 50,
            overallSentiment: "Neutral",
            strengths: ["Communication"],
            weaknesses: ["Technical depth"],
            tips: ["Provide more specific examples using STAR method"],
            feedback: "Analysis took too long. Keep practicing!",
            followUp: "Could you explain a specific time you faced a challenge?"
        };
    }
}

/**
 * Analyzes the candidate's answer (Legacy Hook)
 */
async function analyzeResponse(role, seniority, transcript) {
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
    analyzeResponse,
    deepAnalyzeResponse
};
