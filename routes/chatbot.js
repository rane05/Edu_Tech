const express = require('express');
const router = express.Router();
const dotenv = require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

router.get('/chatbot', (req, res) => {
    res.render('chatbot');
});

// Endpoint to handle chatbot conversation
router.post('/chat', async (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // Predefined responses for website services
  const predefinedResponses = {
    'i want to give an interview': 'You can access the interview section at "/interview". It provides AI-powered interview preparation tools.',
    'how can i prepare for an interview': 'Visit the "AI Interview" section at "/interview" for tips and resources to prepare for your interview.',
    'where can i find career resources': 'You can find career resources at "/carrer_resources". It includes guides, tools, and tips for career development.',
    'how can i access webinars': 'Webinars are available at "/webinars". Check out the latest webinars to enhance your skills.',
    'where can i find mentors': 'You can connect with mentors at "/mentor". They can guide you in your career journey.',
    'how can i access aptitude tests': 'Aptitude tests are available at "/apti". Practice and improve your skills with our test resources.',
    'where can i find job opportunities': 'Job opportunities are listed at "/jobs". Explore and apply for the latest openings.',
    'how can i access career trends': 'Visit "/Carrer_Trends" to explore the latest career trends and insights.',
    'where can i find scholarships': 'Scholarship information is available at "/scholarship". Check it out for funding opportunities.',
    'how can i contact support': 'You can contact support at "/contact". We are here to assist you with any queries.'
  };

  // Check if the user message matches a predefined response
  const reply = predefinedResponses[userMessage] || 'Sorry, I could not understand that. Please try rephrasing your question or visit the homepage for more information.';

  res.json({ reply });
});

module.exports = router;
