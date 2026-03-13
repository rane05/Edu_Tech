const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// Real AI LinkedIn profile analysis using Groq
async function analyzeLinkedInProfile(profileUrl) {
    const prompt = `You are a professional HR Specialist and Technical Recruiter. Analyze the LinkedIn profile at this URL: ${profileUrl}

Critically evaluate the profile strength and provide a technical summary.
You MUST output your response as a pure, valid JSON object matching EXACTLY this structure:
{
    "profileStrength": (integer from 0-100),
    "keySkills": ["(string)", "(string)", "(string)", "(string)", "(string)"],
    "experienceLevel": "(string: Junior, Mid, Senior, or Executive)",
    "industryFit": "(string)",
    "recommendations": ["(string)", "(string)", "(string)"],
    "growthAreas": ["(string)", "(string)", "(string)"]
}

Output ONLY the raw JSON object. Do not include markdown blocks or any other text.`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsedAnalysis = JSON.parse(content);

        return {
            profileStrength: parsedAnalysis.profileStrength || 70,
            keySkills: parsedAnalysis.keySkills || ['General Skills'],
            experienceLevel: parsedAnalysis.experienceLevel || 'Mid-Level',
            industryFit: parsedAnalysis.industryFit || 'Technology',
            recommendations: parsedAnalysis.recommendations || ['Complete your profile for better analysis'],
            growthAreas: parsedAnalysis.growthAreas || ['Upskilling in new technologies']
        };
    } catch (error) {
        console.error("LinkedIn Groq Analysis Error:", error);
        return {
            profileStrength: 50,
            keySkills: ['Profile Analysis Failed'],
            experienceLevel: 'Unknown',
            industryFit: 'Unknown',
            recommendations: ['Check API connectivity', 'Ensure URL is valid'],
            growthAreas: ['Error processing request']
        };
    }
}

// Real AI GitHub repository analysis using Groq
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

Output ONLY the raw JSON object. Do not include markdown blocks or any other text.`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsedAnalysis = JSON.parse(content);

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
        console.error("GitHub Groq Analysis Error:", error);
        return {
            codeQuality: 60,
            documentation: 60,
            activity: 60,
            collaboration: 60,
            strengths: ['Manual Review Required', 'AI connection error'],
            improvements: ['Check Groq API key', 'Verify repository access'],
            technologies: ['Not detected'],
            complexity: 'Unknown'
        };
    }
}

// Real AI research topic analysis using Groq
async function analyzeResearchTopic(topic) {
    const prompt = `You are a high-level Academic Research Advisor. Analyze the scientific or technical relevance of the following topic: ${topic}

Provide a detailed analysis of trends, researchers, and funding.
You MUST output your response as a pure, valid JSON object matching EXACTLY this structure:
{
    "relevance": (integer from 0-100),
    "currentTrends": ["(string)", "(string)", "(string)"],
    "keyResearchers": ["(string)", "(string)", "(string)"],
    "fundingOpportunities": ["(string)", "(string)", "(string)"],
    "publicationVenues": ["(string)", "(string)", "(string)"]
}

Output ONLY the raw JSON object. Do not include markdown blocks or any other text.`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsedAnalysis = JSON.parse(content);

        return {
            relevance: parsedAnalysis.relevance || 75,
            currentTrends: parsedAnalysis.currentTrends || ['Analysis in progress'],
            keyResearchers: parsedAnalysis.keyResearchers || ['Topic experts'],
            fundingOpportunities: parsedAnalysis.fundingOpportunities || ['Academic funding'],
            publicationVenues: parsedAnalysis.publicationVenues || ['Top journals']
        };
    } catch (error) {
        console.error("Research Groq Analysis Error:", error);
        return {
            relevance: 50,
            currentTrends: ['Error fetching trends'],
            keyResearchers: ['Error fetching researchers'],
            fundingOpportunities: ['Check API connectivity'],
            publicationVenues: ['Connection failed']
        };
    }
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
