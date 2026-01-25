const mongoose = require('mongoose');

const CutoffSchema = new mongoose.Schema({
  category: { type: String, },
  cetScore: { type: Number, },
  round: { type: Number, },
  year: { type: Number, }
});

const BranchSchema = new mongoose.Schema({
  name: { type: String, },
  cutoffs: [CutoffSchema]
});

const CollegeSchema = new mongoose.Schema({
  name: { type: String, },
  university: { type: String, },
  location: { type: String, }, // State
  fees: {
    ug: { type: String }, // Stored as string to keep CSV formatting or convert later
    pg: { type: String }
  },
  rating: { type: Number },
  infrastructure: { type: Number },
  academic: { type: Number },
  faculty: { type: Number },
  placement: { type: Number },
  accommodation: { type: Number },
  socialLife: { type: Number },
  branches: [BranchSchema]
});

const College = mongoose.model('College', CollegeSchema);

module.exports = College;
