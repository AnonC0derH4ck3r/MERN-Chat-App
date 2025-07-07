const User = require('../models/User'),
    {
        generateRegistrationOptions: genRegOptions,
        verifyRegistrationResponse,
        generateAuthenticationOptions: genAuthOptions,
        verifyAuthenticationResponse
    } = require('../utils/webauthn'),
    jwt = require('../utils/jwt'),
    base64url = require('base64url'),
    bcrypt = require('bcryptjs'),
    nodemailer = require('nodemailer'),
    dotenv = require('dotenv'),
    crypto = require('crypto');


dotenv.config();

// 1. Generate options for passkey registration
exports.generateRegistrationOptions = async (req, res) => {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
        user = await User.create({ username });
    }

    const options = await genRegOptions(user._id.toString(), username);
    user.challenge = base64url.encode(options.challenge);
    await user.save();

    res.json(options);
}

// 2. Verify registration and store credentials
exports.verifyRegistration = async (req, res) => {
    const { username, attestationResponse } = req.body,
        user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const verification = await verifyRegistrationResponse(attestationResponse, user);

    if (!verification.verified) {
        return res.status(400).json({
            error: 'Verification failed'
        });
    }

    user.credentialID = verification.credentialID;
    user.publicKey = verification.publicKey;
    user.aaguid = verification.aaguid;
    user.challenge = undefined;
    await user.save();

    const token = jwt.createToken(user._id);
    res.json({ verified: true, token, aaguid: verification.aaguid });
}

// 3. Generate options for passkey login
exports.generateAuthOptions = async (req, res) => {
    const { username } = req.body,
        user = await User.findOne({ username });

    if (!user) return res.status(200).json({ error: 'User not found' });

    const options = await genAuthOptions(user);
    user.challenge = base64url.encode(options.challenge);
    await user.save();

    res.json(options);
}

// 4. Verify login
exports.verifyAuth = async (req, res) => {
    const { username, assertionResponse } = req.body,
        user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found ' });

    const verification = await verifyAuthenticationResponse(assertionResponse, user);

    if (!verification.verified) return res.status(401).json({ error: 'Invalid login ' });
    const { newCounter } = verification.authenticationInfo;
    user.counter = newCounter;
    await user.save();

    const token = jwt.createToken(user._id);
    res.json({ verified: true, token });
}

exports.signup = async (req, res) => {
    const { username, email, pass } = req.body;
    try {
        const existingUser = await User.find({ $or: [{ email }, { username }] });
        if (existingUser.length > 0) return res.status(400).json({ error: 'Email or username already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(pass, 12),
            user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed', details: error.message });
    }
}

exports.login = async (req, res) => {
    const { username, pass } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "User doesn't exist with that username." });
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Check if user has passkey
        const hasPasskey = user.aaguid;
        // console.log(user.aaguid, user.counter);

        if (hasPasskey) {
            // Don't send JWT, just indicate passkey requirement
            return res.status(200).json({ passkey: true, message: 'Passkey required for login' });
        }

        // No passkey, proceed with token login
        const loginToken = jwt.createToken(user._id);
        res.status(200).json({ message: 'Login Successful', token: loginToken });

    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'No user with that email' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 1000 * 60 * 15; // 15 min

        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        // Configure email transport (Gmail or custom SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',   // smtp server domain
            auth: {
                user: process.env.EMAIL, // your gmail address
                pass: process.env.PASS     // your APP password
            }
        });

        // Mail options
        const mailOptions = {
            from: '"MERN Chat" <yourgmail@gmail.com>',
            to: user.email,
            subject: 'Password Reset - MERN Chat App',
            html: `
                <div style="background-color: #0d0d0d; padding: 30px; border-radius: 10px; color: #ffffff; font-family: sans-serif; max-width: 600px; margin: auto;">
                
                    <style>
                    a.button:hover {
                        background-color: #00bcd4 !important;
                        color: #ffffff !important;
                    }
                    </style>

                    <h2 style="color: #00e5ff;">👋 Hello ${user.username},</h2>

                    <p style="font-size: 16px; line-height: 1.5;">
                    We received a request to reset the password for your MERN Chat account.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                    <a
                        href="${resetLink}"
                        class="button"
                        style="background-color: #00e5ff; color: #000000; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;"
                    >
                        Reset Password
                    </a>
                    </div>

                    <p style="font-size: 14px; color: #cccccc;">
                    ⚠️ This link is valid for <strong>15 minutes</strong>. If you didn’t request this, you can safely ignore this email.
                    </p>

                    <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;" />

                    <p style="font-size: 13px; color: #777;">
                    🛡️ MERN Chat — Secure & Private Messaging
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Reset link sent! Check your email.' });
    } catch (err) {
        console.error('Error sending reset email:', err);
        res.status(500).json({ error: 'Failed to send reset link' });
    }
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Reset link is invalid or expired.' });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(500).json({ error: 'Server error while verifying token.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password successfully updated. You can now log in.' });
    } catch (err) {
        console.error('Reset error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};