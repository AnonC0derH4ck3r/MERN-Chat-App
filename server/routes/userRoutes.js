const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyJWT');
const upload = require('../middleware/upload');
const User = require('../models/User');
const {
    getSettings,
    updateSetting,
    changePassword,
    deleteAccount,
    getUserById
} = require('../controllers/userController');

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -publicKey -challenge -credentialID -counter -_id');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, updateSetting);
router.put('/change-password', authMiddleware, changePassword);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.post('/upload-avatar', authMiddleware, (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'Upload failed' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file type' });
        }

        try {
            const avatarPath = `/uploads/${req.file.filename}`;
            await User.findByIdAndUpdate(req.user.id, { avatar: avatarPath });
            res.status(200).json({
                message: 'Avatar uploaded and saved successfully',
                filename: req.file.filename,
                path: avatarPath
            });
        } catch (error) {

        }
    });
});
router.get('/:id', getUserById);

module.exports = router;