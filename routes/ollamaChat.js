const express = require('express');
const router = express.Router();
const axios = require('axios');
const College = require('../model/cetCollege');
const Chat = require('../model/Chat');
const Conversation = require('../model/Conversation');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Helper to get sidebar data
async function getSidebarData(userId) {
    if (!userId) return [];
    return await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(20);
}

// 1. Load Chat Interface (Default: New Chat or Most Recent)
router.get('/chat', async (req, res) => {
    const user = req.user || { username: 'Guest' };
    let conversations = [];
    let currentChat = null;
    let history = [];

    if (req.user) {
        conversations = await getSidebarData(req.user._id);
        // If query param ?id exists, load that. Else load nothing (New Chat)
        if (req.query.id) {
            currentChat = await Conversation.findOne({ _id: req.query.id, userId: req.user._id });
            if (currentChat) {
                history = await Chat.find({ conversationId: currentChat._id }).sort({ timestamp: 1 });
            }
        }
    }

    res.render('chat', {
        user,
        conversations,
        currentChat,
        history
    });
});

// 2. Clear All History (Deletes all conversations)
router.delete('/api/chat/history', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    await Chat.deleteMany({ userId: req.user._id });
    await Conversation.deleteMany({ userId: req.user._id });
    res.json({ success: true });
});

// 3. Delete Specific Conversation
router.delete('/api/chat/conversation/:id', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    await Chat.deleteMany({ conversationId: req.params.id, userId: req.user._id });
    await Conversation.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
});

