const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weekSchema = new Schema({
    focus: { type: String, required: true },
    topics: [{ type: String }],
    resources: [{ type: String }]
});

const roadmapSchema = new Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    overview: {
        roleDescription: String,
        requiredSkills: String,
        careerGrowth: String,
        salaryRange: String
    },
    weeks: [weekSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
