const User = require('../models/User'),
    Room = require('../models/Room'),
    Message = require('../models/Message'),
    bcrypt = require('bcryptjs');

// get users details (email and username) exclude (password, publicKey, challenge, credentialID, counter, _id)
exports.getSettings = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password -publicKey -challenge -counter -_id -__v -aaguid');
    res.json(user);
}

// update users settings
exports.updateSetting = async (req, res) => {
    const updates = req.body;

    try {
        const user = await User.findById(req.user.id);
        const oldUsername = user.username;
        const newUsername = updates.username;

        const usernameChanged = newUsername && newUsername !== oldUsername;

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

        if (usernameChanged) {
            // ✅ 1. Update chat rooms
            await Room.updateMany(
                { participants: oldUsername },
                { $set: { 'participants.$[elem]': newUsername } },
                { arrayFilters: [{ elem: oldUsername }] }
            );

            // ✅ 2. Update senderId in messages
            await Message.updateMany(
                { senderId: oldUsername },
                { $set: { senderId: newUsername } }
            );
        }

        res.json({ message: 'Profile updated.' });
    } catch (error) {
        console.error('Failed to update user settings:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// change users password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
}

// delete user's account
exports.deleteAccount = async (req, res) => {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
}

// get user by ID (username, email, profilePicUrl)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email aaguid avatar');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('Error in getUserById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};