const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    importance_weight: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    difficulty_level: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    demand_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        index: -1 // Descending index for rapid querying of high demand skills
    },
    job_frequency: { type: Number, default: 50 },
    salary_premium: { type: Number, default: 50 },
    industry_growth: { type: Number, default: 50 },
    scarcity_factor: { type: Number, default: 50 },
    automation_risk: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    transferability_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    future_growth_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    related_skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Skill', skillSchema);
