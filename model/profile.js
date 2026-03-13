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
    linkedin: { type: String },
    twitter: { type: String },
    // schoolName: { type: String, required: true },
    // schoolBoard: { type: String, required: true },
    // passingYear: { type: Number, required: true },
    skills: { type: String, default: '' },
    careerGoal: { type: String, default: '' },
    uniqueCode: { type: String, unique: true }, // Unique code for linking
    parentUsername: { type: String, default: null }, // Store parent's username if linked
    linkedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Explicit link to teacher


});

module.exports = mongoose.model('Profile', ProfileSchema);
