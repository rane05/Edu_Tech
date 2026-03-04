const mongoose = require('mongoose');

/**
 * AdvisorBooking Schema
 * Stores high-intent leads for global education counseling.
 */
const AdvisorBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    course: { type: String, required: true },
    intake: { type: String, required: true },
    gpa: { type: String },
    status: { type: String, default: 'Pending' }, // Pending, Scheduled, Completed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdvisorBooking', AdvisorBookingSchema);
