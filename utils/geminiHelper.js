const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper to clean JSON output from Gemini
function cleanJSON(text) {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * Generates the initial greeting and the first question.
 * NOW: Asks for introduction and role confirmation.
 */
async function generateGreetingAndFirstQuestion(name, role, experience, background) {
    const prompt = `
    You are an expert Technical Interviewer.
    Candidate Name: ${name}
    Intended Role: ${role}
    Experience Level: ${experience}
    
    Task:
    1. Generate a professional, short spoken greeting.
    2. Ask the candidate to briefly introduce themselves and mention specifically which role they are applying for (to confirm).
    
    Output JSON format:
    {
        "greeting": "...",
        "question": "Can you please introduce yourself and tell me the specific role you are applying for today?" // Example
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error("Gemini Greeting Error:", error);
        return {
            greeting: `Hello ${name}.`,
            question: "To begin, could you introduce yourself and specify the job role you are targeting?"
        };
    }
}

/**
 * Evaluates the candidate's answer and generates the final response if needed.
 */
async function evaluateAnswer(currentQuestion, transcript, role, experience) {
    const prompt = `
    Role: ${role}, Level: ${experience}
    Question: "${currentQuestion}"
    Candidate's Answer: "${transcript}"

    Task: Evaluate the answer.
    1. Score (0-10). If the answer is just an introduction, score based on confidence and clarity.
    2. Provide short, constructive spoken feedback (max 2 sentences).
    
    Output JSON format:
    {
        "score": number,
        "feedback": "...", 
        "technicalAccuracy": "Low/Medium/High",
        "communicationSkills": "Low/Medium/High"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("Gemini Eval Error:", error);
        return {
            score: 7,
            feedback: "Thank you.",
            technicalAccuracy: "Medium",
            communicationSkills: "Medium"
        };
    }
}

/**
 * Generates the next question based on history and difficulty.
 * WITH CONVERSATIONAL PHASES.
 */
async function generateNextQuestion(history, role, experience) {
    // History length = 1 means we just got the Answer to "Introduce yourself"
    // History length = 2 means we just got the Answer to "What skills do you have?" (potentially)

    const turnCount = history.length;

    // Context Construction
    const context = history.map((h, i) =>
        `Q${i + 1}: ${h.question} \nAns: ${h.answer}\nScore: ${h.evaluation.score}/10`
    ).join('\n---\n');

    let phaseInstruction = "";

    if (turnCount === 1) {
        // Phase 2: User just introduced themselves.
        // Task: Ask about specific skills/technologies relevant to the role they mentioned (or the default role).
        phaseInstruction = `
        The candidate just introduced themselves. 
        Your Task: Ask specifically what programming languages, tools, or technologies they are proficient in regarding the ${role} field.
        Do NOT ask a technical problem yet. Just gather their tech stack.
        `;
    } else {
        // Phase 3+: Technical Questions
        // Task: Ask a technical question based on the skills they mentioned in previous turns.
        const lastScore = history[history.length - 1].evaluation.score;
        let nextDifficulty = 'medium';
        if (lastScore > 8) nextDifficulty = 'hard';
        if (lastScore < 5) nextDifficulty = 'easy';

        phaseInstruction = `
        The candidate has provided their stack/background.
        Your Task: Generate a ${nextDifficulty} technical interview question based on the skills/technologies mentioned in the conversation history.
        Focus on: Concept understanding, problem solving, or scenario-based questions.
        `;
    }

    const prompt = `
    Role: ${role}, Level: ${experience}
    Conversation History:
    ${context}

    ${phaseInstruction}
    
    Output JSON format:
    {
        "question": "...",
        "difficulty": "medium" 
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("Gemini Next Q Error:", error);
        return {
            question: "Could you describe your technical skills in more detail?",
            difficulty: "medium"
        };
    }
}

/**
 * Generates the final feedback report.
 */
async function generateFinalReport(history, role) {
    const context = history.map((h, i) =>
        `Q${i + 1}: ${h.question}\nAns: ${h.answer}\nScore: ${h.evaluation.score}`
    ).join('\n---\n');

    const prompt = `
    Generate a final interview report for a ${role} position.
    Interview Transcript Summary:
    ${context}

    Task:
    1. Calculate an overall score (0-100).
    2. Summarize performance.
    3. List 3 Key Strengths.
    4. List 3 Weaknesses/Areas for Improvement.
    5. Final Recommendation (Hire/Consider/Reject).
    
    Output JSON format:
    {
        "score": number,
        "summary": "...",
        "strengths": ["...", "...", "..."],
        "weaknesses": ["...", "...", "..."],
        "recommendation": "..."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("Gemini Report Error:", error);
        return {
            score: 0,
            summary: "Error generating report.",
            strengths: [],
            weaknesses: [],
            recommendation: "Consider"
        };
    }
}

module.exports = {
    generateGreetingAndFirstQuestion,
    evaluateAnswer,
    generateNextQuestion,
    generateFinalReport
};
