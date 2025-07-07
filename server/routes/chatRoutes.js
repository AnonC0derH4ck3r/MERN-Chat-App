const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { sendMessage, sendFileMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/verifyJWT');
const validateChatAccess = require('../middleware/validateChatAccess');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const uploadChatFile = require('../middleware/uploadFile');

// GET all users (excluding password) — used on home page
router.get('/get-users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, avatar: 1, _id: 0 });
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ GET messages from a chat room (secured with JWT + room access validation)
router.get('/:roomId', authMiddleware, validateChatAccess, async (req, res) => {
    const { roomId } = req.params;

    try {
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// 
router.post('/start-room', authMiddleware, async (req, res) => {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
        return res.status(400).json({ error: 'Both users are required' });
    }

    try {
        let room = await Room.findOne({
            participants: { $all: [user1, user2] },
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        });

        if (!room) {
            room = await Room.create({ participants: [user1, user2] });
        }

        return res.json({ roomId: room._id }); // send ObjectId to frontend
    } catch (err) {
        console.error('Room creation error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// ✅ POST a new message to a room (JWT only)
router.post('/', authMiddleware, sendMessage);

// ✅ Optional: GET chat rooms of a user (by username)
router.get('/rooms/:username', authMiddleware, async (req, res) => {
    const { username } = req.params;

    try {
        const rooms = await Message.find({ senderId: username }).distinct('roomId');
        res.json({ rooms });
    } catch (error) {
        console.error('Error fetching user rooms:', error);
        res.status(500).json({ error: 'Could not fetch rooms' });
    }
});

// GET /api/chat/room-info/:roomId
router.get('/room-info/:roomId', authMiddleware, async (req, res) => {
    const { roomId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({ error: 'Invalid room ID format' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        res.json({ participants: room.participants });
    } catch (err) {
        console.error('Error fetching room info:', err);
        res.status(500).json({ error: 'Failed to get room info' });
    }
});

router.post('/send-file', uploadChatFile.single('file'), sendFileMessage);

module.exports = router;