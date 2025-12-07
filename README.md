# City Explorer - Real-Time City Insights Dashboard

A service-oriented web application that aggregates data from multiple public APIs to provide comprehensive city information including weather, population, and country details.

## 📋 Project Information

- **Course**: IT41073 4 - Service-Oriented Computing
- **Project Title**: City Explorer - A Real-Time City Insights Dashboard
- **Date**: December 2024

### Team Members
- Sachin Madusanka (ITBIN-2211-0038)
- Chamod Ravishanka (ITBIN-2211-0049)
- Pramuda Heshan (ITBIN-2211-0001)
- Pamudu Anupama (ITBIN-2211-0060)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Web Client     │────▶│  Node.js/Express│────▶│   MongoDB       │
│  (HTML/JS/AJAX) │     │  Backend API    │     │   Database      │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │ Fetches data from
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Public APIs                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GeoDB Cities │  │ OpenWeather  │  │ RestCountries│          │
│  │     API      │  │     API      │  │     API      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Features

- **City Search**: Search for any city worldwide
- **Data Aggregation**: Combines data from 3 public APIs using `Promise.all()`
- **Weather Information**: Real-time weather data from OpenWeatherMap
- **City Demographics**: Population and location from GeoDB Cities
- **Country Details**: Flag, currency, languages from RestCountries
- **OAuth 2.0 Authentication**: Google login for user authentication
- **API Key Security**: Application-level security with custom API keys
- **MongoDB Storage**: Persistent storage of search records
- **Records Management**: View, filter, and delete saved searches

---

## 📦 Technologies Used

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+), AJAX |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | OAuth 2.0 (Google), API Key |
| APIs | GeoDB Cities, OpenWeatherMap, RestCountries |

---

## 🛠️ Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
3. **API Keys** (see API Configuration section)

### Step 1: Clone/Download the Project

```bash
cd C:\Users\Public\CityExplorer
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` file with your credentials:

```env
# Server Configuration
PORT=3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/city-explorer

# Your API Keys (see below for how to get them)
OPENWEATHER_API_KEY=your_openweather_key
RAPIDAPI_KEY=your_rapidapi_key

# Google OAuth 2.0 (see below for setup)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_here

# Custom API Key (can be any string)
APP_API_KEY=city-explorer-api-key-2024
```

### Step 4: Update Frontend Configuration

Edit `client/js/config.js`:

```javascript
const CONFIG = {
    BACKEND_URL: 'http://localhost:3000',
    APP_API_KEY: 'city-explorer-api-key-2024',  // Must match .env
    RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE',     // Your RapidAPI key
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_KEY', // Your OpenWeather key
    // ... rest of config
};
```

### Step 5: Start the Application

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 API Configuration Guide

### 1. OpenWeatherMap API (Free)

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Create a free account
3. Navigate to "API Keys" section
4. Copy your API key
5. Add to `.env` as `OPENWEATHER_API_KEY`
6. Add to `client/js/config.js` as `OPENWEATHER_API_KEY`

### 2. GeoDB Cities API (via RapidAPI)

1. Go to [RapidAPI - GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities/)
2. Create a free RapidAPI account
3. Subscribe to the GeoDB Cities API (Basic plan is free)
4. Copy your RapidAPI key from the "X-RapidAPI-Key" header
5. Add to `.env` as `RAPIDAPI_KEY`
6. Add to `client/js/config.js` as `RAPIDAPI_KEY`

### 3. RestCountries API (Free, No Key Required)

