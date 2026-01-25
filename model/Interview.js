const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    conversationHistory: [{
        question: { type: String, required: true },
        answer: { type: String },
        evaluation: {
            score: { type: Number }, // 0-10 or 0-100
            feedback: { type: String },
            technicalAccuracy: { type: String },
            communicationSkills: { type: String }
        },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        timestamp: { type: Date, default: Date.now }
    }],
    finalEvaluation: {
        score: { type: Number }, // Overall score
        summary: { type: String },
        strengths: [String],
        weaknesses: [String],
        recommendation: { type: String, enum: ['Hire', 'Consider', 'Reject'] },
        generatedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
