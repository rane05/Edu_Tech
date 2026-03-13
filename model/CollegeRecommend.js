const mongoose = require('mongoose');

const CutoffSchema = new mongoose.Schema({
    category: { type: String },
    cetScore: { type: Number },
    round: { type: Number },
    year: { type: Number }
});

const BranchSchema = new mongoose.Schema({
    name: { type: String },
    cutoffs: [CutoffSchema]
});

const CollegeRecommendSchema = new mongoose.Schema({
    name: { type: String, required: true },
    university: { type: String },
    location: { type: String },
    fees: {
        ug: { type: String },
        pg: { type: String }
    },
    rating: { type: Number },
    infrastructure: { type: Number },
    academic: { type: Number },
    faculty: { type: Number },
    placement: { type: Number },
    accommodation: { type: Number },
    socialLife: { type: Number },
    branches: [BranchSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isSponsored: { type: Boolean, default: false },
    description: { type: String },
    contactEmail: { type: String },
    website: { type: String },
    logo: { type: String }
}, { timestamps: true });

const CollegeRecommend = mongoose.model('CollegeRecommend', CollegeRecommendSchema);

module.exports = CollegeRecommend;
