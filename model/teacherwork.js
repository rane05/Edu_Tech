const mongoose = require("mongoose");

const TeacherWorkSchema = new mongoose.Schema({
    type: {
        type: String,
<<<<<<< HEAD
        enum: ["task", "announcement", "resource", "doubt_session"],
=======
        enum: ["task", "announcement", "resource", "quiz", "meeting"],
>>>>>>> origin/Teachers-students-connect
        required: true
    },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeName: { type: String, required: true },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false // For longer descriptions
    },
    dueDate: {
        type: String,
<<<<<<< HEAD
        default: null
    },
    date: {
        type: String,
        default: null
    },
    link: {
        type: String,
        default: null // For resources (YouTube links, PDF links, etc.) or session links
    },
    sessionTime: {
        type: String,
        default: null
    },
    sessionDuration: {
        type: String, // e.g., "45 mins"
        default: null
=======
        default: null // Make it optional
    },
    date: {
        type: String,
        default: null // Make it optional
>>>>>>> origin/Teachers-students-connect
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TeacherWork = mongoose.model("TeacherWork", TeacherWorkSchema);
module.exports = TeacherWork;
