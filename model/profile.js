const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    profileImage: { type: String, default: '' },
    state: { type: String },
    district: { type: String },
    collegeName: { type: String },
    course: { type: String },
    year: { type: String },
    linkedin: { type: String, default: 'N/A' },
    twitter: { type: String, default: 'N/A' },
    skills: { type: String, default: '' },
    careerGoal: { type: String, default: '' },
    uniqueCode: { type: String, unique: true, sparse: true }, // Unique code for linking (sparse to allow nulls)
    parentUsername: { type: String, default: null }, // Store parent's username if linked
    linkedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Link to multiple teachers in same college
    interviewStats: [{
        role: String,
        date: Date,
        confidenceScore: Number,
        clarityScore: Number,
        overallSentiment: String
    }]
});

module.exports = mongoose.model('Profile', ProfileSchema);
