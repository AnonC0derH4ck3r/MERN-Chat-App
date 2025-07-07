const mongoose = require('mongoose'),
    UserSchema = new mongoose.Schema({
        username: { type: String, unique: false },
        email: { type: String, unique: false },
        password: { type: String }, // fallback login
        credentialID: { type: String },  // WebAuthn
        publicKey: { type: String },
        challenge: { type: String },
        aaguid: { type: String },
        counter: { type: Number, default: 0 },
        avatar: { type: String },
        resetToken: { type: String },
        resetTokenExpiry: { type: Date }
    });

module.exports = mongoose.model('User', UserSchema);