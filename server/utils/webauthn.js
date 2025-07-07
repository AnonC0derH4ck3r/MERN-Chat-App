// ✅ Import from simplewebauthn with renamed aliases to avoid collisions
const {
    generateRegistrationOptions: simpleGenerateRegistrationOptions,
    verifyRegistrationResponse: simpleVerifyRegistrationResponse,
    generateAuthenticationOptions: simpleGenerateAuthenticationOptions,
    verifyAuthenticationResponse: simpleVerifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const base64url = require('base64url');

const rpName = 'MERN Chat App';
const rpID = 'localhost';
const origin = 'http://localhost:5173';

// Generate Registration Options
exports.generateRegistrationOptions = (userId, username) => {
    const userIdBuffer = Buffer.from(userId.toString(), 'utf8');

    const options = simpleGenerateRegistrationOptions({
        rpName,
        rpID,
        userDisplayName: username,
        userID: userIdBuffer,
        userName: username,
        attestationType: 'direct',
        authenticatorSelection: {
            userVerification: 'preferred',
            requireResidentKey: 'preferred',
        },
        timeout: 60000,
    });

    return options;
};

// Verify Registration Response
exports.verifyRegistrationResponse = async (attestationResponse, user) => {
    const verification = await simpleVerifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: user.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID
    });

    console.log('Verification:', verification);

    if (!verification.verified) {
        return { verified: false };
    }

    const { id: credentialID, publicKey: credentialPubKey } = verification.registrationInfo.credential;

    return {
        verified: true,
        credentialID: base64url.encode(credentialID),
        publicKey: base64url.encode(credentialPubKey),
        aaguid: verification.registrationInfo.aaguid
    };
};

// Generate Authentication Options
exports.generateAuthenticationOptions = (user) => {
    return simpleGenerateAuthenticationOptions({
        rpID,
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: []
    });
};

// Verify Authentication Response
exports.verifyAuthenticationResponse = async (assertionResponse, user) => {
    console.log('User.credentialID (raw from DB):', user.credentialID);
    const verification = await simpleVerifyAuthenticationResponse({
        response: assertionResponse,
        expectedChallenge: user.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
            id: base64url.toBuffer(user.credentialID),
            publicKey: base64url.toBuffer(user.publicKey),
            counter: user.counter ?? 0,
            transports: undefined
        },
    });

    return verification;
};