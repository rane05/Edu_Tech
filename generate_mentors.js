const fs = require('fs');

const realMentors = [
  { name: "Shradha Khapra", headline: "Co-founder at Apna College | Ex-Microsoft", students: "2M+", exp: "8+", sessions: "500+", bio: "Renowned math and tech educator known for Apna College.", tags: ["DSA", "System Design", "Java"], img: "https://pbs.twimg.com/profile_images/1828452192107253760/LgHYdkkd_400x400.jpg", status: "Available this week" },
  { name: "Hitesh Choudhary", headline: "CTO at LCO | Full Stack Developer", students: "800K+", exp: "12+", sessions: "1.2K+", bio: "Specializes in modern JavaScript, backend architectures, and AWS cloud.", tags: ["JavaScript", "React", "AWS"], img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSThDPynNXgfcfqRvxsHlE4Rp7ffDdiYPZPrA&s", status: "Next available Monday" },
  { name: "Love Babbar", headline: "Founder at CodeHelp | Ex-Amazon", students: "1M+", exp: "6+", sessions: "800+", bio: "Expert in C++ and DSA. Master of interview preparation strategies for FAANG companies.", tags: ["C++", "DSA", "FAANG Prep"], img: "https://avatars.githubusercontent.com/u/29489915?v=4", status: "Available this week" },
  { name: "Kunal Kushwaha", headline: "DevRel at Civo | Open Source Advocate", students: "500K+", exp: "5+", sessions: "600+", bio: "Leading figure in DevOps and open source. Helps students break into cloud native technologies.", tags: ["DevOps", "Java", "Open Source"], img: "https://avatars.githubusercontent.com/u/42698533?v=4", status: "Booking closing soon" },
  { name: "Harkirat Singh", headline: "Founder at 100xDevs | Ex-Goldman Sachs", students: "300K+", exp: "7+", sessions: "400+", bio: "Focuses on deep engineering knowledge, system design, and advanced web development.", tags: ["MERN", "System Design", "Web3"], img: "https://avatars.githubusercontent.com/u/8079861?v=4", status: "Available this week" },
  { name: "Take U Forward (Striver)", headline: "SDE at Google | DSA Expert", students: "1.5M+", exp: "5+", sessions: "900+", bio: "Creator of the legendary Striver's SDE Sheet. The ultimate guide for competitive programming.", tags: ["Competitive Programming", "DSA", "C++"], img: "https://yt3.googleusercontent.com/ytc/AIdro_nbwIFtK-iW28YwP0tQ_sF-7u-l-A4a0v9R6gX8Qw=s900-c-k-c0x00ffffff-no-rj", status: "Next available Friday" }
];

const domains = ["Web Development", "AI/ML", "Data Science", "Cloud Native", "System Design", "Mobile Dev", "Cybersecurity", "Blockchain"];
const companies = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Uber", "Airbnb", "Stripe", "Apple"];
const firstNames = ["Arjun", "Neha", "Rohan", "Priya", "Rahul", "Sneha", "Aditya", "Anjali", "Vikram", "Kriti", "Siddharth", "Pooja", "Karan", "Meera", "Varun", "Riya", "Aman", "Tanvi", "Nikhil", "Isha", "Rishabh", "Divya", "Akash", "Kavya", "Aryan"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Desai", "Joshi", "Mehta", "Reddy", "Rao", "Nair", "Iyer", "Sen", "Das", "Bose", "Chopra", "Malhotra", "Kapoor", "Chatterjee", "Bhatt"];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatedMentors = [];
for(let i = 0; i < 54; i++) {
  const isFemale = i % 2 !== 0; // rough generic split for avatar mapping
  generatedMentors.push({
    name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    headline: `Senior Engineer at ${randomChoice(companies)} | ${randomChoice(domains)} Expert`,
    students: `${randomInt(10, 200)}K+`,
    exp: `${randomInt(3, 15)}+`,
    sessions: `${randomInt(50, 500)}+`,
    bio: `Passionate engineer creating technical content to bridge the gap between academia and industry. Mentored thousands of students into top tech roles.`,
    tags: [randomChoice(domains), randomChoice(["React", "Node.js", "Python", "Go", "Java", "C++", "AWS"]), randomChoice(["Interview Prep", "Architecture", "Career Guidance"])],
    img: `https://i.pravatar.cc/300?img=${randomInt(1, 70)}`, // using pravatar for realistic placeholders
    status: randomChoice(["Available this week", "Next available Monday", "Booking closing soon", "Limited Slots"])
  });
}

const allMentors = [...realMentors, ...generatedMentors];

allMentors.forEach(m => {
  m.rating = (Math.random() * (5.0 - 4.6) + 4.6).toFixed(1);
  m.reviews = randomInt(100, 2000);
});

fs.writeFileSync('data/mentors.json', JSON.stringify(allMentors, null, 2));
console.log('Mentors generated: ' + allMentors.length);
