const mongoose = require("mongoose");

const TeacherWorkSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["task", "announcement", "resource"],
        required: true
    },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeName: { type: String, required: true },
    title: {
        type: String,
        required: true
    },
    dueDate: {
        type: String,
        default: null
    },
    date: {
        type: String,
        default: null
    },
    link: {
        type: String,
        default: null // For resources (YouTube links, PDF links, etc.)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TeacherWork = mongoose.model("TeacherWork", TeacherWorkSchema);
module.exports = TeacherWork;
