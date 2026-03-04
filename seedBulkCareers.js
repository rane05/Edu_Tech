const mongoose = require('mongoose');
const Career = require('./model/career');
const Skill = require('./model/Skill');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutech', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Bulk Seeding'))
    .catch(err => console.error(err));

// Helper to generate a generic 5-phase roadmap based on career skills
function generateRoadmap(title, skills) {
    return [
        {
            phaseNumber: 1,
            phaseName: "Foundations & Basics",
            estimatedDurationWeeks: 4,
            topics: ["Introduction to " + title, "Core principles of " + (skills[0] || "industry"), "Basic tools"],
            resources: ["Official Documentation", "Crash Courses"],
            projects: [{
                title: "Introductory Project",
                objective: "Get familiar with the basic workflow of " + title + ".",
                skillsUsed: skills.slice(0, 2),
                resumeBullet: "Completed foundational training and workflow setup for " + title + ".",
                difficulty: "Beginner"
            }]
        },
        {
            phaseNumber: 2,
            phaseName: "Core Technologies",
            estimatedDurationWeeks: 6,
            topics: skills.slice(0, 3).map(s => "Mastering " + s),
            resources: ["Deep Dive Tutorials", "O'Reilly Books"],
            projects: [{
                title: "Core Implementation",
                objective: "Build a functional prototype using core technologies.",
                skillsUsed: skills.slice(0, 3),
                resumeBullet: "Developed a functional prototype leveraging " + skills.slice(0, 2).join(" and ") + ".",
                difficulty: "Intermediate"
            }]
        },
        {
            phaseNumber: 3,
            phaseName: "Advanced Frameworks & Tools",
            estimatedDurationWeeks: 5,
            topics: skills.slice(2, 5).map(s => "Advanced " + s),
            resources: ["Advanced Video Courses", "Github Open Source"],
            projects: [{
                title: "Advanced System",
                objective: "Integrate multiple advanced tools into one cohesive system.",
                skillsUsed: skills.slice(2, 5),
                resumeBullet: "Architected a complex system integrating " + (skills[2] || "modern tools") + ".",
                difficulty: "Advanced"
            }]
        },
        {
            phaseNumber: 4,
            phaseName: "Architecture & Best Practices",
            estimatedDurationWeeks: 4,
            topics: ["System Design", "Performance Optimization", "Security Best Practices", "Testing"],
            resources: ["System Design Primer", "Clean Code"],
            projects: []
        },
        {
            phaseNumber: 5,
            phaseName: "Portfolio & Interview Prep",
            estimatedDurationWeeks: 3,
            topics: ["Resume Polishing", "Mock Interviews", "Whiteboard Coding"],
            resources: ["Cracking the Coding Interview", "LeetCode / HackerRank"],
            projects: []
        }
    ];
}

