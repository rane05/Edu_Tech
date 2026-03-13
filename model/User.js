


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['student', 'teacher', 'parent', 'college', 'admin'], required: true },
    googleId: String,
    email: String,
    education: String,
    skills: { type: [String], default: [] },
    weekly_hours: Number,
    location: { type: String, default: "India" },
    budget: { type: String, default: "Free" },
    risk_level: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    interests: [{ type: String }],

    // Resume Details
    name: { type: String, default: '' },
    // Store array of completed step IDs (e.g. "Software Engineering-week-2")
    roadmapProgress: {
        type: [String],
        default: []
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);