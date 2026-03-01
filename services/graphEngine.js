/**
 * Multi-Career Cross-Skill Graph Model
 */
const Career = require('../model/career');
const { calculateFinalSkillWeight } = require('./skillWeightEngine');

/**
 * Calculates transition score between the user's current skills and a target career
 * TransitionScore = (Sum of weighted common skills) / (Sum of weighted required skills of target career) * 100
 * @param {Array} userSkills - Array of populated Skill documents the user possesses
 * @param {Object} targetCareer - Populated Career document
 */
const calculateTransitionScore = (userSkills, targetCareer) => {
    let sumWeightedCommonSkills = 0;
    let sumWeightedTargetSkills = 0;

    const userSkillIds = userSkills.map(s => s._id ? s._id.toString() : s.toString());

    // Evaluate required skills of target career
    if (!targetCareer.required_skills || targetCareer.required_skills.length === 0) return 0;

    for (const reqSkill of targetCareer.required_skills) {
        // Proceed only if reqSkill is actually populated with fields
        if (!reqSkill || !reqSkill.importance_weight) continue;

        const weight = calculateFinalSkillWeight(reqSkill);
        sumWeightedTargetSkills += weight;

        // If the user has this required skill
        if (userSkillIds.includes(reqSkill._id.toString())) {
            sumWeightedCommonSkills += weight;
        }
    }

    if (sumWeightedTargetSkills === 0) return 0;
    return parseFloat(((sumWeightedCommonSkills / sumWeightedTargetSkills) * 100).toFixed(2));
};

/**
 * Suggest Pivot Careers via Graph Traversal Logic
 * Gets user skills -> traverses to careers -> ranks by cumulative weighted edge strength
 */
const suggestPivotCareers = async (userSkills) => {
    // Traverse to all careers in the graph
    // Must be populated to compute the ultra-advanced transition score
    const allCareers = await Career.find().populate('required_skills');

    let transitionScores = [];

    for (const career of allCareers) {
        const score = calculateTransitionScore(userSkills, career);
        transitionScores.push({
            careerTitle: career.title,
            careerId: career._id,
            transitionScore: score
        });
    }

    // Sort descending by transition score
    transitionScores.sort((a, b) => b.transitionScore - a.transitionScore);

    // Return top 3 pivot careers (excluding if score is nearly 100%, indicating it's their current primary career)
    return transitionScores.filter(s => s.transitionScore < 99).slice(0, 3);
};

module.exports = {
    calculateTransitionScore,
    suggestPivotCareers
};
