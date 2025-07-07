// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    participants: [String], // usernames
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);