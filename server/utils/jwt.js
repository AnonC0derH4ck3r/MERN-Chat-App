const jwt = require('jsonwebtoken'),
    dotenv = require('dotenv');

dotenv.config();

const secret = process.env.JWT_SECRET;

exports.createToken = (userId) => {
    return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
};