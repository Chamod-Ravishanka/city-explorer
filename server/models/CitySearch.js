const mongoose = require('mongoose');

const citySearchSchema = new mongoose.Schema({
    // User who performed the search
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    
    // City Information (from GeoDB Cities API)
    city: {
        name: { type: String, required: true },
        country: { type: String, required: true },
        countryCode: { type: String },
        region: { type: String },
        population: { type: Number },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    
    // Weather Information (from OpenWeatherMap API)
    weather: {
        temperature: { type: Number },
        feelsLike: { type: Number },
        humidity: { type: Number },
        pressure: { type: Number },
        description: { type: String },
        icon: { type: String },
        windSpeed: { type: Number },
        visibility: { type: Number }
    },
    
    // Country Information (from RestCountries API)
    countryInfo: {
        officialName: { type: String },
        capital: { type: String },
        flag: { type: String },
        flagAlt: { type: String },
        currency: {
            code: { type: String },
            name: { type: String },
            symbol: { type: String }
        },
        languages: [{ type: String }],
        continent: { type: String },
        timezones: [{ type: String }]
    },
    
    // Metadata
    searchedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
citySearchSchema.index({ userId: 1, searchedAt: -1 });
citySearchSchema.index({ 'city.name': 1 });

module.exports = mongoose.model('CitySearch', citySearchSchema);
