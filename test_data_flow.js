const mongoose = require('mongoose');
const User = require('./model/User');
const Profile = require('./model/profile');
const TeacherProfile = require('./model/TeacherProfile');
const TeacherWork = require('./model/teacherwork');
const Doubt = require('./model/Doubt');

async function seedTestDataFlow() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Edu_Tech', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB for Test Seeding");

        const testCollege = "DataFlow University 2026 Test";

        // 1. Create a Teacher User
        let teacherUser = await User.findOne({ email: 't@gmail.com' });
        if (!teacherUser) {
            const newUser = new User({
                username: 't@gmail.com', // Passport uses this for login usually
                email: 't@gmail.com',
                role: 'teacher'
            });
            teacherUser = await User.register(newUser, '123456789');
        }

        // 2. Create Teacher Profile
        let teacherProfile = await TeacherProfile.findOne({ userId: teacherUser._id });
        if (!teacherProfile) {
            teacherProfile = await TeacherProfile.create({
                userId: teacherUser._id,
                fullName: "Dr. Teacher Manual",
                email: "t@gmail.com",
                collegeName: testCollege,
                uniqueCode: "TECH-MANUAL",
                phone: "1234567890",
                state: "Test State",
                district: "Test District"
            });
        }

        // 3. Create a Student User
        let studentUser = await User.findOne({ email: 'v@gmail.com' });
        if (!studentUser) {
            const newUser = new User({
                username: 'v@gmail.com',
                email: 'v@gmail.com',
                role: 'student'
            });
            studentUser = await User.register(newUser, '123456789');
        }

        // 4. Create Student Profile
        let studentProfile = await Profile.findOne({ userId: studentUser._id });
        if (!studentProfile) {
            studentProfile = await Profile.create({
                userId: studentUser._id,
                fullName: "Student Manual",
                email: "v@gmail.com",
                collegeName: testCollege,
                phone: "0987654321",
                state: "Test State",
                district: "Test District",
                course: "Computer Science",
                year: "3rd Year",
                linkedin: "N/A",
                twitter: "N/A",
                uniqueCode: "STU-MANUAL"
            });
        }

        // 5. Create Teacher Work (Task and Session)
        await TeacherWork.deleteMany({ collegeName: testCollege }); // cleanup old

        await TeacherWork.create({
            type: "task",
            title: "Final Quantum Mechanics Assignment",
            dueDate: "2026-05-10",
            teacherId: teacherUser._id,
            collegeName: testCollege
        });

        await TeacherWork.create({
            type: "doubt_session",
            title: "Midterm Review Live",
            date: "2026-04-15",
            sessionTime: "14:00",
            sessionDuration: "60 mins",
            link: "https://zoom.us/test-midterm",
            teacherId: teacherUser._id,
            collegeName: testCollege
        });

        // 6. Create a Doubt from Student
        await Doubt.deleteMany({ collegeName: testCollege }); // cleanup old

        await Doubt.create({
            studentId: studentUser._id,
            studentName: "Student Tester",
            collegeName: testCollege,
            subject: "Schrödinger Equation",
            question: "I am confused about the wave function collapse. Help?",
            status: "pending"
        });

        console.log("✅ Successfully seeded test data. Teacher and Student are linked via: " + testCollege);
        process.exit(0);

    } catch (e) {
        console.error("Error seeding:", e);
        process.exit(1);
    }
}

seedTestDataFlow();
