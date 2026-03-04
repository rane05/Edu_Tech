const mongoose = require('mongoose');
const Skill = require('./model/Skill');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutech', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Skill Seeding'))
    .catch(err => console.error(err));

const skillsData = [
    // Programming Languages
    { name: "JavaScript", category: "Programming Languages", importance_weight: 9, difficulty_level: 3, demand_score: 95, job_frequency: 98, salary_premium: 85, industry_growth: 90, scarcity_factor: 70, automation_risk: 20, transferability_score: 90, future_growth_score: 85 },
    { name: "Python", category: "Programming Languages", importance_weight: 9, difficulty_level: 2, demand_score: 98, job_frequency: 95, salary_premium: 90, industry_growth: 95, scarcity_factor: 80, automation_risk: 15, transferability_score: 95, future_growth_score: 95 },
    { name: "Java", category: "Programming Languages", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 90, salary_premium: 85, industry_growth: 70, scarcity_factor: 75, automation_risk: 30, transferability_score: 80, future_growth_score: 75 },
    { name: "C++", category: "Programming Languages", importance_weight: 8, difficulty_level: 5, demand_score: 80, job_frequency: 75, salary_premium: 95, industry_growth: 75, scarcity_factor: 90, automation_risk: 10, transferability_score: 85, future_growth_score: 80 },
    { name: "TypeScript", category: "Programming Languages", importance_weight: 8, difficulty_level: 3, demand_score: 90, job_frequency: 85, salary_premium: 90, industry_growth: 92, scarcity_factor: 70, automation_risk: 15, transferability_score: 90, future_growth_score: 92 },
    { name: "Go", category: "Programming Languages", importance_weight: 7, difficulty_level: 3, demand_score: 85, job_frequency: 70, salary_premium: 95, industry_growth: 88, scarcity_factor: 85, automation_risk: 20, transferability_score: 80, future_growth_score: 85 },

    // Frontend Development
    { name: "HTML5", category: "Frontend Development", importance_weight: 10, difficulty_level: 1, demand_score: 90, job_frequency: 98, salary_premium: 60, industry_growth: 70, scarcity_factor: 50, automation_risk: 60, transferability_score: 85, future_growth_score: 70 },
    { name: "CSS3", category: "Frontend Development", importance_weight: 9, difficulty_level: 2, demand_score: 90, job_frequency: 95, salary_premium: 65, industry_growth: 75, scarcity_factor: 55, automation_risk: 50, transferability_score: 80, future_growth_score: 75 },
    { name: "React", category: "Frontend Development", importance_weight: 9, difficulty_level: 3, demand_score: 95, job_frequency: 92, salary_premium: 85, industry_growth: 88, scarcity_factor: 70, automation_risk: 25, transferability_score: 85, future_growth_score: 88 },
    { name: "Vue.js", category: "Frontend Development", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 70, salary_premium: 80, industry_growth: 75, scarcity_factor: 75, automation_risk: 30, transferability_score: 80, future_growth_score: 75 },
    { name: "Angular", category: "Frontend Development", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 80, salary_premium: 85, industry_growth: 70, scarcity_factor: 75, automation_risk: 25, transferability_score: 75, future_growth_score: 70 },
    { name: "Tailwind CSS", category: "Frontend Development", importance_weight: 7, difficulty_level: 2, demand_score: 85, job_frequency: 75, salary_premium: 75, industry_growth: 90, scarcity_factor: 60, automation_risk: 40, transferability_score: 70, future_growth_score: 85 },

    // Backend Development
    { name: "Node.js", category: "Backend Development", importance_weight: 9, difficulty_level: 3, demand_score: 92, job_frequency: 88, salary_premium: 85, industry_growth: 85, scarcity_factor: 70, automation_risk: 25, transferability_score: 85, future_growth_score: 85 },
    { name: "Express.js", category: "Backend Development", importance_weight: 8, difficulty_level: 2, demand_score: 88, job_frequency: 85, salary_premium: 80, industry_growth: 80, scarcity_factor: 60, automation_risk: 35, transferability_score: 85, future_growth_score: 80 },
    { name: "Django", category: "Backend Development", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 75, salary_premium: 85, industry_growth: 80, scarcity_factor: 75, automation_risk: 20, transferability_score: 80, future_growth_score: 80 },
    { name: "Spring Boot", category: "Backend Development", importance_weight: 9, difficulty_level: 4, demand_score: 88, job_frequency: 85, salary_premium: 90, industry_growth: 75, scarcity_factor: 80, automation_risk: 25, transferability_score: 75, future_growth_score: 75 },
    { name: "FastAPI", category: "Backend Development", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 60, salary_premium: 85, industry_growth: 90, scarcity_factor: 80, automation_risk: 20, transferability_score: 75, future_growth_score: 88 },
    { name: "Ruby on Rails", category: "Backend Development", importance_weight: 6, difficulty_level: 3, demand_score: 70, job_frequency: 60, salary_premium: 80, industry_growth: 60, scarcity_factor: 70, automation_risk: 30, transferability_score: 65, future_growth_score: 60 },

    // Databases
    { name: "SQL", category: "Databases", importance_weight: 10, difficulty_level: 3, demand_score: 95, job_frequency: 95, salary_premium: 80, industry_growth: 80, scarcity_factor: 60, automation_risk: 20, transferability_score: 95, future_growth_score: 80 },
    { name: "PostgreSQL", category: "Databases", importance_weight: 9, difficulty_level: 3, demand_score: 90, job_frequency: 85, salary_premium: 85, industry_growth: 88, scarcity_factor: 70, automation_risk: 20, transferability_score: 90, future_growth_score: 88 },
    { name: "MongoDB", category: "Databases", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 80, salary_premium: 80, industry_growth: 85, scarcity_factor: 65, automation_risk: 25, transferability_score: 80, future_growth_score: 85 },
    { name: "Redis", category: "Databases", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 70, salary_premium: 85, industry_growth: 80, scarcity_factor: 75, automation_risk: 25, transferability_score: 75, future_growth_score: 80 },
    { name: "Elasticsearch", category: "Databases", importance_weight: 7, difficulty_level: 4, demand_score: 75, job_frequency: 60, salary_premium: 90, industry_growth: 75, scarcity_factor: 85, automation_risk: 20, transferability_score: 70, future_growth_score: 75 },

    // DevOps & Cloud
    { name: "Docker", category: "DevOps & Cloud", importance_weight: 9, difficulty_level: 3, demand_score: 92, job_frequency: 88, salary_premium: 88, industry_growth: 90, scarcity_factor: 75, automation_risk: 20, transferability_score: 90, future_growth_score: 90 },
    { name: "Kubernetes", category: "DevOps & Cloud", importance_weight: 9, difficulty_level: 5, demand_score: 90, job_frequency: 80, salary_premium: 95, industry_growth: 92, scarcity_factor: 85, automation_risk: 15, transferability_score: 85, future_growth_score: 92 },
    { name: "AWS Basics", category: "DevOps & Cloud", importance_weight: 9, difficulty_level: 3, demand_score: 92, job_frequency: 90, salary_premium: 85, industry_growth: 85, scarcity_factor: 70, automation_risk: 25, transferability_score: 85, future_growth_score: 85 },
    { name: "Linux Administration", category: "DevOps & Cloud", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 80, salary_premium: 80, industry_growth: 75, scarcity_factor: 75, automation_risk: 30, transferability_score: 85, future_growth_score: 75 },
    { name: "Terraform", category: "DevOps & Cloud", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 70, salary_premium: 95, industry_growth: 88, scarcity_factor: 85, automation_risk: 20, transferability_score: 80, future_growth_score: 88 },
    { name: "CI/CD Pipelines", category: "DevOps & Cloud", importance_weight: 9, difficulty_level: 3, demand_score: 88, job_frequency: 85, salary_premium: 85, industry_growth: 85, scarcity_factor: 75, automation_risk: 25, transferability_score: 85, future_growth_score: 85 },

    // Core Computer Science
    { name: "Data Structures", category: "Core Computer Science", importance_weight: 10, difficulty_level: 4, demand_score: 90, job_frequency: 95, salary_premium: 85, industry_growth: 70, scarcity_factor: 60, automation_risk: 20, transferability_score: 100, future_growth_score: 70 },
    { name: "Algorithms", category: "Core Computer Science", importance_weight: 10, difficulty_level: 5, demand_score: 90, job_frequency: 95, salary_premium: 90, industry_growth: 70, scarcity_factor: 70, automation_risk: 15, transferability_score: 100, future_growth_score: 70 },
    { name: "System Design", category: "Core Computer Science", importance_weight: 10, difficulty_level: 5, demand_score: 95, job_frequency: 85, salary_premium: 100, industry_growth: 85, scarcity_factor: 90, automation_risk: 10, transferability_score: 95, future_growth_score: 90 },
    { name: "Design Patterns", category: "Core Computer Science", importance_weight: 8, difficulty_level: 4, demand_score: 80, job_frequency: 75, salary_premium: 85, industry_growth: 75, scarcity_factor: 70, automation_risk: 25, transferability_score: 90, future_growth_score: 75 },
    { name: "Computer Networking", category: "Core Computer Science", importance_weight: 8, difficulty_level: 4, demand_score: 80, job_frequency: 70, salary_premium: 80, industry_growth: 70, scarcity_factor: 65, automation_risk: 30, transferability_score: 85, future_growth_score: 70 },

    // Security
    { name: "Authentication (JWT)", category: "Security", importance_weight: 9, difficulty_level: 3, demand_score: 88, job_frequency: 85, salary_premium: 85, industry_growth: 80, scarcity_factor: 70, automation_risk: 25, transferability_score: 80, future_growth_score: 80 },
    { name: "OAuth", category: "Security", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 80, salary_premium: 85, industry_growth: 80, scarcity_factor: 70, automation_risk: 25, transferability_score: 80, future_growth_score: 80 },
    { name: "Penetration Testing", category: "Security", importance_weight: 8, difficulty_level: 5, demand_score: 85, job_frequency: 60, salary_premium: 95, industry_growth: 90, scarcity_factor: 85, automation_risk: 15, transferability_score: 75, future_growth_score: 90 },
    { name: "Cryptography basics", category: "Security", importance_weight: 7, difficulty_level: 4, demand_score: 75, job_frequency: 50, salary_premium: 90, industry_growth: 80, scarcity_factor: 80, automation_risk: 20, transferability_score: 85, future_growth_score: 80 },
    { name: "Web Application Security", category: "Security", importance_weight: 9, difficulty_level: 4, demand_score: 90, job_frequency: 80, salary_premium: 90, industry_growth: 85, scarcity_factor: 80, automation_risk: 20, transferability_score: 85, future_growth_score: 85 },

    // Testing & QA
    { name: "Unit Testing", category: "Testing & QA", importance_weight: 9, difficulty_level: 3, demand_score: 85, job_frequency: 90, salary_premium: 75, industry_growth: 75, scarcity_factor: 60, automation_risk: 40, transferability_score: 85, future_growth_score: 75 },
    { name: "Integration Testing", category: "Testing & QA", importance_weight: 8, difficulty_level: 3, demand_score: 80, job_frequency: 85, salary_premium: 80, industry_growth: 75, scarcity_factor: 65, automation_risk: 35, transferability_score: 85, future_growth_score: 75 },
    { name: "End-to-End Testing (Cypress/Selenium)", category: "Testing & QA", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 80, salary_premium: 85, industry_growth: 80, scarcity_factor: 70, automation_risk: 30, transferability_score: 80, future_growth_score: 80 },
    { name: "Test-Driven Development (TDD)", category: "Testing & QA", importance_weight: 7, difficulty_level: 4, demand_score: 75, job_frequency: 60, salary_premium: 85, industry_growth: 75, scarcity_factor: 80, automation_risk: 25, transferability_score: 90, future_growth_score: 75 },
    { name: "API Testing (Postman/Jest)", category: "Testing & QA", importance_weight: 8, difficulty_level: 2, demand_score: 85, job_frequency: 85, salary_premium: 75, industry_growth: 80, scarcity_factor: 60, automation_risk: 35, transferability_score: 80, future_growth_score: 80 },

    // Performance Optimization
    { name: "Web Performance Opt", category: "Performance Optimization", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 70, salary_premium: 90, industry_growth: 80, scarcity_factor: 80, automation_risk: 25, transferability_score: 80, future_growth_score: 80 },
    { name: "Database Query Tuning", category: "Performance Optimization", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 75, salary_premium: 90, industry_growth: 80, scarcity_factor: 80, automation_risk: 20, transferability_score: 85, future_growth_score: 80 },
    { name: "Caching (Redis/Memcached)", category: "Performance Optimization", importance_weight: 8, difficulty_level: 3, demand_score: 80, job_frequency: 75, salary_premium: 85, industry_growth: 80, scarcity_factor: 70, automation_risk: 20, transferability_score: 80, future_growth_score: 80 },
    { name: "Load Balancing", category: "Performance Optimization", importance_weight: 7, difficulty_level: 3, demand_score: 75, job_frequency: 60, salary_premium: 85, industry_growth: 75, scarcity_factor: 75, automation_risk: 30, transferability_score: 80, future_growth_score: 75 },
    { name: "Profiling Tools", category: "Performance Optimization", importance_weight: 6, difficulty_level: 4, demand_score: 70, job_frequency: 50, salary_premium: 85, industry_growth: 70, scarcity_factor: 85, automation_risk: 25, transferability_score: 75, future_growth_score: 70 },

    // AI & Data
    { name: "Machine Learning Concepts", category: "AI & Data", importance_weight: 9, difficulty_level: 4, demand_score: 95, job_frequency: 80, salary_premium: 95, industry_growth: 100, scarcity_factor: 85, automation_risk: 10, transferability_score: 85, future_growth_score: 100 },
    { name: "Deep Learning (PyTorch/TF)", category: "AI & Data", importance_weight: 8, difficulty_level: 5, demand_score: 90, job_frequency: 70, salary_premium: 100, industry_growth: 95, scarcity_factor: 90, automation_risk: 5, transferability_score: 80, future_growth_score: 95 },
    { name: "Data Manipulation (Pandas)", category: "AI & Data", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 80, salary_premium: 85, industry_growth: 85, scarcity_factor: 70, automation_risk: 30, transferability_score: 85, future_growth_score: 85 },
    { name: "LLM Prompt Engineering", category: "AI & Data", importance_weight: 7, difficulty_level: 2, demand_score: 90, job_frequency: 75, salary_premium: 80, industry_growth: 100, scarcity_factor: 60, automation_risk: 40, transferability_score: 75, future_growth_score: 100 },
    { name: "RAG Architecture", category: "AI & Data", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 60, salary_premium: 95, industry_growth: 100, scarcity_factor: 85, automation_risk: 15, transferability_score: 75, future_growth_score: 100 },
    { name: "Vector Databases", category: "AI & Data", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 50, salary_premium: 90, industry_growth: 95, scarcity_factor: 80, automation_risk: 20, transferability_score: 80, future_growth_score: 95 },

    // Mobile Development
    { name: "React Native", category: "Mobile Development", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 80, salary_premium: 85, industry_growth: 80, scarcity_factor: 70, automation_risk: 25, transferability_score: 85, future_growth_score: 80 },
    { name: "Flutter", category: "Mobile Development", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 75, salary_premium: 85, industry_growth: 85, scarcity_factor: 75, automation_risk: 25, transferability_score: 80, future_growth_score: 85 },
    { name: "Swift (iOS)", category: "Mobile Development", importance_weight: 8, difficulty_level: 4, demand_score: 80, job_frequency: 70, salary_premium: 90, industry_growth: 75, scarcity_factor: 80, automation_risk: 20, transferability_score: 75, future_growth_score: 75 },
    { name: "Kotlin (Android)", category: "Mobile Development", importance_weight: 8, difficulty_level: 4, demand_score: 80, job_frequency: 75, salary_premium: 85, industry_growth: 80, scarcity_factor: 75, automation_risk: 20, transferability_score: 75, future_growth_score: 80 },
    { name: "Mobile UI/UX", category: "Mobile Development", importance_weight: 7, difficulty_level: 3, demand_score: 75, job_frequency: 60, salary_premium: 80, industry_growth: 75, scarcity_factor: 70, automation_risk: 35, transferability_score: 85, future_growth_score: 75 },

    // Soft Technical Skills
    { name: "Agile/Scrum", category: "Soft Technical Skills", importance_weight: 8, difficulty_level: 2, demand_score: 90, job_frequency: 95, salary_premium: 70, industry_growth: 75, scarcity_factor: 50, automation_risk: 10, transferability_score: 100, future_growth_score: 75 },
    { name: "Git Workflow", category: "Soft Technical Skills", importance_weight: 10, difficulty_level: 2, demand_score: 95, job_frequency: 98, salary_premium: 65, industry_growth: 80, scarcity_factor: 50, automation_risk: 40, transferability_score: 100, future_growth_score: 80 },
    { name: "Code Review", category: "Soft Technical Skills", importance_weight: 8, difficulty_level: 3, demand_score: 85, job_frequency: 85, salary_premium: 80, industry_growth: 80, scarcity_factor: 65, automation_risk: 30, transferability_score: 100, future_growth_score: 80 },
    { name: "Technical Writing", category: "Soft Technical Skills", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 70, salary_premium: 75, industry_growth: 75, scarcity_factor: 70, automation_risk: 50, transferability_score: 100, future_growth_score: 75 },
    { name: "Mentoring", category: "Soft Technical Skills", importance_weight: 7, difficulty_level: 4, demand_score: 75, job_frequency: 60, salary_premium: 85, industry_growth: 70, scarcity_factor: 80, automation_risk: 5, transferability_score: 100, future_growth_score: 70 },

    // Advanced Architecture
    { name: "Microservices", category: "Advanced Architecture", importance_weight: 9, difficulty_level: 5, demand_score: 90, job_frequency: 75, salary_premium: 95, industry_growth: 85, scarcity_factor: 85, automation_risk: 15, transferability_score: 90, future_growth_score: 85 },
    { name: "Event-Driven Architecture", category: "Advanced Architecture", importance_weight: 8, difficulty_level: 5, demand_score: 85, job_frequency: 65, salary_premium: 95, industry_growth: 85, scarcity_factor: 85, automation_risk: 15, transferability_score: 90, future_growth_score: 85 },
    { name: "GraphQL", category: "Advanced Architecture", importance_weight: 7, difficulty_level: 3, demand_score: 80, job_frequency: 60, salary_premium: 85, industry_growth: 80, scarcity_factor: 75, automation_risk: 25, transferability_score: 80, future_growth_score: 80 },
    { name: "Serverless Computing", category: "Advanced Architecture", importance_weight: 8, difficulty_level: 4, demand_score: 85, job_frequency: 65, salary_premium: 90, industry_growth: 90, scarcity_factor: 80, automation_risk: 20, transferability_score: 85, future_growth_score: 90 }
];

const seedDB = async () => {
    try {
        await Skill.deleteMany({});
        console.log("Cleared existing Skills.");
        await Skill.insertMany(skillsData);
        console.log(`Successfully seeded ${skillsData.length} highly structured Math-based Skills.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
