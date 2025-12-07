const express = require('express');
const passport = require('passport');
const router = express.Router();

// @route   GET /auth/google
// @desc    Initiate Google OAuth 2.0 authentication
// @access  Public
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' 
    })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth 2.0 callback URL
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login-failed.html' 
    }),
    (req, res) => {
        // Successful authentication, redirect to home
        res.redirect('/');
    }
);

// @route   GET /auth/status
// @desc    Check authentication status
// @access  Public
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            isAuthenticated: true,
            user: {
                id: req.user.id,
                name: req.user.displayName,
                email: req.user.email,
                photo: req.user.photo
            }
        });
    } else {
        res.json({
            success: true,
            isAuthenticated: false,
            user: null
        });
    }
});

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                error: 'Error logging out' 
            });
        }
        res.redirect('/');
    });
});

module.exports = router;

