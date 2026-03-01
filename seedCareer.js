const mongoose = require('mongoose');
const Career = require('./model/career'); // Use correct casing
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutech', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error(err));

const seedCareer = async () => {
    try {
        await Career.deleteMany({ title: "Fullstack Developer" });

        const fsDev = new Career({
            title: "Fullstack Developer",
            description: "A Fullstack Developer is responsible for both the front-end and back-end of web applications, ensuring seamless user experiences and robust server logic.",
            salary_range: {
                entry: "$60k - $80k",
                mid: "$90k - $120k",
                senior: "$130k+"
            },
            growth_rate: "22% (Much faster than average)",
            automation_risk: 15,
            required_skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"],
            optional_skills: ["TypeScript", "Docker", "AWS", "GraphQL", "Next.js"],
            base_duration_months: 6,
            roadmap_template: [
                {
                    phaseNumber: 1,
                    phaseName: "Web Fundamentals",
                    estimatedDurationWeeks: 3,
                    topics: ["HTML5 semantics", "CSS Flexbox & Grid", "Responsive Design", "Basic Git"],
                    resources: ["MDN Web Docs", "FreeCodeCamp Responsive Web Design"],
                    projects: [{
                        title: "Personal Portfolio",
                        objective: "Create a static responsive portfolio.",
                        skillsUsed: ["HTML", "CSS"],
                        resumeBullet: "Developed a responsive personal portfolio using semantic HTML and custom CSS.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 2,
                    phaseName: "Programming & JavaScript",
                    estimatedDurationWeeks: 4,
                    topics: ["JS Data Types", "ES6+ Features", "DOM Manipulation", "Asynchronous JS (Promises, Async/Await)"],
                    resources: ["JavaScript.info", "MDN JS Guide"],
                    projects: [{
                        title: "Interactive Task Tracker",
                        objective: "Build a dynamic web app to track tasks.",
                        skillsUsed: ["JavaScript", "DOM"],
                        resumeBullet: "Engineered an interactive task tracker using Vanilla JS and local storage.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 3,
                    phaseName: "Frontend Frameworks (React)",
                    estimatedDurationWeeks: 5,
                    topics: ["React Components", "State & Props", "Hooks (useState, useEffect)", "React Router", "API Integration"],
                    resources: ["React Official Docs", "Frontend Masters React Path"],
                    projects: [{
                        title: "Movie Explorer App",
                        objective: "Fetch and display movies from a public API.",
                        skillsUsed: ["React", "API Fetching"],
                        resumeBullet: "Constructed a dynamic movie explorer app integrating third-party APIs via React.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 4,
                    phaseName: "Backend & Databases",
                    estimatedDurationWeeks: 6,
                    topics: ["Node.js Basics", "Express Routing", "RESTful APIs", "MongoDB & Mongoose", "Authentication (JWT)"],
                    resources: ["Node.js Docs", "MongoDB University"],
                    projects: [{
                        title: "RESTful Task API",
                        objective: "Build a backend API with auth and database support.",
                        skillsUsed: ["Node.js", "Express", "MongoDB"],
                        resumeBullet: "Architected a secure REST API with JWT authentication and MongoDB integration.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 5,
                    phaseName: "Fullstack Integration",
                    estimatedDurationWeeks: 4,
                    topics: ["Connecting React to Express", "State Management (Redux/Context)", "CORS", "Error Handling"],
                    resources: ["FullStackOpen"],
                    projects: [{
                        title: "E-Commerce Clone",
                        objective: "Build a complete shopping cart experience.",
                        skillsUsed: ["MERN Stack", "Redux"],
                        resumeBullet: "Deployed a full-stack e-commerce platform with cart functionality and secure checkout.",
                        difficulty: "Advanced"
                    }]
                },
                {
                    phaseNumber: 6,
                    phaseName: "Advanced Optional Tech",
                    estimatedDurationWeeks: 2,
                    topics: ["TypeScript basics", "Docker containerization", "Cloud Deployment (AWS/Vercel)"],
                    resources: ["TypeScript Handbook", "Docker for Beginners"],
                    projects: []
                },
                {
                    phaseNumber: 7,
                    phaseName: "Job Prep & Resume",
                    estimatedDurationWeeks: 2,
                    topics: ["Resume Polish", "Technical Interview Prep", "System Design Basics"],
                    resources: ["Cracking the Coding Interview", "Pramp"],
                    projects: []
                }
            ],
            related_careers: [
                {
                    title: "Frontend Developer",
                    why_recommended: "Focuses strictly on the client side, leveraging your UI skills.",
                    skill_overlap_percentage: 60,
                    transition_ease: "Easy"
                },
                {
                    title: "Backend Developer",
                    why_recommended: "Focuses strictly on the server and database architecture.",
                    skill_overlap_percentage: 50,
                    transition_ease: "Medium"
                }
            ]
        });

        await fsDev.save();
        console.log("✅ Seeded Fullstack Developer Template!");

        // 2. Frontend Developer
        await Career.deleteMany({ title: "Frontend Developer" });
        const frontendDev = new Career({
            title: "Frontend Developer",
            description: "A Frontend Developer creates the user interface and interactive elements of websites and applications.",
            salary_range: {
                entry: "$50k - $75k",
                mid: "$80k - $110k",
                senior: "$120k+"
            },
            growth_rate: "20% (Much faster than average)",
            automation_risk: 18,
            required_skills: ["HTML", "CSS", "JavaScript", "React", "Git"],
            optional_skills: ["TypeScript", "Next.js", "Tailwind CSS", "Figma", "Vue.js"],
            base_duration_months: 5,
            roadmap_template: [
                {
                    phaseNumber: 1,
                    phaseName: "Web Fundamentals",
                    estimatedDurationWeeks: 3,
                    topics: ["HTML5", "CSS basics", "Responsive Design", "Git & GitHub"],
                    resources: ["MDN", "FreeCodeCamp"],
                    projects: [{
                        title: "Personal Portfolio",
                        objective: "Create a static responsive portfolio.",
                        skillsUsed: ["HTML", "CSS"],
                        resumeBullet: "Developed a responsive personal portfolio using semantic HTML and CSS.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 2,
                    phaseName: "JavaScript Essentials",
                    estimatedDurationWeeks: 5,
                    topics: ["Variables & Data Types", "Functions & Scope", "DOM Manipulation", "ES6+ Features", "Async JS"],
                    resources: ["JavaScript.info"],
                    projects: [{
                        title: "Interactive Web App",
                        objective: "Build a dynamic to-do list.",
                        skillsUsed: ["JavaScript", "DOM"],
                        resumeBullet: "Built an interactive client-side application using Vanilla JavaScript.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 3,
                    phaseName: "Frontend Frameworks (React)",
                    estimatedDurationWeeks: 6,
                    topics: ["React Basics", "State & Props", "Hooks", "React Router", "API Fetching"],
                    resources: ["React Docs"],
                    projects: [{
                        title: "Movie Explorer",
                        objective: "Fetch movies from an API.",
                        skillsUsed: ["React", "APIs"],
                        resumeBullet: "Developed a dynamic interface consuming RESTful APIs with React.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 4,
                    phaseName: "Advanced Styling & State",
                    estimatedDurationWeeks: 4,
                    topics: ["Tailwind CSS", "Context API / Redux", "Performance Optimization"],
                    resources: ["Tailwind Docs"],
                    projects: [{
                        title: "E-commerce UI",
                        objective: "Build a complex product catalog and cart UI.",
                        skillsUsed: ["React", "Redux", "Tailwind CSS"],
                        resumeBullet: "Engineered scalable state management for an e-commerce interface.",
                        difficulty: "Advanced"
                    }]
                }
            ],
            related_careers: []
        });
        await frontendDev.save();
        console.log("✅ Seeded Frontend Developer Template!");

        // 3. Backend Developer
        await Career.deleteMany({ title: "Backend Developer" });
        const backendDev = new Career({
            title: "Backend Developer",
            description: "A Backend Developer architects the server, database, and APIs that power web and mobile applications.",
            salary_range: {
                entry: "$65k - $85k",
                mid: "$95k - $130k",
                senior: "$140k+"
            },
            growth_rate: "21% (Much faster than average)",
            automation_risk: 12,
            required_skills: ["Node.js", "Express", "Databases (SQL/NoSQL)", "APIs", "Git"],
            optional_skills: ["Python", "Docker", "AWS", "Redis", "GraphQL"],
            base_duration_months: 6,
            roadmap_template: [
                {
                    phaseNumber: 1,
                    phaseName: "Programming Foundations",
                    estimatedDurationWeeks: 4,
                    topics: ["JavaScript / Python basics", "Data Structures", "Algorithms", "Git"],
                    resources: ["Codecademy"],
                    projects: [{
                        title: "CLI Tool",
                        objective: "Build a command line application.",
                        skillsUsed: ["Node.js"],
                        resumeBullet: "Developed a command-line utility for task automation.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 2,
                    phaseName: "Server and APIs",
                    estimatedDurationWeeks: 5,
                    topics: ["Node.js Basics", "Express.js", "RESTful Architecture", "Middleware"],
                    resources: ["Express Docs"],
                    projects: [{
                        title: "Basic REST API",
                        objective: "Create an API with CRUD operations.",
                        skillsUsed: ["Express", "Node.js"],
                        resumeBullet: "Architected a RESTful API serving JSON data via Express.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 3,
                    phaseName: "Databases & Data Modeling",
                    estimatedDurationWeeks: 5,
                    topics: ["SQL vs NoSQL", "MongoDB / PostgreSQL", "ORM/ODM", "Schema Design"],
                    resources: ["Prisma Docs", "MongoDB University"],
                    projects: [{
                        title: "Blog Backend",
                        objective: "Integrate database with your API.",
                        skillsUsed: ["Databases", "ORM"],
                        resumeBullet: "Designed relational database schemas and integrated them via ORM.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 4,
                    phaseName: "Security & Deployment",
                    estimatedDurationWeeks: 4,
                    topics: ["Authentication (JWT/OAuth)", "Security Best Practices", "Docker Basics", "Cloud Deployment"],
                    resources: ["OWASP"],
                    projects: [{
                        title: "Secure Auth Service",
                        objective: "Build a secure authentication server.",
                        skillsUsed: ["Security", "JWT"],
                        resumeBullet: "Implemented secure user authentication and authorization using JWTs.",
                        difficulty: "Advanced"
                    }]
                }
            ],
            related_careers: []
        });
        await backendDev.save();
        console.log("✅ Seeded Backend Developer Template!");

        // 4. Data Scientist
        await Career.deleteMany({ title: "Data Scientist" });
        const dataScientist = new Career({
            title: "Data Scientist",
            description: "A Data Scientist analyzes complex datasets to uncover insights and build predictive models.",
            salary_range: {
                entry: "$70k - $95k",
                mid: "$100k - $140k",
                senior: "$150k+"
            },
            growth_rate: "36% (Much faster than average)",
            automation_risk: 10,
            required_skills: ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
            optional_skills: ["R", "TensorFlow", "PyTorch", "AWS Sagemaker", "Big Data (Spark)"],
            base_duration_months: 8,
            roadmap_template: [
                {
                    phaseNumber: 1,
                    phaseName: "Python & Data Foundations",
                    estimatedDurationWeeks: 6,
                    topics: ["Python basics", "Pandas", "NumPy", "Jupyter Notebooks", "SQL basics"],
                    resources: ["Kaggle", "DataCamp"],
                    projects: [{
                        title: "Data Analysis Report",
                        objective: "Analyze a public dataset and visualize findings.",
                        skillsUsed: ["Python", "Pandas", "Matplotlib"],
                        resumeBullet: "Performed exploratory data analysis on real-world datasets using Pandas.",
                        difficulty: "Beginner"
                    }]
                },
                {
                    phaseNumber: 2,
                    phaseName: "Math & Statistics",
                    estimatedDurationWeeks: 5,
                    topics: ["Probability", "Descriptive Statistics", "Inferential Statistics", "Linear Algebra basics"],
                    resources: ["Khan Academy"],
                    projects: []
                },
                {
                    phaseNumber: 3,
                    phaseName: "Machine Learning (Scikit-Learn)",
                    estimatedDurationWeeks: 8,
                    topics: ["Supervised Learning (Regression/Classification)", "Unsupervised Learning", "Model Evaluation", "Hyperparameter Tuning"],
                    resources: ["Scikit-Learn Docs"],
                    projects: [{
                        title: "Predictive Model",
                        objective: "Build a model to predict housing prices.",
                        skillsUsed: ["Scikit-Learn", "Regression"],
                        resumeBullet: "Trained and evaluated predictive machine learning models using Scikit-Learn.",
                        difficulty: "Intermediate"
                    }]
                },
                {
                    phaseNumber: 4,
                    phaseName: "Advanced ML & Deployment",
                    estimatedDurationWeeks: 6,
                    topics: ["Deep Learning Basics (TensorFlow/Keras)", "NLP Basics", "Model Deployment (Flask/FastAPI)"],
                    resources: ["Fast.ai"],
                    projects: [{
                        title: "Image Classifier API",
                        objective: "Deploy a trained deep learning model to an API.",
                        skillsUsed: ["Deep Learning", "FastAPI"],
                        resumeBullet: "Deployed a deep learning classification model as a scalable REST API.",
                        difficulty: "Advanced"
                    }]
                }
            ],
            related_careers: []
        });
        await dataScientist.save();
        console.log("✅ Seeded Data Scientist Template!");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedCareer();
