const mongoose = require("mongoose");

const TeacherWorkSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["task", "announcement", "resource"],
        required: true
    },
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
        default: null // Make it optional
    },
    date: {
        type: String,
        default: null // Make it optional
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
