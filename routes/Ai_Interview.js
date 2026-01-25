const express = require('express');
const router = express.Router();
const Interview = require('../model/Interview');
const {
    generateGreetingAndFirstQuestion,
    evaluateAnswer,
    generateNextQuestion,
    generateFinalReport
} = require('../utils/geminiHelper');

// Constants
const MAX_QUESTIONS = 5;

// AI Interview Simulator - Main page
router.get('/interview-simulator', (req, res) => {
    // Check if user is logged in (optional depending on auth setup, but recommended)
    // if (!req.session.userId) return res.redirect('/login');
    res.render('interview_simulator', { user: req.session || {} });
});

// START Interview
router.post('/interview/start', async (req, res) => {
    try {
        const { role = "Unspecified", seniority = "Unspecified", name, background = "Unspecified" } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Please login to start interview." });
        }

        // Generate AI content
        const { greeting, question } = await generateGreetingAndFirstQuestion(name, role, seniority, background);

        // Create new Interview Session
        const interview = new Interview({
            userId,
            jobRole: role,
            experienceLevel: seniority,
            conversationHistory: [{
                question: question,
                difficulty: 'medium' // Starting difficulty
            }],
            currentQuestionIndex: 0
        });

        await interview.save();

        res.json({
            success: true,
            interviewId: interview._id,
            greeting,
            firstQuestion: question,
            totalQuestions: MAX_QUESTIONS
        });

    } catch (error) {
        console.error("Start Interview Error:", error);
        res.status(500).json({ success: false, error: "Failed to start interview." });
    }
});

// SUBMIT ANSWER & GET NEXT STEP
router.post('/interview/submit', async (req, res) => {
    try {
        const { interviewId, transcript } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ success: false, error: "Interview not found." });

        if (interview.status === 'completed') {
            return res.json({ success: false, error: "Interview already completed." });
        }

        const currentIndex = interview.currentQuestionIndex;
        const currentQData = interview.conversationHistory[currentIndex];

        // 1. Evaluate current answer
        const evaluation = await evaluateAnswer(
            currentQData.question,
            transcript,
            interview.jobRole,
            interview.experienceLevel
        );

        // Update current history item with answer and evaluation
        currentQData.answer = transcript;
        currentQData.evaluation = evaluation;

        // 2. Check if we should end or continue
        if (currentIndex + 1 >= MAX_QUESTIONS) {
            // End of interview
            interview.status = 'completed';
            const finalReport = await generateFinalReport(interview.conversationHistory, interview.jobRole);
            interview.finalEvaluation = finalReport;
            await interview.save();

            return res.json({
                success: true,
                isCompleted: true,
                feedback: evaluation.feedback, // Spoken feedback for last answer
                finalReport
            });

        } else {
            // 3. Generate Next Question
            const nextQData = await generateNextQuestion(
                interview.conversationHistory,
                interview.jobRole,
                interview.experienceLevel
            );

            // Add next question to history
            interview.conversationHistory.push({
                question: nextQData.question,
                difficulty: nextQData.difficulty
            });
            interview.currentQuestionIndex += 1;
            await interview.save();

            return res.json({
                success: true,
                isCompleted: false,
                feedback: evaluation.feedback, // Spoken feedback for previous answer
                nextQuestion: nextQData.question,
                currentQuestionIndex: interview.currentQuestionIndex + 1
            });
        }

    } catch (error) {
        console.error("Submit Answer Error:", error);
        res.status(500).json({ success: false, error: "Failed to process answer." });
    }
});

module.exports = router;