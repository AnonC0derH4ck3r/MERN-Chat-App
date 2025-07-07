const express = require('express'),
    Message = require('../models/Message'),
    User = require('../models/User'),
    path = require('path');

exports.sendMessage = async (req, res) => {
    const { roomId, senderId, content } = req.body;

    if (!roomId || !senderId || !content) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {

        const newMessage = new Message({
            roomId,
            senderId,
            content,
            timestamp: Date.now(),
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.getRoomsByUsername = async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const rooms = await Message.distinct('roomId', { senderId: username });

        if (!rooms.length) {
            return res.status(404).json({ error: 'No rooms found for this user' });
        }

        return res.status(200).json({ rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ error: 'Server error while fetching rooms' });
    }
};

exports.sendFileMessage = async (req, res) => {
    try {
        const { roomId, senderId } = req.body;
        const file = req.file;

        if (!file || !roomId || !senderId) {
            return res.status(400).json({ error: 'Missing file or required fields' });
        }

        // Detect type
        const ext = path.extname(file.originalname).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileType = imageExtensions.includes(ext) ? 'image' : 'file';

        const newMessage = new Message({
            roomId,
            senderId,
            type: fileType,
            fileUrl: `/uploads/${file.filename}`,
            originalName: file.originalname,
            content: '', // Optional for file/image
            timestamp: Date.now()
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error uploading file message:', err);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};