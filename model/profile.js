const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String, default: '' },
    state: { type: String, required: true },
    district: { type: String },
    collegeName: { type: String },
    course: { type: String },
    year: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    // schoolName: { type: String, required: true },
    // schoolBoard: { type: String, required: true },
    // passingYear: { type: Number, required: true },
    skills: { type: String, default: '' },
    careerGoal: { type: String, default: '' },
    progress: { type: Number, default: 0 }, // New progress field for dashboard tracking
    uniqueCode: { type: String, unique: true, sparse: true }, // Unique code for linking
    parentUsername: { type: String, default: null } // Store parent's username if linked


});

module.exports = mongoose.model('Profile', ProfileSchema);
