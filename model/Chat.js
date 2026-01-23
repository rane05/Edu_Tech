const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    message: { type: String, required: true },
    role: { type: String, enum: ['user', 'ai'], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
