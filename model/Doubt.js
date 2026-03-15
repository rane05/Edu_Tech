const mongoose = require("mongoose");

const DoubtSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    studentName: { type: String },
    collegeName: { type: String, required: true },
    subject: { type: String, required: true },
    question: { type: String, required: true },
    // Aliases for compatibility with Teachers-students-connect branch
    title: { type: String },
    description: { type: String },
    teacherReply: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "resolved", "answered"],
        default: "pending"
    },
    answer: { type: String, default: null },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doubt", DoubtSchema);
