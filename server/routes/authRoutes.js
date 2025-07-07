const express = require("express"),
    router = express.Router(),
    {
        generateRegistrationOptions,
        verifyRegistration,
        generateAuthOptions,
        verifyAuth,
        signup,
        login,
        requestPasswordReset,
        resetPassword,
        verifyResetToken
    } = require('../controllers/authController'),
    User = require('../models/User');

// Passkey registration
router.post('/generate-registration-options', generateRegistrationOptions);
router.post('/verify-registration', verifyRegistration);

// Passkey login
router.post('/generate-authentication-options', generateAuthOptions);
router.post('/verify-authentication', verifyAuth);
router.post('/signup', signup);
router.post('/login', login);
router.get('/username/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ username: user.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;