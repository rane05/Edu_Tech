const mongoose = require('mongoose');
require('dotenv').config();
const Career = require('../model/career');
const Skill = require('../model/Skill');

const skillsData = [
    // Web & Languages
    { name: 'HTML', category: 'Frontend', importance_weight: 8, difficulty_level: 1, demand_score: 90, automation_risk: 10, transferability_score: 95, future_growth_score: 80 },
    { name: 'CSS', category: 'Frontend', importance_weight: 8, difficulty_level: 2, demand_score: 85, automation_risk: 15, transferability_score: 90, future_growth_score: 75 },
    { name: 'JavaScript', category: 'Programming', importance_weight: 10, difficulty_level: 3, demand_score: 98, automation_risk: 5, transferability_score: 98, future_growth_score: 95 },
    { name: 'TypeScript', category: 'Programming', importance_weight: 9, difficulty_level: 3, demand_score: 95, automation_risk: 5, transferability_score: 95, future_growth_score: 98 },
    { name: 'React', category: 'Frontend', importance_weight: 9, difficulty_level: 3, demand_score: 95, automation_risk: 10, transferability_score: 85, future_growth_score: 90 },
    { name: 'Node.js', category: 'Backend', importance_weight: 9, difficulty_level: 3, demand_score: 92, automation_risk: 10, transferability_score: 88, future_growth_score: 92 },
    { name: 'Python', category: 'Programming', importance_weight: 10, difficulty_level: 2, demand_score: 99, automation_risk: 5, transferability_score: 99, future_growth_score: 98 },
    { name: 'Java', category: 'Programming', importance_weight: 9, difficulty_level: 4, demand_score: 94, automation_risk: 10, transferability_score: 90, future_growth_score: 85 },
    { name: 'C++', category: 'Programming', importance_weight: 9, difficulty_level: 5, demand_score: 92, automation_risk: 5, transferability_score: 92, future_growth_score: 88 },
    { name: 'C#', category: 'Programming', importance_weight: 8, difficulty_level: 3, demand_score: 90, automation_risk: 10, transferability_score: 85, future_growth_score: 85 },
    { name: 'Go', category: 'Programming', importance_weight: 8, difficulty_level: 4, demand_score: 88, automation_risk: 5, transferability_score: 88, future_growth_score: 95 },
    { name: 'Rust', category: 'Programming', importance_weight: 7, difficulty_level: 5, demand_score: 85, automation_risk: 5, transferability_score: 85, future_growth_score: 99 },
    { name: 'Swift', category: 'Mobile', importance_weight: 8, difficulty_level: 4, demand_score: 88, automation_risk: 10, transferability_score: 70, future_growth_score: 88 },
    { name: 'Kotlin', category: 'Mobile', importance_weight: 8, difficulty_level: 3, demand_score: 90, automation_risk: 10, transferability_score: 75, future_growth_score: 90 },
    { name: 'Dart', category: 'Mobile', importance_weight: 7, difficulty_level: 3, demand_score: 85, automation_risk: 10, transferability_score: 70, future_growth_score: 92 },

    // Data & AI
    { name: 'SQL', category: 'Data', importance_weight: 10, difficulty_level: 2, demand_score: 96, automation_risk: 10, transferability_score: 98, future_growth_score: 92 },
    { name: 'Machine Learning', category: 'AI', importance_weight: 10, difficulty_level: 4, demand_score: 97, automation_risk: 5, transferability_score: 85, future_growth_score: 99 },
    { name: 'Deep Learning', category: 'AI', importance_weight: 9, difficulty_level: 5, demand_score: 95, automation_risk: 5, transferability_score: 80, future_growth_score: 99 },
    { name: 'TensorFlow', category: 'AI', importance_weight: 8, difficulty_level: 4, demand_score: 90, automation_risk: 5, transferability_score: 75, future_growth_score: 92 },
    { name: 'Tableau', category: 'Data', importance_weight: 8, difficulty_level: 2, demand_score: 88, automation_risk: 20, transferability_score: 80, future_growth_score: 85 },
    { name: 'Power BI', category: 'Data', importance_weight: 8, difficulty_level: 2, demand_score: 90, automation_risk: 15, transferability_score: 80, future_growth_score: 88 },
    { name: 'Apache Spark', category: 'Data', importance_weight: 9, difficulty_level: 4, demand_score: 92, automation_risk: 10, transferability_score: 82, future_growth_score: 95 },

    // DevOps & Cloud
    { name: 'Docker', category: 'DevOps', importance_weight: 9, difficulty_level: 3, demand_score: 95, automation_risk: 5, transferability_score: 90, future_growth_score: 96 },
    { name: 'Kubernetes', category: 'DevOps', importance_weight: 10, difficulty_level: 5, demand_score: 97, automation_risk: 5, transferability_score: 88, future_growth_score: 98 },
    { name: 'AWS', category: 'Cloud', importance_weight: 10, difficulty_level: 4, demand_score: 98, automation_risk: 5, transferability_score: 85, future_growth_score: 98 },
    { name: 'Azure', category: 'Cloud', importance_weight: 9, difficulty_level: 4, demand_score: 95, automation_risk: 5, transferability_score: 82, future_growth_score: 96 },
    { name: 'Terraform', category: 'DevOps', importance_weight: 8, difficulty_level: 4, demand_score: 92, automation_risk: 5, transferability_score: 85, future_growth_score: 95 },
    { name: 'Jenkins', category: 'DevOps', importance_weight: 8, difficulty_level: 3, demand_score: 88, automation_risk: 10, transferability_score: 80, future_growth_score: 80 },

    // Design
    { name: 'Figma', category: 'Design', importance_weight: 10, difficulty_level: 2, demand_score: 96, automation_risk: 15, transferability_score: 85, future_growth_score: 95 },
    { name: 'Adobe XD', category: 'Design', importance_weight: 7, difficulty_level: 2, demand_score: 75, automation_risk: 20, transferability_score: 80, future_growth_score: 70 },
    { name: 'Photoshop', category: 'Design', importance_weight: 8, difficulty_level: 3, demand_score: 85, automation_risk: 25, transferability_score: 85, future_growth_score: 75 },

    // Security
    { name: 'Ethical Hacking', category: 'Security', importance_weight: 9, difficulty_level: 4, demand_score: 95, automation_risk: 5, transferability_score: 85, future_growth_score: 98 },
    { name: 'Network Security', category: 'Security', importance_weight: 9, difficulty_level: 4, demand_score: 96, automation_risk: 5, transferability_score: 88, future_growth_score: 97 },

    // Other
    { name: 'Solidity', category: 'Blockchain', importance_weight: 7, difficulty_level: 4, demand_score: 85, automation_risk: 5, transferability_score: 60, future_growth_score: 95 },
    { name: 'Unit Testing', category: 'QA', importance_weight: 8, difficulty_level: 2, demand_score: 90, automation_risk: 10, transferability_score: 95, future_growth_score: 90 },
    { name: 'SEO', category: 'Marketing', importance_weight: 8, difficulty_level: 2, demand_score: 88, automation_risk: 30, transferability_score: 80, future_growth_score: 85 },
    { name: 'Content Writing', category: 'Marketing', importance_weight: 7, difficulty_level: 2, demand_score: 82, automation_risk: 40, transferability_score: 85, future_growth_score: 80 }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Skill.deleteMany({});
        await Career.deleteMany({});
        console.log('Cleared existing skills and careers');

        const createdSkills = await Skill.insertMany(skillsData);
        console.log(`Inserted ${createdSkills.length} skills`);

        const getSkillId = (name) => {
            const skill = createdSkills.find(s => s.name === name);
            return skill ? skill._id : null;
        };

        const careersData = [
            {
                title: 'Full Stack Developer',
                description: 'Build end-to-end web applications using modern technologies.',
                salary_range: { entry: '₹5L - ₹8L', mid: '₹12L - ₹20L', senior: '₹25L+' },
                growth_rate: 'Very High', automation_risk: 10, base_duration_months: 6,
                required_skills: [getSkillId('HTML'), getSkillId('CSS'), getSkillId('JavaScript'), getSkillId('Node.js')],
                optional_skills: [getSkillId('React'), getSkillId('TypeScript')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Frontend Fundamentals', estimatedDurationWeeks: 4, topics: ['Advanced CSS', 'JavaScript Closures', 'DOM Manipulation'], resources: ['MDN'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Backend & APIs', estimatedDurationWeeks: 6, topics: ['Express.js', 'Mongoose', 'JWT Auth'], resources: ['NodeDocs'], projects: [] }
                ]
            },
            {
                title: 'Data Scientist',
                description: 'Analyze complex data sets to guide business decisions.',
                salary_range: { entry: '₹6L - ₹10L', mid: '₹15L - ₹25L', senior: '₹40L+' },
                growth_rate: 'Exponential', automation_risk: 15, base_duration_months: 8,
                required_skills: [getSkillId('Python'), getSkillId('SQL'), getSkillId('Machine Learning')],
                optional_skills: [getSkillId('Tableau'), getSkillId('Deep Learning')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Stats & Math', estimatedDurationWeeks: 6, topics: ['Probability', 'Linear Algebra'], resources: ['Khan Academy'], projects: [] },
                    { phaseNumber: 2, phaseName: 'ML Algorithms', estimatedDurationWeeks: 10, topics: ['Regression', 'Clustering'], resources: ['Scikit-learn'], projects: [] }
                ]
            },
            {
                title: 'DevOps Engineer',
                description: 'Bridge the gap between development and operations for faster shipping.',
                salary_range: { entry: '₹6L - ₹9L', mid: '₹18L - ₹30L', senior: '₹45L+' },
                growth_rate: 'Very High', automation_risk: 5, base_duration_months: 7,
                required_skills: [getSkillId('Docker'), getSkillId('Kubernetes'), getSkillId('AWS'), getSkillId('Linux')],
                optional_skills: [getSkillId('Terraform'), getSkillId('Jenkins')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Containers & Orchestration', estimatedDurationWeeks: 8, topics: ['Docker Hub', 'Pods', 'Services'], resources: ['K8s Docs'], projects: [] },
                    { phaseNumber: 2, phaseName: 'CI/CD Pipelines', estimatedDurationWeeks: 6, topics: ['GitHub Actions', 'Jenkinsfiles'], resources: ['Cloud Academy'], projects: [] }
                ]
            },
            {
                title: 'UI/UX Designer',
                description: 'Design beautiful and user-friendly digital products.',
                salary_range: { entry: '₹4L - ₹7L', mid: '₹10L - ₹18L', senior: '₹25L+' },
                growth_rate: 'High', automation_risk: 20, base_duration_months: 5,
                required_skills: [getSkillId('Figma'), getSkillId('Photoshop'), getSkillId('Adobe XD')],
                optional_skills: [getSkillId('CSS'), getSkillId('HTML')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Design Systems', estimatedDurationWeeks: 4, topics: ['Typography', 'Color Theory', 'Grid Systems'], resources: ['Google Design'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Prototyping', estimatedDurationWeeks: 6, topics: ['Interactions', 'User Testing'], resources: ['Nielsen Norman'], projects: [] }
                ]
            },
            {
                title: 'Cyber Security Analyst',
                description: 'Protect organizations from digital threats and hacking.',
                salary_range: { entry: '₹5L - ₹8L', mid: '₹15L - ₹25L', senior: '₹35L+' },
                growth_rate: 'Critical', automation_risk: 5, base_duration_months: 9,
                required_skills: [getSkillId('Ethical Hacking'), getSkillId('Network Security'), getSkillId('Linux')],
                optional_skills: [getSkillId('Python'), getSkillId('Go')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Network Defense', estimatedDurationWeeks: 6, topics: ['Firewalls', 'VPNs', 'IDS/IPS'], resources: ['Cisco'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Penetration Testing', estimatedDurationWeeks: 10, topics: ['Web Vulnerabilities', 'Burp Suite'], resources: ['TryHackMe'], projects: [] }
                ]
            },
            {
                title: 'Cloud Architect',
                description: 'Engineer scalable cloud infrastructure for enterprises.',
                salary_range: { entry: '₹8L - ₹12L', mid: '₹25L - ₹40L', senior: '₹60L+' },
                growth_rate: 'Very High', automation_risk: 5, base_duration_months: 10,
                required_skills: [getSkillId('AWS'), getSkillId('Azure'), getSkillId('Terraform')],
                optional_skills: [getSkillId('Docker'), getSkillId('Python')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Virtual Private Cloud', estimatedDurationWeeks: 6, topics: ['Subnets', 'Gateways'], resources: ['AWS Training'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Serverless Architecture', estimatedDurationWeeks: 8, topics: ['Lambda', 'EventBridge'], resources: ['CloudGuru'], projects: [] }
                ]
            },
            {
                title: 'AI Engineer',
                description: 'Build intelligent systems powered by LLMs and Deep Learning.',
                salary_range: { entry: '₹10L - ₹15L', mid: '₹30L - ₹50L', senior: '₹80L+' },
                growth_rate: 'Skyrocketing', automation_risk: 5, base_duration_months: 12,
                required_skills: [getSkillId('Machine Learning'), getSkillId('Deep Learning'), getSkillId('Python'), getSkillId('TensorFlow')],
                optional_skills: [getSkillId('Go'), getSkillId('C++')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Natural Language Processing', estimatedDurationWeeks: 8, topics: ['Transformers', 'Attention Mechanism'], resources: ['Stanford CS224N'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Generative AI', estimatedDurationWeeks: 10, topics: ['Stable Diffusion', 'Fine-tuning LLMs'], resources: ['OpenAI'], projects: [] }
                ]
            },
            {
                title: 'Mobile App Developer',
                description: 'Develop cross-platform or native mobile applications.',
                salary_range: { entry: '₹4L - ₹7L', mid: '₹12L - ₹22L', senior: '₹30L+' },
                growth_rate: 'High', automation_risk: 15, base_duration_months: 6,
                required_skills: [getSkillId('React'), getSkillId('Dart'), getSkillId('Kotlin')],
                optional_skills: [getSkillId('Swift'), getSkillId('JavaScript')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'State Management', estimatedDurationWeeks: 6, topics: ['Redux', 'Riverpod', 'Context API'], resources: ['Flutter Docs'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Native Integrations', estimatedDurationWeeks: 6, topics: ['Camera API', 'Biometrics'], resources: ['React Native Express'], projects: [] }
                ]
            },
            {
                title: 'Blockchain Developer',
                description: 'Develop decentralized applications and smart contracts.',
                salary_range: { entry: '₹8L - ₹14L', mid: '₹25L - ₹45L', senior: '₹55L+' },
                growth_rate: 'High', automation_risk: 5, base_duration_months: 8,
                required_skills: [getSkillId('Solidity'), getSkillId('JavaScript'), getSkillId('TypeScript')],
                optional_skills: [getSkillId('Rust'), getSkillId('Go')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Smart Contract Security', estimatedDurationWeeks: 6, topics: ['Reentrancy', 'Gas Optimization'], resources: ['Ethereum.org'], projects: [] },
                    { phaseNumber: 2, phaseName: 'DApp Integration', estimatedDurationWeeks: 8, topics: ['Web3.js', 'Ethers.js'], resources: ['CryptoZombies'], projects: [] }
                ]
            },
            {
                title: 'Digital Marketing Strategist',
                description: 'Drive growth and user acquisition via online channels.',
                salary_range: { entry: '₹3L - ₹5L', mid: '₹10L - ₹15L', senior: '₹25L+' },
                growth_rate: 'Steady', automation_risk: 30, base_duration_months: 4,
                required_skills: [getSkillId('SEO'), getSkillId('Content Writing')],
                optional_skills: [getSkillId('Tableau'), getSkillId('Python')],
                roadmap_template: [
                    { phaseNumber: 1, phaseName: 'Performance Marketing', estimatedDurationWeeks: 4, topics: ['Google Ads', 'Meta Ads'], resources: ['HubSpot'], projects: [] },
                    { phaseNumber: 2, phaseName: 'Growth Hacking', estimatedDurationWeeks: 4, topics: ['A/B Testing', 'Conversion Optimization'], resources: ['Reforge'], projects: [] }
                ]
            },
            { title: 'Backend Architect', description: 'Design performant server-side systems.', salary_range: { entry: '₹9L', mid: '₹25L', senior: '₹50L' }, growth_rate: 'High', required_skills: [getSkillId('Node.js'), getSkillId('SQL'), getSkillId('Go')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Systems Design', estimatedDurationWeeks: 8, topics: ['Microservices', 'Caching'], resources: [], projects: [] }] },
            { title: 'Embedded Systems Engineer', description: 'Program microcontrollers and hardware.', salary_range: { entry: '₹6L', mid: '₹15L', senior: '₹30L' }, growth_rate: 'High', required_skills: [getSkillId('C++'), getSkillId('Linux')], roadmap_template: [{ phaseNumber: 1, phaseName: 'RTOS', estimatedDurationWeeks: 10, topics: ['Interrupts', 'Drivers'], resources: [], projects: [] }] },
            { title: 'Data Engineer', description: 'Build big data pipelines.', salary_range: { entry: '₹8L', mid: '₹22L', senior: '₹40L' }, growth_rate: 'Very High', required_skills: [getSkillId('Apache Spark'), getSkillId('Python'), getSkillId('SQL')], roadmap_template: [{ phaseNumber: 1, phaseName: 'ETL Pipelines', estimatedDurationWeeks: 8, topics: ['Airflow', 'Warehousing'], resources: [], projects: [] }] },
            { title: 'Frontend Specialist', description: 'Master of UI animations and performance.', salary_range: { entry: '₹6L', mid: '₹16L', senior: '₹35L' }, growth_rate: 'High', required_skills: [getSkillId('TypeScript'), getSkillId('React'), getSkillId('CSS')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Advanced React', estimatedDurationWeeks: 6, topics: ['Server Components', 'Micro-frontends'], resources: [], projects: [] }] },
            { title: 'MLOps Engineer', description: 'Maintain ML models in production.', salary_range: { entry: '₹10L', mid: '₹28L', senior: '₹55L' }, growth_rate: 'Critical', required_skills: [getSkillId('Machine Learning'), getSkillId('Docker'), getSkillId('Kubernetes')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Model Serving', estimatedDurationWeeks: 8, topics: ['Kubeflow', 'MLflow'], resources: [], projects: [] }] },
            { title: 'Full Stack Java Dev', description: 'Enterprise-grade web development.', salary_range: { entry: '₹5L', mid: '₹15L', senior: '₹30L' }, growth_rate: 'Steady', required_skills: [getSkillId('Java'), getSkillId('Spring Boot'), getSkillId('SQL')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Enterprise Design', estimatedDurationWeeks: 8, topics: ['Spring Cloud', 'Hibernate'], resources: [], projects: [] }] },
            { title: 'iOS Developer', description: 'Build premium mobile apps for Apple.', salary_range: { entry: '₹7L', mid: '₹18L', senior: '₹40L' }, growth_rate: 'High', required_skills: [getSkillId('Swift')], roadmap_template: [{ phaseNumber: 1, phaseName: 'SwiftUI', estimatedDurationWeeks: 8, topics: ['Combine', 'Core Data'], resources: [], projects: [] }] },
            { title: 'Android Expert', description: 'Master of the Android ecosystem.', salary_range: { entry: '₹5L', mid: '₹16L', senior: '₹35L' }, growth_rate: 'High', required_skills: [getSkillId('Kotlin')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Jetpack Compose', estimatedDurationWeeks: 8, topics: ['Coroutines', 'Ktor'], resources: [], projects: [] }] },
            { title: 'Quality Assurance Lead', description: 'Guardian of software reliability.', salary_range: { entry: '₹4L', mid: '₹12L', senior: '₹25L' }, growth_rate: 'Steady', required_skills: [getSkillId('Unit Testing'), getSkillId('JavaScript')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Automation Frameworks', estimatedDurationWeeks: 6, topics: ['Selenium', 'Cypress'], resources: [], projects: [] }] },
            { title: 'Game Developer', description: 'Create immersive 3D/2D games.', salary_range: { entry: '₹5L', mid: '₹15L', senior: '₹35L' }, growth_rate: 'High', required_skills: [getSkillId('C#'), getSkillId('C++')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Game Engines', estimatedDurationWeeks: 10, topics: ['Unity', 'Unreal'], resources: [], projects: [] }] },
            { title: 'Site Reliability Engineer', description: 'Scale massive infrastructures.', salary_range: { entry: '₹9L', mid: '₹24L', senior: '₹50L' }, growth_rate: 'Very High', required_skills: [getSkillId('Go'), getSkillId('Terraform'), getSkillId('AWS')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Observability', estimatedDurationWeeks: 8, topics: ['Prometheus', 'Grafana'], resources: [], projects: [] }] },
            { title: 'NLP Researcher', description: 'Advancing language models.', salary_range: { entry: '₹15L', mid: '₹40L', senior: '₹90L' }, growth_rate: 'Critical', required_skills: [getSkillId('Deep Learning'), getSkillId('Python')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Model Fine-tuning', estimatedDurationWeeks: 12, topics: ['LoRA', 'RLHF'], resources: [], projects: [] }] },
            { title: 'Full Stack .NET Dev', description: 'Dynamic web apps with MS stack.', salary_range: { entry: '₹5L', mid: '₹14L', senior: '₹28L' }, growth_rate: 'Steady', required_skills: [getSkillId('C#'), getSkillId('SQL')], roadmap_template: [{ phaseNumber: 1, phaseName: '.NET Core', estimatedDurationWeeks: 8, topics: ['Blazor', 'EntityFramework'], resources: [], projects: [] }] },
            { title: 'FinTech Engineer', description: 'Secure financial systems development.', salary_range: { entry: '₹12L', mid: '₹35L', senior: '₹65L' }, growth_rate: 'High', required_skills: [getSkillId('Rust'), getSkillId('Go'), getSkillId('Network Security')], roadmap_template: [{ phaseNumber: 1, phaseName: 'High Frequency Systems', estimatedDurationWeeks: 10, topics: ['Low Latency', 'Distributed Ledger'], resources: [], projects: [] }] },
            { title: 'AR/VR Developer', description: 'Building the metaverse.', salary_range: { entry: '₹6L', mid: '₹16L', senior: '₹35L' }, growth_rate: 'High', required_skills: [getSkillId('C#'), getSkillId('C++'), getSkillId('Figma')], roadmap_template: [{ phaseNumber: 1, phaseName: '3D Interactions', estimatedDurationWeeks: 10, topics: ['Spatial Audio', 'Oculus SDK'], resources: [], projects: [] }] },
            { title: 'Technical Architect', description: 'Broad software architecture vision.', salary_range: { entry: '₹15L', mid: '₹35L', senior: '₹70L' }, growth_rate: 'High', required_skills: [getSkillId('React'), getSkillId('Node.js'), getSkillId('Cloud')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Org Scale Systems', estimatedDurationWeeks: 8, topics: ['Event-driven Arch', 'Scalability'], resources: [], projects: [] }] },
            { title: 'Product Manager (Tech)', description: 'Owner of the tech product roadmap.', salary_range: { entry: '₹10L', mid: '₹22L', senior: '₹45L' }, growth_rate: 'High', required_skills: [getSkillId('SQL'), getSkillId('Tableau'), getSkillId('Python')], roadmap_template: [{ phaseNumber: 1, phaseName: 'User Research', estimatedDurationWeeks: 6, topics: ['MVP Design', 'Agile'], resources: [], projects: [] }] },
            { title: 'Database Administrator', description: 'Optimize and secure data storage.', salary_range: { entry: '₹6L', mid: '₹14L', senior: '₹28L' }, growth_rate: 'Steady', required_skills: [getSkillId('SQL')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Query Tuning', estimatedDurationWeeks: 8, topics: ['Index Optimization', 'DR Planning'], resources: [], projects: [] }] },
            { title: 'Growth Engineer', description: 'Code for market scale.', salary_range: { entry: '₹7L', mid: '₹18L', senior: '₹35L' }, growth_rate: 'High', required_skills: [getSkillId('JavaScript'), getSkillId('Python'), getSkillId('SEO')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Virality Engines', estimatedDurationWeeks: 6, topics: ['Referral Loops', 'Funnel Tracking'], resources: [], projects: [] }] },
            { title: 'Enterprise Security Lead', description: 'Protect whole organizations.', salary_range: { entry: '₹15L', mid: '₹40L', senior: '₹80L' }, growth_rate: 'Critical', required_skills: [getSkillId('Ethical Hacking'), getSkillId('Network Security')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Compliance & Auditing', estimatedDurationWeeks: 10, topics: ['SOC2', 'ISO 27001'], resources: [], projects: [] }] },
            { title: 'Graphic Designer', description: 'Visual communication expert.', salary_range: { entry: '₹3L', mid: '₹8L', senior: '₹18L' }, growth_rate: 'Steady', required_skills: [getSkillId('Photoshop'), getSkillId('Figma')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Brand Design', estimatedDurationWeeks: 6, topics: ['Logo Design', 'Illustration'], resources: [], projects: [] }] },
            { title: 'Mobile UI Expert', description: 'Premium mobile interface design.', salary_range: { entry: '₹6L', mid: '₹15L', senior: '₹30L' }, growth_rate: 'High', required_skills: [getSkillId('Figma')], roadmap_template: [{ phaseNumber: 1, phaseName: 'Mobile Ergonomics', estimatedDurationWeeks: 6, topics: ['Touch Targets', 'Material Design'], resources: [], projects: [] }] }
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
