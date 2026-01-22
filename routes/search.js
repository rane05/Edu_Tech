const express = require('express');
const router = express.Router();
const College = require('../model/cetCollege');
const Scholarship = require('../model/Scholarship');

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.render('search_results', { query: '', results: [] });

        const regex = new RegExp(query, 'i'); // Case-insensitive regex

        // Parallel search across models
        const [colleges, scholarships] = await Promise.all([
            College.find({
                $or: [{ name: regex }, { location: regex }, { 'branches.name': regex }]
            }).limit(10),
            Scholarship.find({
                $or: [{ name: regex }, { description: regex }]
            }).limit(10)
        ]);

        // Format results
        const results = [
            ...colleges.map(c => ({
                type: 'college',
                title: c.name,
                description: `${c.location} - ${c.branches ? c.branches.length + ' Branches' : ''}`,
                link: `/college/${c._id}` // Adjust link as needed
            })),
            ...scholarships.map(s => ({
                type: 'scholarship',
                title: s.name,
                description: s.description ? s.description.substring(0, 150) + '...' : '',
                link: `/scholarship/${s._id}` // Adjust link as needed
            }))
        ];

        res.render('search_results', { query, results });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
