/**
 * City Explorer - Main Application Module
 * Handles UI interactions and application logic
 */

// Application State
const App = {
    currentUser: null,
    currentCityData: null,
    currentPage: 1,
    filterMode: 'all',
    searchTimeout: null,
    
    // DOM Elements
    elements: {},
    
    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkAuth();
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Auth elements
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            userInfo: document.getElementById('user-info'),
            userPhoto: document.getElementById('user-photo'),
            userName: document.getElementById('user-name'),
            
            // Search elements
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            suggestions: document.getElementById('suggestions'),
            loading: document.getElementById('loading'),
            results: document.getElementById('results'),
            
            // Result elements
            countryFlag: document.getElementById('country-flag'),
            cityName: document.getElementById('city-name'),
            cityRegion: document.getElementById('city-region'),
            cityPopulation: document.getElementById('city-population'),
            cityCoords: document.getElementById('city-coords'),
            weatherIcon: document.getElementById('weather-icon'),
            weatherDescription: document.getElementById('weather-description'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            countryName: document.getElementById('country-name'),
            countryOfficial: document.getElementById('country-official'),
            countryCapital: document.getElementById('country-capital'),
            countryCurrency: document.getElementById('country-currency'),
            countryLanguages: document.getElementById('country-languages'),
            countryContinent: document.getElementById('country-continent'),
            countryTimezone: document.getElementById('country-timezone'),
            
            // Save elements
            saveBtn: document.getElementById('save-btn'),
            saveStatus: document.getElementById('save-status'),
            
            // Navigation
            navLinks: document.querySelectorAll('.nav-link'),
            searchSection: document.getElementById('search-section'),
            recordsSection: document.getElementById('records-section'),
            
            // Records elements
            recordsList: document.getElementById('records-list'),
            recordsLoading: document.getElementById('records-loading'),
            noRecords: document.getElementById('no-records'),
            filterAll: document.getElementById('filter-all'),
            filterMine: document.getElementById('filter-mine'),
            pagination: document.getElementById('pagination'),
            prevPage: document.getElementById('prev-page'),
            nextPage: document.getElementById('next-page'),
            pageInfo: document.getElementById('page-info'),
            
            // Toast
            toast: document.getElementById('toast')
        };
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Auth events
        this.elements.loginBtn.addEventListener('click', () => this.login());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        // Search events
        this.elements.cityInput.addEventListener('input', (e) => this.handleCityInput(e));
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });
        this.elements.searchBtn.addEventListener('click', () => this.searchCity());
        
        // Save event
        this.elements.saveBtn.addEventListener('click', () => this.saveToDatabase());
        
        // Navigation events
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Records filter events
        this.elements.filterAll.addEventListener('click', () => this.setFilter('all'));
        this.elements.filterMine.addEventListener('click', () => this.setFilter('mine'));
        
        // Pagination events
        this.elements.prevPage.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPage.addEventListener('click', () => this.changePage(1));
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                this.elements.suggestions.classList.add('hidden');
            }
        });
    },
    
    /**
     * Check authentication status
     */
    async checkAuth() {
        try {
            const response = await API.checkAuthStatus();
            if (response.isAuthenticated && response.user) {
                this.currentUser = response.user;
                this.updateAuthUI(true);
            } else {
                this.currentUser = null;
                this.updateAuthUI(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            this.currentUser = null;
            this.updateAuthUI(false);
        }
    },
    
    /**
     * Update UI based on authentication status
     */
    updateAuthUI(isAuthenticated) {
        if (isAuthenticated && this.currentUser) {
            this.elements.loginBtn.classList.add('hidden');
            this.elements.userInfo.classList.remove('hidden');
            const userName = encodeURIComponent(this.currentUser.name || 'User');
            this.elements.userPhoto.src = this.currentUser.photo || `https://ui-avatars.com/api/?name=${userName}&background=6366f1&color=fff&size=100`;
            this.elements.userPhoto.onerror = () => { this.elements.userPhoto.src = `https://ui-avatars.com/api/?name=${userName}&background=6366f1&color=fff&size=100`; };
            this.elements.userName.textContent = this.currentUser.name;
            this.elements.saveBtn.disabled = false;
        } else {
            this.elements.loginBtn.classList.remove('hidden');
            this.elements.userInfo.classList.add('hidden');
            this.elements.saveBtn.disabled = true;
        }
    },
    
    /**
     * Redirect to Google OAuth login
     */
    login() {
        window.location.href = `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.AUTH_GOOGLE}`;
    },
    
    /**
     * Logout user
     */
    logout() {
        window.location.href = `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.AUTH_LOGOUT}`;
    },
    
    /**
     * Handle city input with debounce
     */
    handleCityInput(e) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Hide suggestions if query is too short
        if (query.length < 2) {
            this.elements.suggestions.classList.add('hidden');
            return;
        }
        
        // Debounce search (500ms to avoid rate limiting)
        this.searchTimeout = setTimeout(() => {
            this.fetchCitySuggestions(query);
        }, 500);
    },
    
    /**
     * Fetch city suggestions from GeoDB API
     */
    async fetchCitySuggestions(query) {
        try {
            const cities = await API.searchCities(query);
            this.displaySuggestions(cities);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            // Only show error if it's not a rate limit issue (429)
            // GeoDB API has rate limits, so we don't want to spam error toasts
            if (error.message && !error.message.includes('429')) {
                this.showToast('Failed to fetch city suggestions', 'error');
            }
            this.elements.suggestions.classList.add('hidden');
        }
    },
    
    /**
     * Display city suggestions dropdown
     */
    displaySuggestions(cities) {
        if (!cities || cities.length === 0) {
            this.elements.suggestions.classList.add('hidden');
            return;
        }
        
        this.elements.suggestions.innerHTML = cities.map(city => `
            <div class="suggestion-item" data-city='${JSON.stringify(city)}'>
                <img src="https://flagcdn.com/w40/${city.countryCode.toLowerCase()}.png" 
                     alt="${city.country}" 
                     onerror="this.src='https://via.placeholder.com/24x16'">
                <div>
                    <strong>${city.city || city.name}</strong>
                    <span style="color: var(--gray); font-size: 0.85rem;">
                        ${city.region ? city.region + ', ' : ''}${city.country}
                    </span>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to suggestions
        this.elements.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = JSON.parse(item.dataset.city);
                this.selectCity(city);
            });
        });
        
        this.elements.suggestions.classList.remove('hidden');
    },
    
    /**
     * Select a city and fetch its data
     */
    async selectCity(city) {
        this.elements.cityInput.value = `${city.city || city.name}, ${city.country}`;
        this.elements.suggestions.classList.add('hidden');
        await this.fetchCityData(city);
    },
    
    /**
     * Search city by name
     */
    async searchCity() {
        const query = this.elements.cityInput.value.trim();

        if (!query) {
            this.showToast('Please enter a city name', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            
            // Search for cities using GeoDB API
            const cities = await API.searchCities(query);
            
            if (!cities || cities.length === 0) {
                this.showToast('No cities found. Try a different search.', 'warning');
                this.showLoading(false);
                return;
            }
            
            // Use the first matching city
            const city = cities[0];
            
            // Aggregate data from all APIs
            const aggregatedData = await API.aggregateCityData(city);
            this.currentCityData = aggregatedData;
            
            // Display results
            this.displayResults(aggregatedData);
            this.showLoading(false);
            this.showToast('City data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error searching city:', error);
            this.showToast('Failed to fetch city data. Check your API keys.', 'error');
            this.showLoading(false);
        }
    },

    /**
     * Fetch and display city data
     */
    async fetchCityData(city) {
        try {
            this.showLoading(true);
            
            // Aggregate data from all APIs using Promise.all
            const aggregatedData = await API.aggregateCityData(city);
            this.currentCityData = aggregatedData;
            
            // Display results
            this.displayResults(aggregatedData);
            
            this.showLoading(false);
            this.showToast('City data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error fetching city data:', error);
            this.showToast('Failed to fetch city data. Check your API keys.', 'error');
            this.showLoading(false);
        }
    },
    
    /**
     * Display aggregated results
     */
    displayResults(data) {
        const { city, weather, countryInfo } = data;
        
        // City information
        this.elements.countryFlag.src = countryInfo.flag;
        this.elements.countryFlag.alt = countryInfo.flagAlt;
        this.elements.cityName.textContent = city.name;
        this.elements.cityRegion.textContent = `${city.region ? city.region + ', ' : ''}${city.country}`;
        this.elements.cityPopulation.textContent = this.formatNumber(city.population);
        this.elements.cityCoords.textContent = `${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}`;
        
        // Weather information
        this.elements.weatherIcon.src = weather.icon;
        this.elements.weatherDescription.textContent = this.capitalizeFirst(weather.description);
        this.elements.temperature.textContent = weather.temperature;
        this.elements.feelsLike.textContent = `${weather.feelsLike}°C`;
        this.elements.humidity.textContent = `${weather.humidity}%`;
        this.elements.windSpeed.textContent = `${weather.windSpeed} m/s`;
        this.elements.pressure.textContent = `${weather.pressure} hPa`;
        
        // Country information
        this.elements.countryName.textContent = city.country;
        this.elements.countryOfficial.textContent = countryInfo.officialName;
        this.elements.countryCapital.textContent = countryInfo.capital;
        this.elements.countryCurrency.textContent = 
            `${countryInfo.currency.name} (${countryInfo.currency.symbol})`;
        this.elements.countryLanguages.textContent = countryInfo.languages.join(', ');
        this.elements.countryContinent.textContent = countryInfo.continent;
        this.elements.countryTimezone.textContent = countryInfo.timezones[0] || 'N/A';
        
        // Show results and clear save status
        this.elements.results.classList.remove('hidden');
        this.elements.saveStatus.textContent = '';
        this.elements.saveStatus.className = 'save-status';
    },
    
    /**
     * Save city data to database
     */
    async saveToDatabase() {
        if (!this.currentCityData) {
            this.showToast('No city data to save', 'warning');
            return;
        }
        
        if (!this.currentUser) {
            this.showToast('Please login to save data', 'warning');
            return;
        }
        
        this.elements.saveBtn.disabled = true;
        this.elements.saveStatus.textContent = 'Saving...';
        
        try {
            await API.saveCityData(this.currentCityData);
            this.elements.saveStatus.textContent = '✓ Saved successfully!';
            this.elements.saveStatus.className = 'save-status success';
            this.showToast('City data saved to database!', 'success');
        } catch (error) {
            console.error('Error saving city data:', error);
            this.elements.saveStatus.textContent = '✗ Failed to save';
            this.elements.saveStatus.className = 'save-status error';
            this.showToast('Failed to save city data', 'error');
        } finally {
            this.elements.saveBtn.disabled = false;
        }
    },
    
    /**
     * Handle navigation
     */
    handleNavigation(e) {
        e.preventDefault();
        
        const target = e.target.closest('.nav-link');
        const href = target.getAttribute('href');
        
        // Update active state
        this.elements.navLinks.forEach(link => link.classList.remove('active'));
        target.classList.add('active');
        
        // Show/hide sections
        if (href === '#search-section') {
            this.elements.searchSection.classList.remove('hidden');
            this.elements.recordsSection.classList.add('hidden');
        } else if (href === '#records-section') {
            this.elements.searchSection.classList.add('hidden');
            this.elements.recordsSection.classList.remove('hidden');
            this.loadRecords();
        }
    },
    
    /**
     * Set records filter
     */
    setFilter(mode) {
        this.filterMode = mode;
        this.currentPage = 1;
        
        this.elements.filterAll.classList.toggle('active', mode === 'all');
        this.elements.filterMine.classList.toggle('active', mode === 'mine');
        
        this.loadRecords();
    },
    
    /**
     * Load records from database
     */
    async loadRecords() {
        this.elements.recordsLoading.classList.remove('hidden');
        this.elements.recordsList.innerHTML = '';
        this.elements.noRecords.classList.add('hidden');
        
        try {
            const options = {
                page: this.currentPage,
                limit: 10
            };
            
            // Filter by user if "My Records" is selected
            if (this.filterMode === 'mine' && this.currentUser) {
                options.userId = 'me';  // Backend expects 'me' to filter by current user
            }
            
            const response = await API.getRecords(options);
            this.elements.recordsLoading.classList.add('hidden');
            
            // API returns 'data' not 'records'
            const records = response.data || response.records || [];
            
            if (!records || records.length === 0) {
                this.elements.noRecords.classList.remove('hidden');
                this.elements.pagination.classList.add('hidden');
                return;
            }
            
            this.displayRecords(records);
            this.updatePagination(response.pagination);
        } catch (error) {
            console.error('Error loading records:', error);
            this.elements.recordsLoading.classList.add('hidden');
            this.elements.noRecords.classList.remove('hidden');
            this.showToast('Failed to load records', 'error');
        }
    },
    
    /**
     * Display records list
     */
    displayRecords(records) {
        this.elements.recordsList.innerHTML = records.map(record => `
            <div class="record-item">
                <img src="${record.countryInfo?.flag || 'https://via.placeholder.com/48x32'}" 
                     alt="Flag" 
                     class="record-flag"
                     onerror="this.src='https://via.placeholder.com/48x32'">
                <div class="record-info">
                    <h4>${record.city?.name || 'Unknown'}, ${record.city?.country || ''}</h4>
                    <p>Population: ${this.formatNumber(record.city?.population || 0)}</p>
                </div>
                <div class="record-weather">
                    <img src="${record.weather?.icon || ''}" alt="Weather" style="width: 40px;">
                    <span class="record-temp">${record.weather?.temperature || 0}°C</span>
                </div>
                <div class="record-meta">
                    <p>${this.formatDate(record.searchedAt)}</p>
                    <p>${record.userName || 'Anonymous'}</p>
                    ${record.userId === this.currentUser?.id ? 
                        `<button class="record-delete" data-id="${record._id}">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                </div>
            </div>
        `).join('');
        
        // Add delete event listeners
        this.elements.recordsList.querySelectorAll('.record-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.closest('.record-delete').dataset.id;
                this.deleteRecord(recordId);
            });
        });
    },
    
    /**
     * Delete a record
     */
    async deleteRecord(recordId) {
        if (!confirm('Are you sure you want to delete this record?')) {
            return;
        }
        
        try {
            await API.deleteRecord(recordId);
            this.showToast('Record deleted successfully', 'success');
            this.loadRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            this.showToast('Failed to delete record', 'error');
        }
    },
    
    /**
     * Update pagination UI
     */
    updatePagination(pagination) {
        if (pagination.pages <= 1) {
            this.elements.pagination.classList.add('hidden');
            return;
        }
        
        this.elements.pagination.classList.remove('hidden');
        this.elements.pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
        this.elements.prevPage.disabled = pagination.page <= 1;
        this.elements.nextPage.disabled = pagination.page >= pagination.pages;
    },
    
    /**
     * Change page
     */
    changePage(direction) {
        this.currentPage += direction;
        this.loadRecords();
    },
    
    /**
     * Show/hide loading spinner
     */
    showLoading(show) {
        if (show) {
            this.elements.loading.classList.remove('hidden');
            this.elements.results.classList.add('hidden');
        } else {
            this.elements.loading.classList.add('hidden');
        }
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = this.elements.toast;
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `toast-icon ${icons[type] || icons.info}`;
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },
    
    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Format date
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});



