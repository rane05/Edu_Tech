const express = require('express');
const router = express.Router();

// Route to render the Resume Builder UI
router.get('/resume-builder', (req, res) => {
    res.render('resume_builder', {
        user: req.user || { name: 'Guest' }
    });
});

// API Route to save resume (Optional - for logged-in users)
router.post('/api/resume/save', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        // TODO: Save resume data to user profile in MongoDB
        // For now, just return success
        res.json({ success: true, message: 'Resume saved successfully' });
    } catch (error) {
        console.error('Save Resume Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save resume' });
    }
});

// API Route to load resume (Optional - for logged-in users)
router.get('/api/resume/load', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        // TODO: Load resume data from user profile in MongoDB
        // For now, return empty data
        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Load Resume Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to load resume' });
    }
});

module.exports = router;
