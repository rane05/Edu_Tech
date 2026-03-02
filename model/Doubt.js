const mongoose = require("mongoose");

const DoubtSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    teacherReply: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "answered"],
        default: "pending"
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

module.exports = mongoose.model("Doubt", DoubtSchema);
