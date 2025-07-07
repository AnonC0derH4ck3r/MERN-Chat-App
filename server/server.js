// Declare constants
const express = require("express"),
    dotenv = require("dotenv"),
    connectDB = require("./config/db"),
    cors = require("cors"),
    app = require("./app");

// Load environment variables
dotenv.config();

app.use(cors());
app.use(express.json());

// connect to NoSQL Database
connectDB();

// if `process.env.PORT` is falsy (null, undefined, false)
// set the PORT to 5000 (fallback mechanism)
const PORT = process.env.PORT || 5000;

// Display in console window
app.listen(PORT, () => globalThis.console.log(`Server running on port ${PORT}`));