const express = require('express');
const router = express.Router();

// AI Interview Simulator - Main page
router.get('/interview-simulator', (req, res) => {
    res.render('interview_simulator');
});

// Generate AI interview questions
router.post('/interview/questions', async (req, res) => {
    try {
        const { role, seniority } = req.body;
        
        // Mock AI question generation - in production, this would use real AI
        const questions = generateInterviewQuestions(role, seniority);
        
        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate questions' 
        });
    }
});

// Analyze interview answers with AI
router.post('/interview/analyze', async (req, res) => {
    try {
        const { role, seniority, transcript } = req.body;
        
        // Mock AI analysis - in production, this would use real AI
        const analysis = await analyzeInterviewResponse(role, seniority, transcript);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze response' 
        });
    }
});

// Generate interview questions based on role and seniority
function generateInterviewQuestions(role, seniority) {
    const questions = [];
    
    // Common questions for all roles
    questions.push("Tell me about yourself and your background.");
    questions.push("Why are you interested in this role?");
    questions.push("What are your greatest strengths and weaknesses?");
    
    // Role-specific questions
    if (role.toLowerCase().includes('developer') || role.toLowerCase().includes('engineer')) {
        questions.push("Describe a challenging technical problem you solved.");
        questions.push("How do you stay updated with the latest technologies?");
        questions.push("Walk me through your development process.");
    } else if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('lead')) {
        questions.push("Describe a time when you had to lead a difficult team.");
        questions.push("How do you handle conflicts within your team?");
        questions.push("What's your approach to project planning?");
    } else if (role.toLowerCase().includes('designer')) {
        questions.push("Walk me through your design process.");
        questions.push("How do you gather user requirements?");
        questions.push("Describe a design challenge you overcame.");
    }
    
    // Seniority-specific questions
    if (seniority === 'entry') {
        questions.push("What are you looking to learn in this role?");
        questions.push("How do you handle feedback and criticism?");
    } else if (seniority === 'mid') {
        questions.push("Describe a project where you took ownership.");
        questions.push("How do you mentor junior team members?");
    } else if (seniority === 'senior') {
        questions.push("How do you influence technical decisions?");
        questions.push("Describe a time when you had to push back on requirements.");
    }
    
    return questions.slice(0, 5); // Return 5 questions
}

// Analyze interview response with AI
async function analyzeInterviewResponse(role, seniority, transcript) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock AI analysis - in production, this would use real AI models
    const analysis = {
        sentiment: 'positive',
        confidence: 75,
        summary: 'The candidate provided a comprehensive and well-structured response that demonstrates strong communication skills and relevant experience.',
        strengths: [
            'Clear communication and articulation',
            'Relevant examples and experiences',
            'Good technical knowledge',
            'Professional demeanor'
        ],
        gaps: [
            'Could provide more specific metrics',
            'Limited discussion of challenges faced',
            'Could elaborate on learning outcomes'
        ],
        recommendations: [
            'Include specific numbers and achievements',
            'Prepare more detailed examples of problem-solving',
            'Practice discussing failures and lessons learned'
        ],
        followUpQuestion: 'Can you give me a specific example of when you had to learn a new technology quickly?'
    };
    
    // Adjust analysis based on role and seniority
    if (seniority === 'entry') {
        analysis.recommendations.push('Focus on demonstrating learning potential and adaptability');
    } else if (seniority === 'senior') {
        analysis.recommendations.push('Emphasize leadership and strategic thinking examples');
    }
    
    return analysis;
}

module.exports = router;