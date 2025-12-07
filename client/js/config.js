/**
 * City Explorer - Configuration File
 * Contains API keys and endpoints configuration
 */

const CONFIG = {
    // Backend API Configuration
    BACKEND_URL: 'http://localhost:3000',
    
    // Custom API Key for backend authentication
    // This must match the APP_API_KEY in your .env file
    APP_API_KEY: 'city-explorer-api-key-2024',
    
    // Public API Keys (Frontend)
    // Note: For GeoDB Cities API, we use RapidAPI
    RAPIDAPI_KEY: '81b89ec215mshd3ed63648c64a3cp1c1788jsn0de9a67657d6', // Get from https://rapidapi.com/
    RAPIDAPI_HOST: 'wft-geo-db.p.rapidapi.com',
    
    // OpenWeatherMap API Key
    // Get your free API key from: https://openweathermap.org/api
    OPENWEATHER_API_KEY: '411b16aa04a3b329e0f4ef991f513476',
    
    // API Endpoints
    ENDPOINTS: {
        // GeoDB Cities API (via RapidAPI)
        GEODB_CITIES: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
        
        // OpenWeatherMap API
        OPENWEATHER: 'https://api.openweathermap.org/data/2.5/weather',
        
        // RestCountries API (Free, no API key needed)
        REST_COUNTRIES: 'https://restcountries.com/v3.1',
        
        // Backend endpoints
        AUTH_STATUS: '/auth/status',
        AUTH_GOOGLE: '/auth/google',
        AUTH_LOGOUT: '/auth/logout',
        SAVE_CITY: '/api/save-city',
        RECORDS: '/api/records',
        STATS: '/api/stats'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.ENDPOINTS);

