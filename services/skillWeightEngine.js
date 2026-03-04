/**
 * Ultra-Advanced Skill Weighting Engine
 * Normalizes metrics and calculates the FinalSkillWeight.
 */

// Normalizes a value from min-max to 0-10
const normalize = (value, min = 0, max = 100) => {
    return ((value - min) / (max - min)) * 10;
};

/**
 * Computes the FinalSkillWeight
 * (importance_weight × 0.30) + (normalized_demand × 0.20) + (future_growth_score_normalized × 0.15) + 
 * (transferability_score_normalized × 0.10) + (difficulty_adjustment × 0.10) + (automation_adjustment × 0.15)
 * @param {Object} skill - The skill document from MongoDB
 * @returns {Number} FinalSkillWeight between 0 and 10+
 */
const calculateFinalSkillWeight = (skill) => {
    const importance = skill.importance_weight; // Already 1-10
    const normDemand = normalize(skill.demand_score || 0);
    const normGrowth = normalize(skill.future_growth_score || 0);
    const normTransfer = normalize(skill.transferability_score || 0);

    const difficultyAdjustment = (6 - skill.difficulty_level); // Assuming difficulty is 1-5
    const automationAdjustment = (100 - skill.automation_risk) / 10;

    const finalWeight =
        (importance * 0.30) +
        (normDemand * 0.20) +
        (normGrowth * 0.15) +
        (normTransfer * 0.10) +
        (difficultyAdjustment * 0.10) +
        (automationAdjustment * 0.15);

    return parseFloat(finalWeight.toFixed(2));
};

module.exports = {
    normalize,
    calculateFinalSkillWeight
};
