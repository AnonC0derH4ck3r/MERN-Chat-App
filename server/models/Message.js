const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: '' // Empty for file/image messages
    },
    fileUrl: {
        type: String // Path to file/image in /uploads/
    },
    originalName: {
        type: String // Store the original filename (e.g., "resume.pdf")
    },
    type: {
        type: String,
        enum: ['text', 'file', 'image'],
        default: 'text'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);