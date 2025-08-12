const express = require('express');
const router = express.Router();

// AI Career Trend Predictor - Main page
router.get('/career-trends-predictor', (req, res) => {
    res.render('career_trends_predictor');
});

// API endpoint for career trend analysis
router.post('/api/career-trends/analyze', async (req, res) => {
    try {
        const { interests, skills, location, educationLevel, timeHorizon } = req.body;
        
        // Mock AI analysis - in production, this would use real ML models
        const trends = await analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon);
        
        res.json({
            success: true,
            trends: trends,
            recommendations: generateRecommendations(trends),
            marketInsights: getMarketInsights(location, timeHorizon)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze career trends' 
        });
    }
});

// AI-powered career trend analysis
async function analyzeCareerTrends(interests, skills, location, educationLevel, timeHorizon) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const trends = {
        emergingCareers: [],
        decliningCareers: [],
        skillDemand: [],
        salaryProjections: [],
        growthRate: 0,
        riskLevel: 'low'
    };
    
    // Analyze interests and skills to predict trends
    if (interests.includes('technology') || skills.includes('programming')) {
        trends.emergingCareers.push({
            title: 'AI/ML Engineer',
            growthRate: 23.5,
            salaryRange: '$80,000 - $150,000',
            demand: 'Very High',
            skills: ['Python', 'Machine Learning', 'Data Science']
        });
        trends.emergingCareers.push({
            title: 'Cybersecurity Analyst',
            growthRate: 31.2,
            salaryRange: '$70,000 - $130,000',
            demand: 'Very High',
            skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment']
        });
    }
    
    if (interests.includes('healthcare') || skills.includes('biology')) {
        trends.emergingCareers.push({
            title: 'Healthcare Data Analyst',
            growthRate: 18.7,
            salaryRange: '$60,000 - $110,000',
            demand: 'High',
            skills: ['Healthcare IT', 'Data Analysis', 'Medical Terminology']
        });
    }
    
    if (interests.includes('business') || skills.includes('management')) {
        trends.emergingCareers.push({
            title: 'Sustainability Manager',
            growthRate: 15.3,
            salaryRange: '$65,000 - $120,000',
            demand: 'High',
            skills: ['Environmental Science', 'Project Management', 'ESG']
        });
    }
    
    // Add declining careers
    trends.decliningCareers = [
        {
            title: 'Traditional Manufacturing Worker',
            declineRate: -8.2,
            reason: 'Automation and AI integration',
            alternatives: ['Robotics Technician', 'AI System Operator']
        }
    ];
    
    // Skill demand analysis
    trends.skillDemand = [
        { skill: 'Artificial Intelligence', demand: 'Very High', growth: '+45%' },
        { skill: 'Data Science', demand: 'Very High', growth: '+38%' },
        { skill: 'Digital Marketing', demand: 'High', growth: '+25%' },
        { skill: 'Cloud Computing', demand: 'High', growth: '+32%' }
    ];
    
    // Calculate overall growth rate
    trends.growthRate = trends.emergingCareers.reduce((sum, career) => sum + career.growthRate, 0) / trends.emergingCareers.length;
    
    return trends;
}

// Generate personalized recommendations
function generateRecommendations(trends) {
    const recommendations = [];
    
    if (trends.emergingCareers.length > 0) {
        recommendations.push({
            type: 'Career Path',
            title: 'Focus on Emerging Fields',
            description: `Consider pursuing ${trends.emergingCareers[0].title} as it shows strong growth potential.`,
            action: 'Research required education and skills',
            priority: 'High'
        });
    }
    
    if (trends.skillDemand.length > 0) {
        const topSkill = trends.skillDemand[0];
        recommendations.push({
            type: 'Skill Development',
            title: `Learn ${topSkill.skill}`,
            description: `This skill is in very high demand with ${topSkill.growth} growth expected.`,
            action: 'Find online courses and certifications',
            priority: 'High'
        });
    }
    
    recommendations.push({
        type: 'Market Strategy',
        title: 'Stay Adaptable',
        description: 'Focus on transferable skills that work across multiple industries.',
        action: 'Develop problem-solving and critical thinking abilities',
        priority: 'Medium'
    });
    
    return recommendations;
}

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
