/**
 * City Explorer - API Module
 * Handles all API calls to public APIs and backend
 */

const API = {
    /**
     * Search cities using GeoDB Cities API
     * @param {string} query - City name to search
     * @returns {Promise<Array>} - List of matching cities
     */
    async searchCities(query) {
        try {
            const response = await fetch(
                `${CONFIG.ENDPOINTS.GEODB_CITIES}?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`,
                {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': CONFIG.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': CONFIG.RAPIDAPI_HOST
                    }
                }
            );
            
            // Handle rate limiting (429 Too Many Requests)
            if (response.status === 429) {
                console.warn('GeoDB API rate limit reached. Please wait a moment.');
                throw new Error('429 Rate limit - please wait');
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch cities');
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error searching cities:', error);
            throw error;
        }
    },

    /**
     * Get city details from GeoDB Cities API
     * @param {string} cityId - City ID from GeoDB
     * @returns {Promise<Object>} - City details
     */
    async getCityDetails(cityId) {
        try {
            const response = await fetch(
                `${CONFIG.ENDPOINTS.GEODB_CITIES}/${cityId}`,
                {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': CONFIG.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': CONFIG.RAPIDAPI_HOST
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch city details');
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching city details:', error);
            throw error;
        }
    },

    /**
     * Get weather data from OpenWeatherMap API
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} - Weather data
     */
    async getWeather(lat, lon) {
        try {
            const response = await fetch(
                `${CONFIG.ENDPOINTS.OPENWEATHER}?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            
            const data = await response.json();
            return {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                description: data.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                windSpeed: data.wind.speed,
                visibility: data.visibility
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    },

    /**
     * Get country information from RestCountries API
     * @param {string} countryCode - ISO 3166-1 alpha-2 country code
     * @returns {Promise<Object>} - Country information
     */
    async getCountryInfo(countryCode) {
        try {
            const response = await fetch(
                `${CONFIG.ENDPOINTS.REST_COUNTRIES}/alpha/${countryCode}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch country info');
            }
            
            const data = await response.json();
            const country = Array.isArray(data) ? data[0] : data;
            
            // Extract currency info
            const currencies = country.currencies ? Object.entries(country.currencies)[0] : null;
            const currencyInfo = currencies ? {
                code: currencies[0],
                name: currencies[1].name,
                symbol: currencies[1].symbol
            } : { code: '', name: '', symbol: '' };
            
            // Extract languages
            const languages = country.languages ? Object.values(country.languages) : [];
            
            return {
                officialName: country.name.official,
                capital: country.capital ? country.capital[0] : 'N/A',
                flag: country.flags.svg || country.flags.png,
                flagAlt: country.flags.alt || `Flag of ${country.name.common}`,
                currency: currencyInfo,
                languages: languages,
                continent: country.continents ? country.continents[0] : 'N/A',
                timezones: country.timezones || []
            };
        } catch (error) {
            console.error('Error fetching country info:', error);
            throw error;
        }
    },

    /**
     * Check authentication status
     * @returns {Promise<Object>} - Auth status and user info
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(
                `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.AUTH_STATUS}`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to check auth status');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { isAuthenticated: false, user: null };
        }
    },

    /**
     * Save city data to backend
     * @param {Object} cityData - Aggregated city data
     * @returns {Promise<Object>} - Save response
     */
    async saveCityData(cityData) {
        try {
            const response = await fetch(
                `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.SAVE_CITY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': CONFIG.APP_API_KEY
                    },
                    credentials: 'include',
                    body: JSON.stringify(cityData)
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save city data');
            }
            
            return data;
        } catch (error) {
            console.error('Error saving city data:', error);
            throw error;
        }
    },

    /**
     * Get saved records from backend
     * @param {Object} options - Query options (page, limit, userId)
     * @returns {Promise<Object>} - Records and pagination info
     */
    async getRecords(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);
            if (options.userId) params.append('userId', options.userId);
            
            const response = await fetch(
                `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.RECORDS}?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': CONFIG.APP_API_KEY
                    },
                    credentials: 'include'
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch records');
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    },

    /**
     * Delete a record from backend
     * @param {string} recordId - Record ID to delete
     * @returns {Promise<Object>} - Delete response
     */
    async deleteRecord(recordId) {
        try {
            const response = await fetch(
                `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.RECORDS}/${recordId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': CONFIG.APP_API_KEY
                    },
                    credentials: 'include'
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete record');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    },

    /**
     * Aggregate data from all APIs for a city
     * Uses Promise.all for concurrent requests
     * @param {Object} city - City object from GeoDB
     * @returns {Promise<Object>} - Aggregated city data
     */
    async aggregateCityData(city) {
        try {
            // Fetch weather and country data concurrently using Promise.all
            const [weatherData, countryData] = await Promise.all([
                this.getWeather(city.latitude, city.longitude),
                this.getCountryInfo(city.countryCode)
            ]);
            
            // Construct aggregated JSON object
            return {
                city: {
                    name: city.city || city.name,
                    country: city.country,
                    countryCode: city.countryCode,
                    region: city.region,
                    population: city.population,
                    latitude: city.latitude,
                    longitude: city.longitude
                },
                weather: weatherData,
                countryInfo: countryData
            };
        } catch (error) {
            console.error('Error aggregating city data:', error);
            throw error;
        }
    }
};
