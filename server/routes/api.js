const express = require('express');
const router = express.Router();
const CitySearch = require('../models/CitySearch');
const { authenticateRequest, validateApiKey, isAuthenticated } = require('../config/passport');
const { isDBConnected } = require('../config/database');

// Middleware to check DB connection
const checkDB = (req, res, next) => {
    if (!isDBConnected()) {
        return res.status(503).json({
            success: false,
            error: 'Database not connected. Please configure MongoDB in .env file.'
        });
    }
    next();
};

// @route   POST /api/save-city
// @desc    Save aggregated city data to MongoDB
// @access  Private (OAuth + API Key required)
router.post('/save-city', authenticateRequest, checkDB, async (req, res) => {
    try {
        const { city, weather, countryInfo } = req.body;
        
        // Validate required fields
        if (!city || !city.name || !city.country) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request: City name and country are required'
            });
        }
        
        // Create new search record
        const citySearch = new CitySearch({
            userId: req.user.id,
            userName: req.user.displayName,
            userEmail: req.user.email,
            city: {
                name: city.name,
                country: city.country,
                countryCode: city.countryCode || '',
                region: city.region || '',
                population: city.population || 0,
                latitude: city.latitude || 0,
                longitude: city.longitude || 0
            },
            weather: {
                temperature: weather?.temperature || 0,
                feelsLike: weather?.feelsLike || 0,
                humidity: weather?.humidity || 0,
                pressure: weather?.pressure || 0,
                description: weather?.description || '',
                icon: weather?.icon || '',
                windSpeed: weather?.windSpeed || 0,
                visibility: weather?.visibility || 0
            },
            countryInfo: {
                officialName: countryInfo?.officialName || '',
                capital: countryInfo?.capital || '',
                flag: countryInfo?.flag || '',
                flagAlt: countryInfo?.flagAlt || '',
                currency: {
                    code: countryInfo?.currency?.code || '',
                    name: countryInfo?.currency?.name || '',
                    symbol: countryInfo?.currency?.symbol || ''
                },
                languages: countryInfo?.languages || [],
                continent: countryInfo?.continent || '',
                timezones: countryInfo?.timezones || []
            }
        });
        
        // Save to database
        const savedSearch = await citySearch.save();
        
        res.status(201).json({
            success: true,
            message: 'City data saved successfully',
            data: savedSearch
        });
        
    } catch (error) {
        console.error('Error saving city data:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error: Could not save city data'
        });
    }
});

// @route   GET /api/records
// @desc    Retrieve all saved city searches
// @access  Private (OAuth + API Key required)
router.get('/records', authenticateRequest, checkDB, async (req, res) => {
    try {
        const { limit = 50, page = 1, userId } = req.query;
        
        // Build query
        const query = {};
        
        // Optionally filter by user ID
        if (userId === 'me') {
            query.userId = req.user.id;
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Fetch records
        const records = await CitySearch.find(query)
            .sort({ searchedAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Get total count for pagination
        const total = await CitySearch.countDocuments(query);
        
        res.json({
            success: true,
            data: records,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error: Could not fetch records'
        });
    }
});

// @route   GET /api/records/:id
// @desc    Retrieve a single city search record
// @access  Private (OAuth + API Key required)
router.get('/records/:id', authenticateRequest, checkDB, async (req, res) => {
    try {
        const record = await CitySearch.findById(req.params.id);
        
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Record not found'
            });
        }
        
        res.json({
            success: true,
            data: record
        });
        
    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error: Could not fetch record'
        });
    }
});

// @route   DELETE /api/records/:id
// @desc    Delete a city search record
// @access  Private (OAuth + API Key required)
router.delete('/records/:id', authenticateRequest, checkDB, async (req, res) => {
    try {
        const record = await CitySearch.findById(req.params.id);
        
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Record not found'
            });
        }
        
        // Only allow users to delete their own records
        if (record.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only delete your own records'
            });
        }
        
        await CitySearch.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Record deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error: Could not delete record'
        });
    }
});

// @route   GET /api/stats
// @desc    Get statistics about searches
// @access  Private (OAuth + API Key required)
router.get('/stats', authenticateRequest, checkDB, async (req, res) => {
    try {
        const totalSearches = await CitySearch.countDocuments();
        const mySearches = await CitySearch.countDocuments({ userId: req.user.id });
        
        // Get most searched cities
        const topCities = await CitySearch.aggregate([
            { $group: { _id: '$city.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        res.json({
            success: true,
            data: {
                totalSearches,
                mySearches,
                topCities
            }
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error: Could not fetch stats'
        });
    }
});

module.exports = router;
