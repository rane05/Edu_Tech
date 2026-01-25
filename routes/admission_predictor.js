const express = require('express');
const router = express.Router();
const AdmissionRecord = require('../model/AdmissionRecord');

// Render the Chance Predictor Page
router.get('/chance-predictor', (req, res) => {
    res.render('chance_predictor', { prediction: null });
});

// Calculate Admission Probability
router.post('/api/chance/predict', async (req, res) => {
    try {
        const { score, exam, board, stream, state } = req.body;

        const userScore = parseFloat(score);
        const userBoard = parseFloat(board);

        // Find similar profiles (+/- 10% range)
        const similarProfiles = await AdmissionRecord.find({
            exam: exam.toLowerCase(),
            stream: stream.toLowerCase(),
            score: { $gte: userScore - 20, $lte: userScore + 20 }
        });

        if (similarProfiles.length === 0) {
            return res.render('chance_predictor', {
                prediction: null,
                error: 'Not enough data for this specific combination. Try different values.'
            });
        }

        // Calculate Success Rate
        const admittedCount = similarProfiles.filter(p => p.admissionStatus === 'admitted').length;
        const totalCount = similarProfiles.length;
        const probability = ((admittedCount / totalCount) * 100).toFixed(1);

        // Find average score of those who got admitted
        const admittedProfiles = similarProfiles.filter(p => p.admissionStatus === 'admitted');
        const avgAdmittedScore = admittedProfiles.length > 0
            ? (admittedProfiles.reduce((acc, curr) => acc + curr.score, 0) / admittedProfiles.length).toFixed(1)
            : 'N/A';

        res.render('chance_predictor', {
            prediction: {
                probability,
                sampleSize: totalCount,
                avgAdmittedScore,
                userScore,
                exam: exam.toUpperCase(),
                verdict: probability > 70 ? 'High' : (probability > 40 ? 'Moderate' : 'Low')
            }
        });

    } catch (err) {
        console.error("Chance Prediction Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