router.post('/api/chat', upload.single('file'), async (req, res) => {
    let { message, conversationId } = req.body;
    const file = req.file;
    const user = req.user;

    // --- Session Management ---
    let currentConvId = conversationId;
    let isNewConv = false;

    if (user && !currentConvId) {
        // Create new Conversation
        const newConv = await Conversation.create({
            userId: user._id,
            title: "New Chat" // Will update later
        });
        currentConvId = newConv._id;
        isNewConv = true;
    }

    // Save User Message
    if (user) {
        let savedMsg = message;
        if (file) savedMsg = `[Uploaded: ${file.originalname}] ${message || 'Analyze this file.'}`;
        await Chat.create({
            userId: user._id,
            conversationId: currentConvId,
            message: savedMsg,
            role: 'user'
        });

        // Touch updated time
        if (currentConvId) {
            await Conversation.findByIdAndUpdate(currentConvId, { updatedAt: Date.now() });
        }
    }

    // Default message
    if (!message && !file) return res.status(400).json({ error: 'Message or File is required' });
    if (!message) message = "Analyze this document.";

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pass conversationId in header so frontend knows (for URL update)
    if (currentConvId) {
        res.setHeader('X-Conversation-Id', currentConvId.toString());
    }

    try {
        let systemPrompt = "";
        let contextData = "";

        if (file) {
            // === FILE UPLOAD MODE ===
            try {
                let pdfFunc = require('pdf-parse');
                const pdfData = await pdfFunc(file.buffer);
                const textContent = pdfData.text.slice(0, 3000);

                contextData = textContent;
                systemPrompt = `You are an expert Career Counselor and Document Analyst.
                DOCUMENT CONTENT: ${contextData}
                INSTRUCTIONS:
                1. Analyze the document content above.
                2. IF IT LOOKS LIKE A RESUME: Give Score/10, Strengths, Improvements.
                3. IF IT IS A GENERAL DOCUMENT: Summarize.
                `;
            } catch (err) {
                res.write("Error parsing PDF: " + err.message);
                res.end();
                return;
            }

        } else {
            // === RAG MODE ===
            const stopWords = ['give', 'list', 'show', 'tell', 'about', 'college', 'colleges', 'total', 'where', 'what', 'best', 'top', 'in', 'of'];
            const keywords = message.split(/[\s,]+/).filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()));

            let relevantData = [];
            if (keywords.length > 0) {
                const regexQuery = keywords.map(k => new RegExp(k, 'i'));
                relevantData = await College.find({
                    $or: [
                        { location: { $in: regexQuery } },
                        { name: { $in: regexQuery } }
                    ]
                }).limit(20).select('name location branches.name -_id');
            }

            const contextString = relevantData.length > 0 ? JSON.stringify(relevantData) : "No specific database data.";
            systemPrompt = `You are EduNavigator AI. 
            CONTEXT: ${contextString}
            CRITICAL: If context is empty, use your GENERAL KNOWLEDGE.

            VISUAL CAPABILITIES:
            You can generate flowcharts using Mermaid.js. 
            If the user asks for a "Roadmap", "Path", "Flow", or "Steps", you MUST provide a Mermaid diagram.
            
            Format:
            \`\`\`mermaid
            graph TD;
              A[Step 1] --> B[Step 2];
              B --> C[Step 3];
            \`\`\`
            CRITICAL RULES FOR MERMAID: 
            1. Keep diagrams simple (Top-Down graph TD).
            2. NEVER use parentheses (), brackets [], or dashes - inside node names/shapes. Use plain text only! Example: A[Learn Math]
            
            AFTER every response (especially after a Mermaid diagram), ALWAYS provide exactly 3 relevant follow-up questions the user can ask. Format EACH exactly on a new line like this:
            [SUGGESTION] Tell me more about step 1
            [SUGGESTION] What are the career prospects?
            [SUGGESTION] How do I get started?
            `;
        }

        // Call Groq
        if (!process.env.GROQ_API_KEY) {
            res.write("System Error: GROQ_API_KEY is missing in your .env file! Please add it to use the new blazing fast AI.");
            res.end();
            return;
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        let apiMessages = [{ role: "system", content: systemPrompt }];

        if (user && currentConvId) {
            // Fetch the last 20 messages from the DB (this includes the user msg just saved)
            let pastChats = await Chat.find({ conversationId: currentConvId })
                .sort({ timestamp: -1 })
                .limit(20);
            // Reverse to put back into chronological order for the AI context window
            pastChats = pastChats.reverse();

            for (let c of pastChats) {
                if (c.message) {
                    apiMessages.push({
                        role: c.role === 'ai' ? 'assistant' : 'user', // Groq uses 'assistant' for AI
                        content: c.message
                    });
                }
            }
        } else {
            // Guest mode fallback
            apiMessages.push({ role: "user", content: message });
        }

        const stream = await groq.chat.completions.create({
            messages: apiMessages,
            model: "llama-3.1-8b-instant",
            stream: true,
        });

        let fullAiResponse = "";

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
                fullAiResponse += content;
            }
        }

        // Save AI Response
        if (user && currentConvId) {
            await Chat.create({
                userId: user._id,
                conversationId: currentConvId,
                message: fullAiResponse,
                role: 'ai'
            });

            // Generate Title Helper (Fire and forget, don't await)
            if (isNewConv) {
                generateTitle(currentConvId, message);
            }
        }
        res.end();

    } catch (error) {
        res.write("Error: " + error.message);
        res.end();
    }
});

// Helper: Auto-Generate Title
async function generateTitle(convId, userMessage) {
    try {
        if (!process.env.GROQ_API_KEY) return;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await groq.chat.completions.create({
            messages: [
                { role: "user", content: `Generate a very short title (max 4 words) for this chat message. Do not use quotes. Message: "${userMessage}"` }
            ],
            model: "llama-3.1-8b-instant",
            stream: false
        });
        const title = response.choices[0]?.message?.content?.trim() || "New Chat";
        await Conversation.findByIdAndUpdate(convId, { title: title });
    } catch (e) { console.log("Title Gen Error", e.message); }
}

// Endpoint for quick dashboard advisor (Task 14)
router.post('/api/chatbot/ask', async (req, res) => {
    try {
        const { message } = req.body;
        if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are EduNavigator AI Advisor. Give short, professional, and actionable advice to students based on their queries. Max 2-3 sentences." },
                { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant",
        });

        res.json({ response: response.choices[0]?.message?.content || "I'm not sure, please try again." });
    } catch (error) {
        console.error("Advisor Error:", error);
        res.status(500).json({ error: "AI processing failed" });
    }
});

module.exports = router;
