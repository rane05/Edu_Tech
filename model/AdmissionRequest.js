const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdmissionRequestSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    studentInfo: {
        name: String,
        email: String,
        phone: String,
        marks_10th: Number,
        marks_12th: Number,
        preferredBranch: String,
        additionalInfo: String
    },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdmissionRequest', AdmissionRequestSchema);
