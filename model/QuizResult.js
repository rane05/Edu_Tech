const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: { type: Number, required: true }, // Out of 60
    totalQuestions: { type: Number, default: 15 },
    correctAnswers: { type: Number, required: true },
    sectionScores: {
        quantitative: { type: Number, default: 0 },
        verbal: { type: Number, default: 0 },
        logical: { type: Number, default: 0 }
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