const rawCareers = [
    { title: "DevOps Engineer", req: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"], opt: ["Ansible", "GCP", "Prometheus"] },
    { title: "Mobile Developer (iOS)", req: ["Swift", "Xcode", "iOS SDK", "UIkit", "Git"], opt: ["SwiftUI", "Objective-C", "CoreData"] },
    { title: "Mobile Developer (Android)", req: ["Kotlin", "Android Studio", "Android SDK", "Java"], opt: ["Jetpack Compose", "Coroutines", "Room"] },
    { title: "AI Engineer", req: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"], opt: ["NLP", "Computer Vision", "MLOps"] },
    { title: "Cloud Architect", req: ["AWS/Azure/GCP", "System Design", "Networking", "Security", "Terraform"], opt: ["Kubernetes", "Serverless", "Cost Optimization"] },
    { title: "Cybersecurity Analyst", req: ["Linux", "Networking", "SIEM", "Penetration Testing", "Firewalls"], opt: ["CEH", "CompTIA Security+", "Python Scripting"] },
    { title: "Game Developer", req: ["C#", "C++", "Unity/Unreal Engine", "Math & Physics", "3D Rendering"], opt: ["Shaders", "Multiplayer Networking", "Blender"] },
    { title: "UI/UX Designer", req: ["Figma", "Wireframing", "Prototyping", "User Research", "Color Theory"], opt: ["Adobe XD", "HTML/CSS Basics", "Interaction Design"] },
    { title: "Product Manager", req: ["Agile/Scrum", "Roadmapping", "Jira", "User Stories", "Data Analysis"], opt: ["SQL", "A/B Testing", "Wireframing"] },
    { title: "Blockchain Developer", req: ["Solidity", "Smart Contracts", "Ethereum", "Cryptography", "Web3.js"], opt: ["Rust", "DeFi Protocols", "Hardhat"] },
    { title: "Data Engineer", req: ["SQL", "Python", "ETL", "Apache Spark", "Data Warehousing"], opt: ["Airflow", "Kafka", "Snowflake"] },
    { title: "Database Administrator (DBA)", req: ["SQL", "PostgreSQL", "Database Tuning", "Backups", "Security"], opt: ["Oracle", "MongoDB", "High Availability"] },
    { title: "Network Engineer", req: ["Cisco IOS", "TCP/IP", "Routers & Switches", "Firewalls", "BGP"], opt: ["CCNA/CCNP", "Wireshark", "Network Automation (Python)"] },
    { title: "QA Automation Engineer", req: ["Selenium", "JavaScript/Python", "TestNG", "CI/CD Integration", "API Testing"], opt: ["Cypress", "Playwright", "Appium"] },
    { title: "Site Reliability Engineer (SRE)", req: ["Linux", "Python/Go", "Monitoring", "Incident Response", "Docker"], opt: ["Grafana", "Chaos Engineering", "SLIs/SLOs"] },
    { title: "Embedded Systems Engineer", req: ["C/C++", "Microcontrollers", "RTOS", "Electronics Basics", "IoT"], opt: ["Rust", "PCB Design", "ARM Architecture"] },
    { title: "Computer Vision Engineer", req: ["Python", "OpenCV", "Deep Learning", "PyTorch", "Image Processing"], opt: ["C++", "CUDA", "YOLO"] },
    { title: "Prompt Engineer", req: ["Large Language Models", "NLP Basics", "Python", "Prompt Optimization", "API Integration"], opt: ["LangChain", "Vector Databases", "Fine-tuning"] },
    { title: "IT Support Specialist", req: ["Windows/Mac OS", "Troubleshooting", "Active Directory", "Ticketing Systems", "Hardware Repair"], opt: ["Linux Basics", "Network Basics", "ITIL"] },
    { title: "Systems Administrator", req: ["Windows Server", "Linux", "Virtualization (VMware/Hyper-V)", "Bash/PowerShell", "Active Directory"], opt: ["Cloud Basics", "Ansible", "Storage Area Networks"] },
    { title: "Technical Writer", req: ["Markdown", "API Documentation", "Git", "Clear Communication", "HTML/CSS"], opt: ["Swagger/OpenAPI", "DITA", "Static Site Generators"] },
    { title: "Tech Lead", req: ["System Architecture", "Agile Leadership", "Code Review", "Mentoring", "Backend/Frontend Expertise"], opt: ["Project Management", "Budgeting", "Cloud Architecture"] },
    { title: "Salesforce Developer", req: ["Apex", "Visualforce", "Lightning Web Components", "SOQL", "Salesforce CRM"], opt: ["JavaScript", "Integration APIs", "Salesforce Certifications"] },
    { title: "SAP Consultant", req: ["SAP ERP", "ABAP", "Business Processes", "Data Migration", "SAP Fiori"], opt: ["S/4HANA", "SAP Cloud Platform", "Integration"] },
    { title: "SEO Specialist", req: ["Keyword Research", "Google Analytics", "On-page SEO", "Off-page SEO", "HTML basics"], opt: ["Python for SEO", "Ahrefs/SEMrush", "Technical SEO"] },
    { title: "Game Designer", req: ["Game Mechanics", "Level Design", "Storyboarding", "Economy Tuning", "Player Psychology"], opt: ["Unity Setup", "Creative Writing", "Scripting (Lua/C#)"] },
    { title: "NLP Engineer", req: ["Python", "Natural Language Processing", "Transformers (HuggingFace)", "PyTorch", "Text Processing"], opt: ["LLMs", "Linguistics", "Elasticsearch"] },
    { title: "Big Data Engineer", req: ["Hadoop", "Spark", "Scala/Java", "NoSQL (Cassandra/HBase)", "Data Pipelines"], opt: ["Hive", "Kafka", "Cloud Big Data (EMR/Dataproc)"] },
    { title: "IoT Developer", req: ["C/C++", "Python", "MQTT", "Hardware Boards (Raspberry Pi/Arduino)", "Cloud IoT Services"], opt: ["Edge Computing", "Wireless Protocols (BLE/Zigbee)", "Security"] },
    { title: "Penetration Tester", req: ["Kali Linux", "Network Exploitation", "Web App Security", "Scripting (Python/Bash)", "Report Writing"], opt: ["OSCP", "Metasploit", "Reverse Engineering"] },
    { title: "Cloud Security Engineer", req: ["AWS/Azure/GCP Security", "IAM", "Compliance (SOC2/HIPAA)", "Encryption", "Vulnerability Management"], opt: ["CISSP", "DevSecOps", "Cloud Security Posture Management (CSPM)"] },
    { title: "Machine Learning Engineer", req: ["Python", "Machine Learning Concepts", "Data Structures", "Algorithms"], opt: ["PyTorch", "TensorFlow", "MLOps"] },
    { title: "Frontend Developer", req: ["HTML5", "CSS3", "JavaScript", "React", "TypeScript"], opt: ["Vue.js", "Angular", "Tailwind CSS"] },
    { title: "Backend Developer", req: ["Node.js", "Express.js", "SQL", "PostgreSQL", "JavaScript"], opt: ["MongoDB", "Django", "Spring Boot"] },
    { title: "Fullstack Developer", req: ["JavaScript", "HTML5", "CSS3", "React", "Node.js", "SQL"], opt: ["TypeScript", "MongoDB", "Express.js"] },
    { title: "Cloud Engineer", req: ["AWS Basics", "Docker", "Linux Administration", "Kubernetes"], opt: ["Terraform", "CI/CD Pipelines"] },
    { title: "Data Scientist", req: ["Python", "Machine Learning Concepts", "SQL", "Data Manipulation (Pandas)"], opt: ["Deep Learning (PyTorch/TF)", "NLP basics"] },
    { title: "Application Security Engineer", req: ["Authentication (JWT)", "Web Application Security", "Linux Administration", "OAuth"], opt: ["Penetration Testing", "Cryptography basics"] },
    { title: "Performance Engineer", req: ["Web Performance Opt", "Database Query Tuning", "Caching (Redis/Memcached)"], opt: ["Load Balancing", "Profiling Tools"] },
    { title: "Software Architect", req: ["System Design", "Design Patterns", "Microservices", "Event-Driven Architecture"], opt: ["Serverless Computing", "GraphQL"] },
    { title: "Testing Engineer", req: ["Unit Testing", "Integration Testing", "End-to-End Testing (Cypress/Selenium)"], opt: ["API Testing (Postman/Jest)", "Test-Driven Development (TDD)"] }
];

const seedBulk = async () => {
    try {
        console.log(`Starting bulk seed of ${rawCareers.length} careers...`);
        let count = 0;

        for (const rc of rawCareers) {
            // Delete existing if any to avoid duplicates
            await Career.deleteMany({ title: rc.title });

            // Resolve skill strings to DB ObjectIds
            const reqSkillsDocs = await Skill.find({ name: { $in: rc.req } });
            const optSkillsDocs = await Skill.find({ name: { $in: rc.opt } });

            const reqSkillIds = reqSkillsDocs.map(s => s._id);
            const optSkillIds = optSkillsDocs.map(s => s._id);

            const newCareer = new Career({
                title: rc.title,
                description: `A ${rc.title} specializes in modern technological environments using skills like ${rc.req.slice(0, 3).join(', ')}.`,
                salary_range: {
                    entry: "$60k - $85k",
                    mid: "$90k - $125k",
                    senior: "$135k+"
                },
                growth_rate: "High Demand (15%+ Growth)",
                automation_risk: Math.floor(Math.random() * 20) + 5,
                required_skills: reqSkillIds,
                optional_skills: optSkillIds,
                advanced_skills: [], // To be populated if needed
                base_duration_months: 6,
                roadmap_template: generateRoadmap(rc.title, rc.req),
                related_careers: []
            });

            await newCareer.save();
            count++;
            console.log(`[${count}/${rawCareers.length}] Seeded: ${rc.title}`);
        }

        console.log("✅ Successfully finished bulk seeding 31 careers!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedBulk();
