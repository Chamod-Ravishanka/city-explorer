const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Passport with Google OAuth 2.0 Strategy
const configurePassport = () => {
    // Serialize user for session storage
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    // Deserialize user from session
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    // Google OAuth 2.0 Strategy Configuration
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        (accessToken, refreshToken, profile, done) => {
            // Extract user information from Google profile
            const user = {
                id: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                photo: profile.photos[0]?.value,
                provider: 'google'
            };
            return done(null, user);
        }
    ));
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Please login with Google OAuth' 
    });
};

// Middleware to validate API Key
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(403).json({ 
            success: false, 
            error: 'Forbidden: API Key is required' 
        });
    }
    
    if (apiKey !== process.env.APP_API_KEY) {
        return res.status(403).json({ 
            success: false, 
            error: 'Forbidden: Invalid API Key' 
        });
    }
    
    next();
};

// Combined middleware for both OAuth and API Key validation
const authenticateRequest = (req, res, next) => {
    // First check API Key
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.APP_API_KEY) {
        return res.status(403).json({ 
            success: false, 
            error: 'Forbidden: Invalid or missing API Key' 
        });
    }
    
    // Then check OAuth authentication
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized: Please login with Google OAuth' 
        });
    }
    
    next();
};

module.exports = {
    configurePassport,
    isAuthenticated,
    validateApiKey,
    authenticateRequest
};
