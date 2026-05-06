/**
 * Weather Service - Fetch real-time weather data
 * Using OpenWeatherMap API for accurate weather information
 */

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || null;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Get real-time weather data for a mountain location
 * @param {string} latitude - Mountain latitude
 * @param {string} longitude - Mountain longitude
 * @param {string} mountainName - Mountain name for fallback
 * @returns {Promise<Object>} Weather data object
 */
async function getWeatherData(latitude, longitude, mountainName) {
  try {
    // If no API key, return mock data
    if (!OPENWEATHER_API_KEY) {
      console.warn(`Weather API key not configured. Using mock data for ${mountainName}`);
      return getMockWeatherData(mountainName);
    }

    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric', // Use Celsius
        lang: 'id' // Indonesian language
      },
      timeout: 5000 // 5 second timeout
    });

    return formatWeatherData(response.data, mountainName);
  } catch (error) {
    console.error(`Error fetching weather for ${mountainName}:`, error.message);
    // Return mock data if API fails
    return getMockWeatherData(mountainName);
  }
}

/**
 * Format OpenWeatherMap API response to our standard format
 * @param {Object} data - OpenWeatherMap API response
 * @param {string} mountainName - Mountain name
 * @returns {Object} Formatted weather data
 */
function formatWeatherData(data, mountainName) {
  const condition = data.weather[0];
  const weatherIcons = {
    'Clear': 'fas fa-sun',
    'Clouds': 'fas fa-cloud',
    'Rain': 'fas fa-cloud-rain',
    'Drizzle': 'fas fa-cloud-rain-heavy',
    'Thunderstorm': 'fas fa-bolt',
    'Snow': 'fas fa-snowflake',
    'Mist': 'fas fa-smog',
    'Smoke': 'fas fa-smog',
    'Haze': 'fas fa-smog',
    'Dust': 'fas fa-wind',
    'Fog': 'fas fa-smog',
    'Sand': 'fas fa-wind',
    'Ash': 'fas fa-wind',
    'Squall': 'fas fa-wind',
    'Tornado': 'fas fa-tornado'
  };

  const windDirections = [
    'Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'
  ];

  // Calculate wind direction
  const windDegrees = data.wind.deg || 0;
  const windDirectionIndex = Math.round(windDegrees / 45) % 8;
  const windDirection = windDirections[windDirectionIndex];

  return {
    mountain: mountainName,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    windDirection: windDirection,
    windDegrees: data.wind.deg || 0,
    clouds: data.clouds.all,
    condition: condition.main,
    description: condition.description,
    icon: weatherIcons[condition.main] || 'fas fa-cloud',
    visibility: Math.round(data.visibility / 1000), // Convert to km
    sunrise: new Date(data.sys.sunrise * 1000),
    sunset: new Date(data.sys.sunset * 1000),
    timestamp: new Date(data.dt * 1000)
  };
}

/**
 * Get mock weather data for demonstration
 * @param {string} mountainName - Mountain name
 * @returns {Object} Mock weather data
 */
function getMockWeatherData(mountainName) {
  // Variasi data cuaca berdasarkan nama gunung
  const weatherVariations = {
    'Gunung Merbabu': {
      temperature: 18, feelsLike: 16, tempMin: 14, tempMax: 22,
      windSpeed: 8, condition: 'Berawan', humidity: 75
    },
    'Gunung Merapi': {
      temperature: 15, feelsLike: 12, tempMin: 10, tempMax: 20,
      windSpeed: 12, condition: 'Berawan Tebal', humidity: 80
    },
    'Gunung Lawu': {
      temperature: 20, feelsLike: 18, tempMin: 16, tempMax: 25,
      windSpeed: 6, condition: 'Cerah', humidity: 65
    },
    'Gunung Sindoro': {
      temperature: 17, feelsLike: 15, tempMin: 13, tempMax: 21,
      windSpeed: 7, condition: 'Berawan', humidity: 70
    },
    'Semeru': {
      temperature: 12, feelsLike: 9, tempMin: 8, tempMax: 16,
      windSpeed: 15, condition: 'Hujan Ringan', humidity: 85
    },
    'Gede Pangrango': {
      temperature: 16, feelsLike: 14, tempMin: 12, tempMax: 20,
      windSpeed: 9, condition: 'Berawan', humidity: 78
    },
    'Bromo': {
      temperature: 19, feelsLike: 17, tempMin: 15, tempMax: 24,
      windSpeed: 10, condition: 'Cerah Berawan', humidity: 68
    },
    'Slamet': {
      temperature: 14, feelsLike: 11, tempMin: 9, tempMax: 18,
      windSpeed: 11, condition: 'Berawan', humidity: 82
    },
    'Ciremai': {
      temperature: 18, feelsLike: 16, tempMin: 14, tempMax: 23,
      windSpeed: 7, condition: 'Cerah', humidity: 72
    }
  };

  const variation = weatherVariations[mountainName] || {
    temperature: 17, feelsLike: 15, tempMin: 12, tempMax: 22,
    windSpeed: 8, condition: 'Berawan', humidity: 75
  };

  const windDirections = ['Barat Laut', 'Timur', 'Selatan', 'Barat Daya', 'Utara', 'Timur Laut', 'Selatan', 'Barat'];
  const random = Math.abs(mountainName.charCodeAt(0)) % windDirections.length;

  const conditionIcons = {
    'Cerah': 'fas fa-sun',
    'Berawan': 'fas fa-cloud',
    'Berawan Tebal': 'fas fa-cloud',
    'Cerah Berawan': 'fas fa-cloud-sun',
    'Hujan Ringan': 'fas fa-cloud-rain',
  };

  return {
    mountain: mountainName,
    temperature: variation.temperature,
    feelsLike: variation.feelsLike,
    tempMin: variation.tempMin,
    tempMax: variation.tempMax,
    humidity: variation.humidity,
    pressure: 1013,
    windSpeed: variation.windSpeed,
    windDirection: windDirections[random],
    windDegrees: random * 45,
    clouds: 60,
    condition: variation.condition,
    description: variation.condition.toLowerCase(),
    icon: conditionIcons[variation.condition] || 'fas fa-cloud',
    visibility: 10,
    sunrise: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    sunset: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15 hours from now
    timestamp: new Date(),
    isRealTime: false // Mark as mock data
  };
}

/**
 * Get weather for multiple mountains
 * @param {Array} mountains - Array of mountain objects with latitude/longitude
 * @returns {Promise<Array>} Array of weather data
 */
async function getWeatherForMultipleMountains(mountains) {
  try {
    const weatherDataPromises = mountains.map(mountain =>
      getWeatherData(mountain.latitude, mountain.longitude, mountain.nama_gunung)
    );
    
    const weatherData = await Promise.all(weatherDataPromises);
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather for multiple mountains:', error);
    return mountains.map(m => getMockWeatherData(m.nama_gunung));
  }
}

/**
 * Get current UTC time
 * @returns {string} Formatted current time
 */
function getCurrentUpdateTime() {
  return new Date().toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
}

module.exports = {
  getWeatherData,
  getWeatherForMultipleMountains,
  getCurrentUpdateTime,
  getMockWeatherData
};
