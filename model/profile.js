const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    profileImage: { type: String, default: '' },
<<<<<<< HEAD
    state: { type: String },
=======
    state: { type: String, required: true },
>>>>>>> origin/Teachers-students-connect
    district: { type: String },
    collegeName: { type: String },
    course: { type: String },
    year: { type: String },
<<<<<<< HEAD
    linkedin: { type: String, default: 'N/A' },
    twitter: { type: String, default: 'N/A' },
    skills: { type: String, default: '' },
    careerGoal: { type: String, default: '' },
    uniqueCode: { type: String, unique: true, sparse: true }, // Unique code for linking (sparse to allow nulls)
    parentUsername: { type: String, default: null }, // Store parent's username if linked
    linkedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Link to multiple teachers in same college
=======
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


>>>>>>> origin/Teachers-students-connect
});

module.exports = mongoose.model('Profile', ProfileSchema);
