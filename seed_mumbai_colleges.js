require('dotenv').config();
const mongoose = require('mongoose');
const CetCollege = require('./model/cetCollege');

const mumbaiColleges = [
    // --- SOUTH MUMBAI & CENTRAL ---
    {
        name: "Veermata Jijabai Technological Institute (VJTI)",
        university: "Mumbai University",
        location: "Matunga, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 99.96, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 99.92, year: 2023 }] },
            { name: "Electronics & Telecom", cutoffs: [{ category: "General", round: 1, cetScore: 99.72, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 99.50, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 98.80, year: 2023 }] }
        ]
    },
    {
        name: "Sardar Patel Institute of Technology (SPIT)",
        university: "Mumbai University",
        location: "Andheri, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 99.82, year: 2023 }] },
            { name: "CS & Data Science", cutoffs: [{ category: "General", round: 1, cetScore: 99.75, year: 2023 }] },
            { name: "Electronics & Telecom", cutoffs: [{ category: "General", round: 1, cetScore: 99.38, year: 2023 }] }
        ]
    },
    {
        name: "Sardar Patel College of Engineering (SPCE)",
        university: "Mumbai University",
        location: "Andheri, Mumbai",
        branches: [
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 98.20, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 97.50, year: 2023 }] },
            { name: "Electrical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 97.80, year: 2023 }] }
        ]
    },
    {
        name: "Dwarkadas J. Sanghvi College of Engineering (DJSCE)",
        university: "Mumbai University",
        location: "Vile Parle, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 99.52, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 99.21, year: 2023 }] },
            { name: "AI and Data Science", cutoffs: [{ category: "General", round: 1, cetScore: 99.04, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 96.50, year: 2023 }] }
        ]
    },
    {
        name: "Thadomal Shahani Engineering College (TSEC)",
        university: "Mumbai University",
        location: "Bandra, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 98.50, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 97.80, year: 2023 }] },
            { name: "AI & Data Science", cutoffs: [{ category: "General", round: 1, cetScore: 97.20, year: 2023 }] },
            { name: "Chemical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.50, year: 2023 }] }
        ]
    },
    {
        name: "Vidyalankar Institute of Technology (VIT)",
        university: "Mumbai University",
        location: "Wadala, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 96.50, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 95.80, year: 2023 }] },
            { name: "Biomedical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "M.H. Saboo Siddik College of Engineering",
        university: "Mumbai University",
        location: "Byculla, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.00, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 70.00, year: 2023 }] }
        ]
    },

    // --- WESTERN SUBURBS (Bandra to Borivali) ---
    {
        name: "Fr. Conceicao Rodrigues College of Engineering (CRCE)",
        university: "Mumbai University",
        location: "Bandra, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 97.84, year: 2023 }] },
            { name: "AI & Data Science", cutoffs: [{ category: "General", round: 1, cetScore: 96.90, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 92.00, year: 2023 }] }
        ]
    },
    {
        name: "Rizvi College of Engineering",
        university: "Mumbai University",
        location: "Bandra, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 91.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 80.00, year: 2023 }] }
        ]
    },
    {
        name: "Rajiv Gandhi Institute of Technology (RGIT)",
        university: "Mumbai University",
        location: "Versova, Andheri",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 92.80, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 91.50, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "Atharva College of Engineering",
        university: "Mumbai University",
        location: "Malad, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 93.50, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 92.00, year: 2023 }] },
            { name: "Electrical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 82.00, year: 2023 }] }
        ]
    },
    {
        name: "Thakur College of Engineering and Technology (TCET)",
        university: "Mumbai University",
        location: "Kandivali, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 96.00, year: 2023 }] },
            { name: "AI & Machine Learning", cutoffs: [{ category: "General", round: 1, cetScore: 95.20, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "St. Francis Institute of Technology (SFIT)",
        university: "Mumbai University",
        location: "Borivali, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 94.80, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 93.50, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 86.00, year: 2023 }] }
        ]
    },
    {
        name: "Don Bosco Institute of Technology (DBIT)",
        university: "Mumbai University",
        location: "Kurla, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 95.20, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 94.10, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.50, year: 2023 }] }
        ]
    },
    {
        name: "Xavier Institute of Engineering",
        university: "Mumbai University",
        location: "Mahim, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 93.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 91.50, year: 2023 }] }
        ]
    },
    {
        name: "L.R. Tiwari College of Engineering",
        university: "Mumbai University",
        location: "Mira Road, Thane",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 82.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 60.00, year: 2023 }] }
        ]
    },
    {
        name: "Vidyavardhini College of Engineering (VCET)",
        university: "Mumbai University",
        location: "Vasai, Palghar",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 91.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 89.00, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 78.00, year: 2023 }] }
        ]
    },
    {
        name: "Universal College of Engineering",
        university: "Mumbai University",
        location: "Vasai, Palghar",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] },
            { name: "AI & ML", cutoffs: [{ category: "General", round: 1, cetScore: 72.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 50.00, year: 2023 }] }
        ]
    },
    {
        name: "Viva Institute of Technology",
        university: "Mumbai University",
        location: "Virar, Palghar",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 78.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 55.00, year: 2023 }] },
            { name: "Electrical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 60.00, year: 2023 }] }
        ]
    },

    // --- HARBOUR & NAVI MUMBAI ---
    {
        name: "Vivekanand Education Society's Institute of Technology (VESIT)",
        university: "Mumbai University",
        location: "Chembur, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 98.37, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 97.90, year: 2023 }] },
            { name: "Automation & Robotics", cutoffs: [{ category: "General", round: 1, cetScore: 96.50, year: 2023 }] }
        ]
    },
    {
        name: "Shah and Anchor Kutchhi Engineering College",
        university: "Mumbai University",
        location: "Chembur, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 93.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 91.00, year: 2023 }] },
            { name: "Electronics & Computer Science", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "K.J. Somaiya College of Engineering",
        university: "Mumbai University",
        location: "Vidyavihar, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 98.80, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 98.20, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 94.50, year: 2023 }] }
        ]
    },
    {
        name: "K.J. Somaiya Institute of Engineering and IT (KJSIEIT)",
        university: "Mumbai University",
        location: "Sion, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 95.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 94.00, year: 2023 }] },
            { name: "AI & Data Science", cutoffs: [{ category: "General", round: 1, cetScore: 93.50, year: 2023 }] }
        ]
    },
    {
        name: "Ramrao Adik Institute of Technology (RAIT)",
        university: "DY Patil University (Deemed)",
        location: "Nerul, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 96.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 95.00, year: 2023 }] },
            { name: "Electronics & Telecom", cutoffs: [{ category: "General", round: 1, cetScore: 90.00, year: 2023 }] }
        ]
    },
    {
        name: "SIES Graduate School of Technology",
        university: "Mumbai University",
        location: "Nerul, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 94.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 92.50, year: 2023 }] },
            { name: "Printing & Packaging", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] }
        ]
    },
    {
        name: "Terna Engineering College",
        university: "Mumbai University",
        location: "Nerul, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 91.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 89.00, year: 2023 }] },
            { name: "Mechatronics", cutoffs: [{ category: "General", round: 1, cetScore: 80.00, year: 2023 }] }
        ]
    },
    {
        name: "Fr. C. Rodrigues Institute of Technology (FCRIT)",
        university: "Mumbai University",
        location: "Vashi, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 96.50, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 95.00, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 89.00, year: 2023 }] }
        ]
    },
    {
        name: "Bharati Vidyapeeth College of Engineering (BVCOE)",
        university: "Mumbai University",
        location: "CBD Belapur, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 92.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 90.00, year: 2023 }] },
            { name: "Chemical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 82.00, year: 2023 }] }
        ]
    },
    {
        name: "Pillai College of Engineering",
        university: "Mumbai University",
        location: "Panvel, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 93.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 91.00, year: 2023 }] },
            { name: "Automobile Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "MGM College of Engineering and Technology",
        university: "Mumbai University",
        location: "Kamothe, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] },
            { name: "Biomedical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 70.00, year: 2023 }] }
        ]
    },
    {
        name: "A.C. Patil College of Engineering",
        university: "Mumbai University",
        location: "Kharghar, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] },
            { name: "Electrical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] }
        ]
    },
    {
        name: "Saraswati College of Engineering",
        university: "Mumbai University",
        location: "Kharghar, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 82.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 65.00, year: 2023 }] }
        ]
    },
    {
        name: "Datta Meghe College of Engineering",
        university: "Mumbai University",
        location: "Airoli, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 90.50, year: 2023 }] },
            { name: "Chemical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 78.00, year: 2023 }] }
        ]
    },
    {
        name: "Lokmanya Tilak College of Engineering (LTCE)",
        university: "Mumbai University",
        location: "Koparkhairane, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 87.00, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 72.00, year: 2023 }] }
        ]
    },

    // --- THANE & BEYOND ---
    {
        name: "A.P. Shah Institute of Technology",
        university: "Mumbai University",
        location: "Thane West",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 86.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 70.00, year: 2023 }] }
        ]
    },
    {
        name: "K.C. College of Engineering",
        university: "Mumbai University",
        location: "Thane East",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 83.00, year: 2023 }] }
        ]
    },
    {
        name: "Shivajirao S. Jondhale College of Engineering",
        university: "Mumbai University",
        location: "Dombivli, Thane",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 78.00, year: 2023 }] },
            { name: "Chemical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 70.00, year: 2023 }] }
        ]
    },
    {
        name: "Terna Engineering College (Dombivli Campus)",
        university: "Mumbai University",
        location: "Dombivli, Thane",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] }
        ]
    },
    {
        name: "Watumull Institute of Electronics Engineering",
        university: "Mumbai University",
        location: "Ulhasnagar, Thane",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 72.00, year: 2023 }] },
            { name: "Electronics & Telecom", cutoffs: [{ category: "General", round: 1, cetScore: 60.00, year: 2023 }] }
        ]
    },
    {
        name: "Smt. Indira Gandhi College of Engineering",
        university: "Mumbai University",
        location: "Ghansoli, Navi Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] },
            { name: "Electrical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 65.00, year: 2023 }] }
        ]
    },
    {
        name: "Vasantdada Patil Pratishthan's College of Engineering",
        university: "Mumbai University",
        location: "Sion, Mumbai",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 88.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 85.00, year: 2023 }] }
        ]
    },
    {
        name: "Pillai HOC College of Engineering and Technology",
        university: "Mumbai University",
        location: "Rasayani, Raigad",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 80.00, year: 2023 }] },
            { name: "Civil Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 60.00, year: 2023 }] }
        ]
    },
    {
        name: "Vishwaniketan's iMEET",
        university: "Mumbai University",
        location: "Khalapur, Raigad",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 82.00, year: 2023 }] },
            { name: "Mechanical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 65.00, year: 2023 }] }
        ]
    },
    {
        name: "Yadavrao Tasgaonkar College of Engineering",
        university: "Mumbai University",
        location: "Karjat, Raigad",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 70.00, year: 2023 }] }
        ]
    },
    {
        name: "Konkan Gyanpeeth College of Engineering",
        university: "Mumbai University",
        location: "Karjat, Raigad",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] },
            { name: "Information Technology", cutoffs: [{ category: "General", round: 1, cetScore: 72.00, year: 2023 }] }
        ]
    },
    {
        name: "Finolex Academy of Management and Technology",
        university: "Mumbai University",
        location: "Ratnagiri",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 80.00, year: 2023 }] },
            { name: "Chemical Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 75.00, year: 2023 }] }
        ]
    },
    {
        name: "Rajendra Mane College of Engineering and Technology",
        university: "Mumbai University",
        location: "Ambav, Ratnagiri",
        branches: [
            { name: "Computer Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 72.00, year: 2023 }] },
            { name: "Automobile Engineering", cutoffs: [{ category: "General", round: 1, cetScore: 60.00, year: 2023 }] }
        ]
    }
];

const seedMumbaiColleges = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing existing colleges...');
        // Optional: Comment out next line if you want to append instead of replace
        // await CetCollege.deleteMany({}); 

        console.log(`Inserting ${mumbaiColleges.length} colleges...`);
        await CetCollege.insertMany(mumbaiColleges);

        console.log('Mumbai colleges data inserted successfully!');

        const count = await CetCollege.countDocuments();
        console.log(`Total colleges now in DB: ${count}`);

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        mongoose.connection.close();
        console.log('Connection closed.');
    }
};

seedMumbaiColleges();
