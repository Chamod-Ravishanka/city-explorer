/**
 * City Explorer - Configuration File
 * Contains API keys and endpoints configuration
 * 
 * IMPORTANT: Copy this file to config.local.js and add your real API keys there
 * The config.local.js file is ignored by git
 */

const CONFIG = {
    // Backend API Configuration
    BACKEND_URL: 'http://localhost:3000',

    // Custom API Key for backend authentication
    APP_API_KEY: 'city-explorer-api-key-2024',

    // Public API Keys (Frontend)
    // Get your own keys from the respective services
    RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE', // Get from https://rapidapi.com/
    RAPIDAPI_HOST: 'wft-geo-db.p.rapidapi.com',

    // OpenWeatherMap API Key
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_KEY_HERE', // Get from https://openweathermap.org/api

    // API Endpoints
    ENDPOINTS: {
        GEODB_CITIES: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
        OPENWEATHER: 'https://api.openweathermap.org/data/2.5/weather',
        REST_COUNTRIES: 'https://restcountries.com/v3.1',
        AUTH_STATUS: '/auth/status',
        AUTH_GOOGLE: '/auth/google',
        AUTH_LOGOUT: '/auth/logout',
        SAVE_CITY: '/api/save-city',
        RECORDS: '/api/records',
        STATS: '/api/stats'
    }
};

Object.freeze(CONFIG);
Object.freeze(CONFIG.ENDPOINTS);
