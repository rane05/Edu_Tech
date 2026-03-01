/**
 * Demand-Based Skill Prioritization Engine
 */

const { calculateFinalSkillWeight } = require('./skillWeightEngine');

/**
 * Computes Dynamic Demand Index
 * DemandIndex = (JobFrequency × 0.35) + (SalaryPremium × 0.25) + (IndustryGrowth × 0.20) + (ScarcityFactor × 0.20)
 */
const calculateDemandIndex = (skill) => {
    // If these fields exist directly on the skill object (e.g if derived dynamically), use them
    // Otherwise fallback to precomputed DB demand_score
    if (skill.job_frequency !== undefined) {
        const index = (skill.job_frequency * 0.35) +
            (skill.salary_premium * 0.25) +
            (skill.industry_growth * 0.20) +
            (skill.scarcity_factor * 0.20);
        return index;
    }
    return skill.demand_score || 0;
};

/**
 * PriorityScore Formula
 * PriorityScore = FinalSkillWeight * (DemandIndex / 100)
 */
const calculatePriorityScore = (skill) => {
    const finalWeight = calculateFinalSkillWeight(skill);
    const demandIndex = calculateDemandIndex(skill);
    return parseFloat((finalWeight * (demandIndex / 100)).toFixed(2));
};

/**
 * Categorize Priority Score
 * ≥ 8 → Critical, 5–8 → High, 3–5 → Medium, < 3 → Optional
 */
const categorizePriority = (priorityScore) => {
    if (priorityScore >= 8) return 'Critical';
    if (priorityScore >= 5) return 'High';
    if (priorityScore >= 3) return 'Medium';
    return 'Optional';
};

/**
 * Full Analysis Wrapper
 */
const analyzeSkillPriority = (skill) => {
    const priorityScore = calculatePriorityScore(skill);
    return {
        priorityScore,
        category: categorizePriority(priorityScore),
        demandIndex: calculateDemandIndex(skill)
    };
};

module.exports = {
    calculateDemandIndex,
    calculatePriorityScore,
    categorizePriority,
    analyzeSkillPriority
};
