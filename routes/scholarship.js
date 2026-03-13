const express = require('express');
const router = express.Router();
const Scholarship = require('../model/Scholarship');

// Route to render scholarship.ejs form
router.get('/scholarship', async (req, res) => {
    res.render('scholarship');
});

// Route to handle scholarship results
router.get('/scholarship_res', async (req, res) => {
    const { casteCategory, currentEducation, course, state } = req.query;

    try {
        const query = {
            educationLevel: currentEducation,
            course: course,
            state: state
        };

        // If user selects a specific caste, match that caste OR 'All' OR combined strings like 'SC/ST/OBC'
        // If they select 'All', we don't apply the caste filter (showing everything for their course/state)
        if (casteCategory && casteCategory !== 'All') {
            query.casteCategory = { $regex: new RegExp(`(${casteCategory}|All)`, 'i') };
        }

        const scholarships = await Scholarship.find(query);

        res.render('scholarship_res', {
            scholarships: scholarships,
            selectedCourse: course,
            selectedState: state,
            selectedCaste: casteCategory
        });

    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;