- This API is free and doesn't require an API key
- Documentation: [RestCountries](https://restcountries.com/)

### 4. Google OAuth 2.0 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy Client ID and Client Secret
8. Add to `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## 📁 Project Structure

```
CityExplorer/
├── client/                    # Frontend files
│   ├── css/
│   │   └── styles.css        # Main stylesheet
│   ├── js/
│   │   ├── config.js         # Configuration & API keys
│   │   ├── api.js            # API calls module
│   │   └── app.js            # Main application logic
│   └── index.html            # Main HTML page
│
├── server/                    # Backend files
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── passport.js       # OAuth & Auth middleware
│   ├── models/
│   │   └── CitySearch.js     # MongoDB schema
│   ├── routes/
│   │   ├── api.js            # API routes (/api/*)
│   │   └── auth.js           # Auth routes (/auth/*)
│   └── server.js             # Express server entry point
│
├── .env.example              # Environment variables template
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth login |
| GET | `/auth/google/callback` | OAuth callback URL |
| GET | `/auth/status` | Check authentication status |
| GET | `/auth/logout` | Logout user |

### Data Endpoints (Require OAuth + API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/save-city` | Save aggregated city data |
| GET | `/api/records` | Get all saved records |
| GET | `/api/records/:id` | Get single record |
| DELETE | `/api/records/:id` | Delete a record |
| GET | `/api/stats` | Get search statistics |

### Request Headers

```
x-api-key: city-explorer-api-key-2024
Content-Type: application/json
```

---

## 📊 Data Aggregation Flow

1. User enters city name
2. Frontend calls **GeoDB Cities API** to get city details
3. Using city coordinates, frontend calls **OpenWeatherMap API**
4. Using country code, frontend calls **RestCountries API**
5. All data is combined into a single JSON object using `Promise.all()`
6. Aggregated JSON is sent to backend via AJAX POST
7. Backend validates and stores in MongoDB

### Sample Aggregated JSON

```json
{
  "city": {
    "name": "London",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "England",
    "population": 8982000,
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  "weather": {
    "temperature": 12,
    "feelsLike": 10,
    "humidity": 76,
    "pressure": 1015,
    "description": "partly cloudy",
    "icon": "https://openweathermap.org/img/wn/03d@2x.png",
    "windSpeed": 5.2
  },
  "countryInfo": {
    "officialName": "United Kingdom of Great Britain and Northern Ireland",
    "capital": "London",
    "flag": "https://flagcdn.com/gb.svg",
    "currency": {
      "code": "GBP",
      "name": "British pound",
      "symbol": "£"
    },
    "languages": ["English"],
    "continent": "Europe"
  }
}
```

---

## 🔒 Security Implementation

### 1. OAuth 2.0 (User-Level Authentication)
- Google OAuth strategy using Passport.js
- Session-based authentication
- Protects user data and personalized features

### 2. API Key (Application-Level Authentication)
- Custom `x-api-key` header required for all API requests
- Prevents unauthorized external access
- Returns 403 Forbidden if missing or invalid

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or Atlas URI is correct
   - Check firewall settings

2. **OAuth Redirect Error**
   - Verify callback URL matches Google Console exactly
   - Check GOOGLE_CLIENT_ID and SECRET

3. **CORS Error**
   - Ensure frontend URL is in server's CORS whitelist
   - Check browser console for specific origin

4. **API Rate Limit**
   - GeoDB has rate limits on free tier
   - Wait a few seconds between searches

5. **Weather Data Not Loading**
   - Verify OpenWeatherMap API key is active
   - Check browser console for API errors

---

## 📸 Screenshots

### Homepage & Search
[INSERT SCREENSHOT: Main search interface]

### Aggregated Results
[INSERT SCREENSHOT: City data dashboard showing weather, population, country info]

### MongoDB Records
[INSERT SCREENSHOT: Records page or MongoDB Atlas dashboard]

---

## 📄 License

This project is created for educational purposes as part of the Service-Oriented Computing course.

---

## 👥 Contributors

- **Sachin Madusanka** (ITBIN-2211-0038)
- **Chamod Ravishanka** (ITBIN-2211-0049)  
- **Pramuda Heshan** (ITBIN-2211-0001)
- **Pamudu Anupama** (ITBIN-2211-0060)

---

*© 2025 City Explorer - Service-Oriented Computing Project*
