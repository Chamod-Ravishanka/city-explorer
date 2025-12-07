require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Import configurations
const { connectDB, isDBConnected } = require('./config/database');
const { configurePassport } = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Configure Passport
configurePassport();

// Middleware
// CORS configuration - Allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'City Explorer API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌍 City Explorer Server is Running!                      ║
║                                                            ║
║   📍 Local:    http://localhost:${PORT}                       ║
║   📍 Network:  http://127.0.0.1:${PORT}                       ║
║                                                            ║
║   🔐 Auth:     http://localhost:${PORT}/auth/google           ║
║   📊 API:      http://localhost:${PORT}/api                   ║
║   ❤️  Health:   http://localhost:${PORT}/health               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
