const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CareerSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    salary_range: {
        entry: String,
        mid: String,
        senior: String
    },
    growth_rate: String,
    automation_risk: Number, // Percentage 0-100
    required_skills: [{ type: Schema.Types.ObjectId, ref: 'Skill', index: true }],
    optional_skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    advanced_skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    base_duration_months: Number,
    // The core phases template for this career
    roadmap_template: [{
        phaseNumber: Number,
        phaseName: String,
        estimatedDurationWeeks: Number, // Base week duration
        topics: [String],
        resources: [String],
        projects: [{
            title: String,
            objective: String,
            skillsUsed: [String],
            resumeBullet: String,
            difficulty: String
        }]
    }],
    related_careers: [{
        title: String,
        why_recommended: String,
        skill_overlap_percentage: Number,
        transition_ease: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Career', CareerSchema);
