const Career = require('../model/career');
const Skill = require('../model/Skill');
const { calculateTransitionScore, suggestPivotCareers } = require('./graphEngine');
const { analyzeSkillPriority } = require('./demandEngine');

/**
 * Pure Backend SaaS Career Roadmap Intelligence Engine
 */
class RoadmapEngine {

    /**
     * Generates a deterministic roadmap utilizing mathematical scoring and graph edge weights.
     * @param {Object} userProfile - The user's dynamic profile data.
     * @param {Object} career - The target Career document from MongoDB (Must be populated).
     */
    static async generate(userProfile, career) {
        userProfile = userProfile || {};

        const userSkillStrings = userProfile.skills || [];
        const userHours = userProfile.weekly_hours || 10;
        const userRisk = userProfile.risk_level || "Medium";

        // Query User Skills from DB to generate nodes
        const userSkillsDocs = await Skill.find({ name: { $in: userSkillStrings } });
        const userSkillIds = userSkillsDocs.map(s => s._id.toString());

        // 1. Skill Gap Analysis & Priority Scoring
        const reqSkills = career.required_skills || [];

        const already_have = [];
        const missing_req = [];

        reqSkills.forEach(reqSkill => {
            if (userSkillIds.includes(reqSkill._id.toString())) {
                already_have.push(reqSkill.name);
            } else {
                missing_req.push(reqSkill);
            }
        });

        const missing_high_priority = [];
        const missing_medium_priority = [];
        const missing_optional = [];

        // Apply Mathematical Engine Logic mapping constraints
        missing_req.forEach(skill => {
            const priorityInfo = analyzeSkillPriority(skill);
            const entry = {
                name: skill.name,
                category: skill.category,
                difficulty: skill.difficulty_level,
                demandScore: skill.demand_score,
                automationRisk: skill.automation_risk,
                priorityScore: priorityInfo.priorityScore,
                priorityLabel: priorityInfo.category
            };

            if (priorityInfo.category === 'Critical' || priorityInfo.category === 'High') {
                missing_high_priority.push(entry);
            } else if (priorityInfo.category === 'Medium') {
                missing_medium_priority.push(entry);
            } else {
                missing_optional.push(entry);
            }
        });

        // Dynamic Mathematical Sorting Descending
        missing_high_priority.sort((a, b) => b.priorityScore - a.priorityScore);
        missing_medium_priority.sort((a, b) => b.priorityScore - a.priorityScore);

        const skill_gap = {
            already_have,
            missing_high_priority,
            missing_medium_priority,
            advanced_optional: missing_optional
        };

        // 2. Ultra-Advanced Suitability Score based on Transition Formula
        let score = calculateTransitionScore(userSkillsDocs, career);

        // Adjust penalties via algorithmic constraints
        if ((career.automation_risk > 30 && userRisk === 'Low') || (career.automation_risk > 60 && userRisk === 'Medium')) {
            score -= 5;
        }

        const overall_suitability_score = Math.min(Math.max(Math.round(score), 0), 100);

        // 3. Timeline Estimator
        const baseMonths = career.base_duration_months || 6;
        let baseWeeks = baseMonths * 4.33;
        let adjustedWeeks = baseWeeks / (userHours / 10);

        if (userHours < 15) adjustedWeeks *= 1.20; // Structural logic buffer
        if (already_have.length < (reqSkills.length * 0.2)) adjustedWeeks *= 1.15;

        const estimated_total_weeks = Math.round(adjustedWeeks);

        // 4. Dynamic Deterministic Roadmap Routing using Difficulty Constraints
        const allMissingStr = [...missing_high_priority, ...missing_medium_priority, ...missing_optional];

        const p1Skills = allMissingStr.filter(s => s.difficulty <= 2).map(s => s.name);
        const p2Skills = allMissingStr.filter(s => s.difficulty === 3).map(s => s.name);
        const p3Skills = allMissingStr.filter(s => s.difficulty >= 4).map(s => s.name);

        const phases = career.roadmap_template.map(phase => {
            let totalBasePhaseWeeks = career.roadmap_template.reduce((sum, p) => sum + p.estimatedDurationWeeks, 0) || 1;
            let phaseWeight = phase.estimatedDurationWeeks / totalBasePhaseWeeks;
            let calcWeeks = Math.round(estimated_total_weeks * phaseWeight) || 1;

            let injectTopics = [];
            if (phase.phaseNumber === 1 || phase.phaseNumber === 2) {
                injectTopics = p1Skills.slice(0, 5);
            } else if (phase.phaseNumber === 3 || phase.phaseNumber === 4) {
                injectTopics = p2Skills.slice(0, 5);
            } else if (phase.phaseNumber >= 5) {
                injectTopics = p3Skills.slice(0, 5);
            }

            // Fallback injection if empty
            if (injectTopics.length === 0 && allMissingStr.length > 0) {
                injectTopics = [allMissingStr[0].name];
            }

            return {
                phaseNumber: phase.phaseNumber,
                phaseName: phase.phaseName,
                estimatedDurationWeeks: calcWeeks,
                topics: [...phase.topics, ...injectTopics.map(t => `Master ${t}`)],
                resources: [...phase.resources],
                projects: [...phase.projects]
            };
        });

        // 5. Cross-Career Graph Pivot Generation
        const backup_careers_nodes = await suggestPivotCareers(userSkillsDocs);

        const backup_careers = backup_careers_nodes.map(node => {
            return {
                title: node.careerTitle,
                why_recommended: `Ultra-high transition edge score derived from matching weights.`,
                skill_overlap_percentage: Math.round(node.transitionScore),
                transition_ease: node.transitionScore > 50 ? "Easy" : node.transitionScore > 30 ? "Medium" : "Hard"
            };
        });

        // 6. SaaS Overview
        const overview = {
            roleDescription: career.description.substring(0, 200) + "...",
            salaryRangeEntry: career.salary_range.entry || "N/A",
            salaryRangeMid: career.salary_range.mid || "N/A",
            salaryRangeSenior: career.salary_range.senior || "N/A",
            growthRate: career.growth_rate || "Stable",
            automationRisk: career.automation_risk || 0,
            suitabilityScore: overall_suitability_score
        };

        return {
            overview,
            skillGap: skill_gap,
            totalEstimatedWeeks: estimated_total_weeks,
            phases,
            backupCareers: backup_careers
        };
    }
}

module.exports = RoadmapEngine;
