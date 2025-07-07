const mongoose = require('mongoose'),
    dotenv = require('dotenv');

// Load the .env variables
dotenv.config();

// connect variable
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo connected.');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;