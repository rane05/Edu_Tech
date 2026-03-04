const mongoose = require("mongoose");

const DoubtSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // If student wants to target a specific teacher
    studentName: { type: String, required: true },
    collegeName: { type: String, required: true },
    subject: { type: String, required: true },
    question: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "resolved"],
        default: "pending"
    },
    answer: { type: String, default: null },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doubt", DoubtSchema);
