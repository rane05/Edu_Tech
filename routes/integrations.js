const express = require('express');
const router = express.Router();

// Integrations/Analyzer - Main page
router.get('/integrations', (req, res) => {
    res.render('integrations');
});

// LinkedIn profile analysis
router.post('/api/linkedin-analysis', async (req, res) => {
    try {
        const { profileUrl } = req.body;

        // Mock AI analysis - in production, this would use real AI
        const analysis = await analyzeLinkedInProfile(profileUrl);

        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to analyze LinkedIn profile'
        });
    }
});

// GitHub project evaluation
router.post('/api/github-analysis', async (req, res) => {
    try {
        const { repositoryUrl } = req.body;

        // Mock AI analysis - in production, this would use real AI
        const analysis = await analyzeGitHubRepository(repositoryUrl);

        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to analyze GitHub repository'
        });
    }
});

// Google Scholar research analysis
router.post('/api/google-scholar-analysis', async (req, res) => {
    try {
        const { researchTopic } = req.body;

        // Mock AI analysis - in production, this would use real AI
        const analysis = await analyzeResearchTopic(researchTopic);

        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to analyze research topic'
        });
    }
});

// Add certification
router.post('/api/certifications/add', async (req, res) => {
    try {
        const { certificateId, issuer, issueDate, expirationDate, skillsCovered } = req.body;

        // Mock certification addition - in production, this would save to database
        const certification = {
            id: Date.now(),
            certificateId,
            issuer,
            issueDate,
            expirationDate,
            skillsCovered: skillsCovered.split(',').map(skill => skill.trim()),
            status: 'active'
        };

        res.json({
            success: true,
            certification: certification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to add certification'
        });
    }
});

// Verify certification
router.post('/api/certifications/verify', async (req, res) => {
    try {
        const { certificateId, issuer } = req.body;

        // Mock verification - in production, this would check against issuer database
        const verification = await verifyCertification(certificateId, issuer);

        res.json({
            success: true,
            verification: verification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to verify certification'
        });
    }
});

// Mock LinkedIn profile analysis
async function analyzeLinkedInProfile(profileUrl) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        profileStrength: 85,
        keySkills: ['JavaScript', 'React', 'Node.js', 'Leadership', 'Project Management'],
        experienceLevel: 'Mid-Senior',
        industryFit: 'Technology',
        recommendations: [
            'Add more quantifiable achievements',
            'Include certifications and courses',
            'Optimize headline for better visibility'
        ],
        growthAreas: [
            'Data Science',
            'Cloud Computing',
            'AI/ML Fundamentals'
        ]
    };
}

// Connect to local Ollama instance for real GitHub repository analysis
async function analyzeGitHubRepository(repositoryUrl) {
    const prompt = `You are a Senior Principal Staff Engineer evaluating a candidate's GitHub repository at the following URL:
${repositoryUrl}

Critically evaluate this repository based on standard software engineering practices.
You MUST output your response as a pure, valid JSON object matching EXACTLY this structure:
{
    "codeQuality": (integer from 0-100),
    "documentation": (integer from 0-100),
    "activity": (integer from 0-100),
    "collaboration": (integer from 0-100),
    "strengths": ["(string)", "(string)", "(string)"],
    "improvements": ["(string)", "(string)", "(string)"],
    "technologies": ["(string)", "(string)"],
    "complexity": "(string: Basic, Intermediate, Advanced, or Expert)"
}

Do NOT wrap the JSON in markdown formatting blocks like \`\`\`json. Output ONLY the raw JSON object. Do not include any other text or explanations.`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3',
                prompt: prompt,
                stream: false,
                format: 'json' // Force Ollama to output JSON
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Sometimes LLMs still add text around the JSON or markdown blocks. Attempt to parse cleanly.
        let jsonString = data.response.trim();

        // Strip markdown backticks if present
        if (jsonString.startsWith('\`\`\`')) {
            jsonString = jsonString.replace(/^\`\`\`(json)?\n?/, '').replace(/\n?\`\`\`$/, '');
        }

        const parsedAnalysis = JSON.parse(jsonString);

        // Ensure all required fields exist to prevent frontend crash
        return {
            codeQuality: parsedAnalysis.codeQuality || 50,
            documentation: parsedAnalysis.documentation || 50,
            activity: parsedAnalysis.activity || 50,
            collaboration: parsedAnalysis.collaboration || 50,
            strengths: parsedAnalysis.strengths || ["Analyzing strengths..."],
            improvements: parsedAnalysis.improvements || ["Analyzing improvements..."],
            technologies: parsedAnalysis.technologies || ["Unknown"],
            complexity: parsedAnalysis.complexity || "Intermediate"
        };

    } catch (error) {
        console.error("Ollama Analysis Error:", error);

        // Safe fallback if the LLM is down or hallucinated bad JSON
        return {
            codeQuality: 78,
            documentation: 65,
            activity: 82,
            collaboration: 70,
            strengths: [
                'Fallback: Could not reach LLM',
                'Assuming standard repository structure',
                'Review repository manually'
            ],
            improvements: [
                'Ensure local Ollama (llama3) is running',
                'Check network connectivity to localhost:11434',
                'Verify LLM JSON output format'
            ],
            technologies: ['Language Detection Failed'],
            complexity: 'Unknown'
        };
    }
}

// Mock research topic analysis
async function analyzeResearchTopic(topic) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        relevance: 88,
        currentTrends: [
            'AI and Machine Learning integration',
            'Sustainable technology solutions',
            'Remote work optimization'
        ],
        keyResearchers: [
            'Dr. Smith - MIT',
            'Prof. Johnson - Stanford',
            'Dr. Williams - Harvard'
        ],
        fundingOpportunities: [
            'NSF Grants',
            'Industry partnerships',
            'Academic collaborations'
        ],
        publicationVenues: [
            'Nature',
            'Science',
            'IEEE Transactions'
        ]
    };
}

// Mock certification verification with enhanced details
async function verifyCertification(certificateId, issuer) {
    // Simulate verification delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate "Trusted Issuer" check
    const trustedIssuers = ['google', 'microsoft', 'aws', 'coursera', 'udemy', 'edx', 'harvard', 'mit', 'stanford', 'ibm'];
    const isTrusted = trustedIssuers.some(t => issuer.toLowerCase().includes(t));

    // Generate a consistent "blockchain hash" for the certificate
    const mockHash = '0x' + Array.from(certificateId + issuer).map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 40) + '...';

    const verificationSteps = [
        { name: 'Issuer Identity Verification', status: isTrusted ? 'Verified' : 'Pending Review', icon: isTrusted ? '✅' : '⚠️' },
        { name: 'Cryptographic Signature Check', status: 'Valid', icon: '🔒' },
        { name: 'Blockchain Timestamp', status: new Date().toISOString(), icon: '⏰' },
        { name: 'Revocation List Check', status: 'Clear', icon: '🛡️' }
    ];

    return {
        isValid: true,
        verificationDate: new Date().toISOString(),
        issuer: issuer,
        certificateId: certificateId,
        status: 'Verified',
        grade: 'Pass with Distinction', // Added field
        blockchainHash: mockHash,      // Added field
        expirationDate: '2025-12-31',
        skills: ['JavaScript', 'React', 'Node.js', 'System Design'], // Enhanced skills
        verificationSteps: verificationSteps, // Added field
        metadata: {
            issueBlock: 142394,
            validatorNode: 'EduNode-Alpha-1'
        }
    };
}

module.exports = router;
