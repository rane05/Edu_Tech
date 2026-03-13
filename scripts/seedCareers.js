const mongoose = require('mongoose');
require('dotenv').config();
const Career = require('../model/career');
const Skill = require('../model/Skill');

const skillsData = [
    { name: 'HTML', category: 'Frontend', importance_weight: 8, difficulty_level: 1, demand_score: 90, automation_risk: 10, transferability_score: 95, future_growth_score: 80 },
    { name: 'CSS', category: 'Frontend', importance_weight: 8, difficulty_level: 2, demand_score: 85, automation_risk: 15, transferability_score: 90, future_growth_score: 75 },
    { name: 'JavaScript', category: 'Frontend', importance_weight: 10, difficulty_level: 3, demand_score: 98, automation_risk: 5, transferability_score: 98, future_growth_score: 95 },
    { name: 'React', category: 'Frontend', importance_weight: 9, difficulty_level: 3, demand_score: 95, automation_risk: 10, transferability_score: 85, future_growth_score: 90 },
    { name: 'Node.js', category: 'Backend', importance_weight: 9, difficulty_level: 3, demand_score: 92, automation_risk: 10, transferability_score: 88, future_growth_score: 92 },
    { name: 'Express.js', category: 'Backend', importance_weight: 8, difficulty_level: 2, demand_score: 88, automation_risk: 10, transferability_score: 80, future_growth_score: 85 },
    { name: 'MongoDB', category: 'Database', importance_weight: 8, difficulty_level: 2, demand_score: 85, automation_risk: 15, transferability_score: 82, future_growth_score: 88 },
    { name: 'Python', category: 'Programming', importance_weight: 10, difficulty_level: 2, demand_score: 99, automation_risk: 5, transferability_score: 99, future_growth_score: 98 },
    { name: 'SQL', category: 'Database', importance_weight: 9, difficulty_level: 2, demand_score: 95, automation_risk: 10, transferability_score: 95, future_growth_score: 90 },
    { name: 'Machine Learning', category: 'AI', importance_weight: 10, difficulty_level: 4, demand_score: 96, automation_risk: 5, transferability_score: 85, future_growth_score: 99 }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing skills and careers
        await Skill.deleteMany({});
        await Career.deleteMany({});
        console.log('Cleared existing data');

        // Insert skills
        const createdSkills = await Skill.insertMany(skillsData);
        console.log(`Inserted ${createdSkills.length} skills`);

        const getSkillId = (name) => createdSkills.find(s => s.name === name)._id;

        // Insert Careers
        const careersData = [
            {
                title: 'Full Stack Developer',
                description: 'A Full Stack Developer handles both the frontend and backend of web applications, ensuring seamless integration and user experience.',
                salary_range: { entry: '₹5L - ₹8L', mid: '₹12L - ₹20L', senior: '₹25L+' },
                growth_rate: 'Very High',
                automation_risk: 10,
                base_duration_months: 6,
                required_skills: [getSkillId('HTML'), getSkillId('CSS'), getSkillId('JavaScript'), getSkillId('Node.js'), getSkillId('MongoDB')],
                optional_skills: [getSkillId('React'), getSkillId('Express.js')],
                roadmap_template: [
                    {
                        phaseNumber: 1,
                        phaseName: 'Frontend Fundamentals',
                        estimatedDurationWeeks: 4,
                        topics: ['HTML Semantic Tags', 'CSS Layouts (Flexbox/Grid)', 'Responsive Design'],
                        resources: ['MDN Web Docs', 'FreeCodeCamp'],
                        projects: [{ title: 'Personal Portfolio', objective: 'Build a static portfolio', skillsUsed: ['HTML', 'CSS'], difficulty: 'Beginner' }]
                    },
                    {
                        phaseNumber: 2,
                        phaseName: 'JavaScript Mastery',
                        estimatedDurationWeeks: 6,
                        topics: ['ES6+ Features', 'DOM Manipulation', 'Asynchronous JS'],
                        resources: ['Eloquent JavaScript', 'You Don\'t Know JS'],
                        projects: [{ title: 'Weather App', objective: 'Fetch data from API', skillsUsed: ['JavaScript'], difficulty: 'Intermediate' }]
                    },
                    {
                        phaseNumber: 3,
                        phaseName: 'Backend Development',
                        estimatedDurationWeeks: 8,
                        topics: ['Node.js Basics', 'Express.js Routing', 'RESTful APIs'],
                        resources: ['Node.js Docs', 'Express Guide'],
                        projects: [{ title: 'Task Manager API', objective: 'Create a CRUD API', skillsUsed: ['Node.js', 'Express.js'], difficulty: 'Intermediate' }]
                    },
                    {
                        phaseNumber: 4,
                        phaseName: 'Database & Integration',
                        estimatedDurationWeeks: 6,
                        topics: ['MongoDB Schema Design', 'Mongoose ODM', 'Frontend-Backend Connectivity'],
                        resources: ['MongoDB University'],
                        projects: [{ title: 'Blog Platform', objective: 'Full Stack CMS', skillsUsed: ['React', 'Node.js', 'MongoDB'], difficulty: 'Advanced' }]
                    }
                ]
            },
            {
                title: 'Data Scientist',
                description: 'Data Scientists use statistics, programming, and machine learning to analyze data and extract actionable insights.',
                salary_range: { entry: '₹6L - ₹10L', mid: '₹15L - ₹25L', senior: '₹35L+' },
                growth_rate: 'Exceptional',
                automation_risk: 15,
                base_duration_months: 8,
                required_skills: [getSkillId('Python'), getSkillId('SQL'), getSkillId('Machine Learning')],
                optional_skills: [getSkillId('JavaScript')],
                roadmap_template: [
                    {
                        phaseNumber: 1,
                        phaseName: 'Data Analysis Foundations',
                        estimatedDurationWeeks: 6,
                        topics: ['Python for Data Science', 'NumPy & Pandas', 'Matplotlib Visualization'],
                        resources: ['Kaggle Courses', 'Python for Data Analysis book'],
                        projects: [{ title: 'Sales Analysis', objective: 'Derive insights from sales data', skillsUsed: ['Python', 'Pandas'], difficulty: 'Beginner' }]
                    },
                    {
                        phaseNumber: 2,
                        phaseName: 'Statistical Modeling',
                        estimatedDurationWeeks: 6,
                        topics: ['Probability Distributions', 'Hypothesis Testing', 'Regression Analysis'],
                        resources: ['Khan Academy Stats', 'Inferential Statistics'],
                        projects: [{ title: 'Housing Price Predictor', objective: 'Linear Regression project', skillsUsed: ['Python', 'Stats'], difficulty: 'Intermediate' }]
                    },
                    {
                        phaseNumber: 3,
                        phaseName: 'Machine Learning Mastery',
                        estimatedDurationWeeks: 10,
                        topics: ['Supervised vs Unsupervised Learning', 'scikit-learn', 'Model Evaluation Metrics'],
                        resources: ['Coursera ML by Andrew Ng'],
                        projects: [{ title: 'Customer Churn Predictor', objective: 'Classification model', skillsUsed: ['Machine Learning', 'Python'], difficulty: 'Advanced' }]
                    }
                ]
            }
        ];

        await Career.insertMany(careersData);
        console.log(`Inserted ${careersData.length} careers`);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
