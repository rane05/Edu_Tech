const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserRoadmapSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    careerTitle: { type: String, required: true }, // Not populating Career model to allow flexible AI generated ones
    generated_phases: [{
        phaseNumber: Number,
        phaseName: String,
        estimatedDurationWeeks: Number,
        topics: [String],
        resources: [String],
        projects: [{
            title: String,
            objective: String,
            skillsUsed: [String],
            resumeBullet: String,
            difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }
        }]
    }],
    skill_gap: {
        already_have: [String],
        missing_high_priority: [{
            name: String,
            category: String,
            difficulty: Number,
            demandScore: Number,
            automationRisk: Number,
            priorityScore: Number,
            priorityLabel: String
        }],
        missing_medium_priority: [{
            name: String,
            category: String,
            difficulty: Number,
            demandScore: Number,
            automationRisk: Number,
            priorityScore: Number,
            priorityLabel: String
        }],
        advanced_optional: [{
            name: String,
            category: String,
            difficulty: Number,
            demandScore: Number,
            automationRisk: Number,
            priorityScore: Number,
            priorityLabel: String
        }]
    },
    backup_careers: [{
        title: String,
        why_recommended: String,
        skill_overlap_percentage: Number,
        transition_ease: String
    }],
    overall_suitability_score: Number,
    estimated_total_weeks: Number,
    overview: {
        roleDescription: String,
        salaryRangeEntry: String,
        salaryRangeMid: String,
        salaryRangeSenior: String,
        growthRate: String,
        automationRisk: Number,
        suitabilityScore: Number
    },
    progress: {
        completed_phases: [Number],
        completed_topics: [String], // Array of unique strings like "phase1-topic2"
        overall_percentage: { type: Number, default: 0 }
    },
    started_at: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserRoadmap', UserRoadmapSchema);
