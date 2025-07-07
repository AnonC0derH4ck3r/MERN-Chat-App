// Declare constants
const express = require("express"),
    cors = require("cors"),
    authRoutes = require("./routes/authRoutes"),
    userRoutes = require("./routes/userRoutes"),
    chatRoutes = require("./routes/chatRoutes"),
    dotenv = require("dotenv"),
    path = require("path"),
    // initialize app handle
    app = express();

// Load .env variables
dotenv.config();

// enable cors (Cross Origin Resource Sharing)
// so our Front-end (netlify) can communicate with Back-end (Render)
// without Browser blocking (CORS issues)
app.use(cors({
    // [ In development, I'll keep it commented, as I often open by web app in local area network ]
    // origin: process.env.FRONTEND_URL,
    // credentials: !0
}));

// set the response to JSON (Content-Type: application/json)
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// set the route for authentication
app.use('/api/auth', authRoutes);

// Set the routes for user
app.use('/api/user', userRoutes);

// Set upload endpoint
app.use('/api/user/upload-avatar', userRoutes);

// To be able to download the file
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath); // ← This forces download
});

// Return message in response
app.get('/', (req, res) => {
    res.send('Chat app backend is running!');
});

// Chat message routes
app.use('/api/chat', chatRoutes);

// module.exports because we using type as commonjs
module.exports = app;