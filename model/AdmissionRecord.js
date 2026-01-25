const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
    studentId: String,
    gender: String,
    category: String,
    state: String,
    stream: String, // preferred_stream
    exam: String, // entrance_exam
    score: Number, // entrance_score
    boardPercentage: Number,
    admissionStatus: String, // admitted/rejected
    admissionProbability: Number
});

module.exports = mongoose.model('AdmissionRecord', AdmissionSchema);
