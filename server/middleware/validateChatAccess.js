// middleware/validateChatAccess.js
const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room'); // ✅ New rooms collection

const validateChatAccess = async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!roomId || !userId) {
        return res.status(400).json({ error: 'Missing roomId or userId' });
    }

    try {
        // ✅ Step 1: Check if the room exists in the rooms collection
        const roomExists = await Room.exists({ _id: roomId });
        if (!roomExists) {
            return res.status(404).json({ error: 'Invalid roomId' });
        }

        // ✅ Step 2: Get the username of the user from users collection
        const user = await User.findById(userId);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        // ✅ Step 3: Check if user is part of the room (optional, only if you store members)
        const room = await Room.findById(roomId);
        if (!room.participants.includes(user.username)) {
            return res.status(403).json({ error: 'You are not authorized to view this chat' });
        }

        // ✅ All good
        next();
    } catch (err) {
        console.error('Chat access validation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = validateChatAccess;