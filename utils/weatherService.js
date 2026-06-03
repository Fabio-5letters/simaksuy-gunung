/**
 * Weather Service - Fetch real-time weather data
 * Using Open-Meteo API (Free, No API Key Required)
 * Documentation: https://open-meteo.com/en/docs
 */

const axios = require('axios');

const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * WMO Weather Interpretation Codes
 * Reference: https://www.noaa.gov/media/en/infographics/wmo-weather-codes
 */
const weatherCodeMap = {
  0: { condition: 'Cerah', icon: 'fas fa-sun', color: 'green' },
  1: { condition: 'Cerah Sebagian', icon: 'fas fa-cloud-sun', color: 'green' },
  2: { condition: 'Berawan Sebagian', icon: 'fas fa-cloud-sun', color: 'yellow' },
  3: { condition: 'Berawan', icon: 'fas fa-cloud', color: 'yellow' },
  45: { condition: 'Berkabut', icon: 'fas fa-smog', color: 'yellow' },
  48: { condition: 'Kabut Berembun', icon: 'fas fa-smog', color: 'yellow' },
  51: { condition: 'Gerimis Ringan', icon: 'fas fa-cloud-rain', color: 'yellow' },
  53: { condition: 'Gerimis', icon: 'fas fa-cloud-rain', color: 'yellow' },
  55: { condition: 'Gerimis Lebat', icon: 'fas fa-cloud-rain', color: 'red' },
  61: { condition: 'Hujan Ringan', icon: 'fas fa-cloud-rain', color: 'yellow' },
  63: { condition: 'Hujan', icon: 'fas fa-cloud-rain', color: 'red' },
  65: { condition: 'Hujan Lebat', icon: 'fas fa-cloud-rain', color: 'red' },
  71: { condition: 'Salju Ringan', icon: 'fas fa-snowflake', color: 'yellow' },
  73: { condition: 'Salju', icon: 'fas fa-snowflake', color: 'red' },
  75: { condition: 'Salju Lebat', icon: 'fas fa-snowflake', color: 'red' },
  77: { condition: 'Butir Salju', icon: 'fas fa-snowflake', color: 'red' },
  80: { condition: 'Hujan Rintik Ringan', icon: 'fas fa-cloud-rain', color: 'yellow' },
  81: { condition: 'Hujan Rintik', icon: 'fas fa-cloud-rain', color: 'red' },
  82: { condition: 'Hujan Rintik Lebat', icon: 'fas fa-cloud-rain', color: 'red' },
  85: { condition: 'Salju Rintik Ringan', icon: 'fas fa-snowflake', color: 'yellow' },
  86: { condition: 'Salju Rintik Lebat', icon: 'fas fa-snowflake', color: 'red' },
  95: { condition: 'Badai Petir', icon: 'fas fa-bolt', color: 'red' },
  96: { condition: 'Badai dengan Es Ringan', icon: 'fas fa-bolt', color: 'red' },
  99: { condition: 'Badai dengan Es Lebat', icon: 'fas fa-bolt', color: 'red' }
};

/**
 * Get weather info from WMO code
 * @param {number} code - WMO weather code
 * @returns {Object} Weather information
 */
function getWeatherInfoFromCode(code) {
  return weatherCodeMap[code] || { 
    condition: 'Tidak Diketahui', 
    icon: 'fas fa-cloud-question', 
    color: 'gray' 
  };
}

/**
 * Get real-time weather data for a mountain location using Open-Meteo API
 * @param {number} latitude - Mountain latitude
 * @param {number} longitude - Mountain longitude
 * @param {string} mountainName - Mountain name
 * @returns {Promise<Object>} Weather data object
 */
async function getWeatherData(latitude, longitude, mountainName) {
  try {
    const response = await axios.get(OPENMETEO_BASE_URL, {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,rain',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        daily_precipitation_unit: 'mm',
        wind_speed_unit: 'kmh',
        timezone: 'Asia/Jakarta',
        forecast_days: 7
      },
      timeout: 8000
    });

    if (!response.data || !response.data.current) {
      return getMockWeatherData(mountainName);
    }

    return formatWeatherData(response.data, mountainName);
  } catch (error) {
    console.error(`Error fetching weather for ${mountainName}:`, error.message);
    return getMockWeatherData(mountainName);
  }
}

/**
 * Format Open-Meteo API response to our standard format
 * @param {Object} data - Open-Meteo API response
 * @param {string} mountainName - Mountain name
 * @returns {Object} Formatted weather data
 */
function formatWeatherData(data, mountainName) {
  const current = data.current;
  const daily = data.daily;
  
  const weatherInfo = getWeatherInfoFromCode(current.weather_code);
  
  // Forecast untuk 7 hari ke depan
  const forecast = [];
  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const forecastInfo = getWeatherInfoFromCode(daily.weather_code[i]);
    forecast.push({
      date: new Date(daily.time[i]),
      condition: forecastInfo.condition,
      icon: forecastInfo.icon,
      color: forecastInfo.color,
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipitation: Math.round(daily.precipitation_sum[i] * 10) / 10,
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
      weatherCode: daily.weather_code[i]
    });
  }

  // Estimasi peluang hujan berdasarkan precipitation
  const rainChance = current.rain > 0 ? Math.min(current.rain * 20, 100) : 0;

  return {
    mountain: mountainName,
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    precipitation: current.precipitation || 0,
    condition: weatherInfo.condition,
    icon: weatherInfo.icon,
    color: weatherInfo.color,
    rainChance: Math.round(rainChance),
    weatherCode: current.weather_code,
    forecast: forecast,
    timestamp: new Date(),
    isRealTime: true
  };
}

/**
 * Get mock weather data for demonstration (fallback)
 * @param {string} mountainName - Mountain name
 * @returns {Object} Mock weather data
 */
function getMockWeatherData(mountainName) {
  // Variasi data cuaca berdasarkan nama gunung
  const weatherVariations = {
    'Gunung Merbabu': { tempCode: 1, temp: 18, humidity: 75, wind: 8 },
    'Gunung Merapi': { tempCode: 3, temp: 15, humidity: 80, wind: 12 },
    'Gunung Lawu': { tempCode: 0, temp: 20, humidity: 65, wind: 6 },
    'Gunung Sindoro': { tempCode: 2, temp: 17, humidity: 70, wind: 7 },
    'Semeru': { tempCode: 61, temp: 12, humidity: 85, wind: 15 },
    'Gede Pangrango': { tempCode: 2, temp: 16, humidity: 78, wind: 9 },
    'Bromo': { tempCode: 1, temp: 19, humidity: 68, wind: 10 },
    'Slamet': { tempCode: 3, temp: 14, humidity: 82, wind: 11 },
    'Ciremai': { tempCode: 0, temp: 18, humidity: 72, wind: 7 }
  };

  const variation = weatherVariations[mountainName] || { tempCode: 1, temp: 17, humidity: 75, wind: 8 };
  const weatherInfo = getWeatherInfoFromCode(variation.tempCode);

  // Generate mock forecast
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const randomCode = Object.keys(weatherCodeMap)[Math.floor(Math.random() * 10)];
    const fInfo = getWeatherInfoFromCode(parseInt(randomCode));
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      condition: fInfo.condition,
      icon: fInfo.icon,
      color: fInfo.color,
      tempMax: variation.temp + Math.floor(Math.random() * 5),
      tempMin: variation.temp - Math.floor(Math.random() * 5),
      precipitation: Math.floor(Math.random() * 20),
      windSpeed: variation.wind + Math.floor(Math.random() * 5),
      weatherCode: parseInt(randomCode)
    });
  }

  return {
    mountain: mountainName,
    temperature: variation.temp,
    humidity: variation.humidity,
    windSpeed: variation.wind,
    precipitation: Math.random() * 5,
    condition: weatherInfo.condition,
    icon: weatherInfo.icon,
    color: weatherInfo.color,
    rainChance: Math.floor(Math.random() * 60),
    weatherCode: variation.tempCode,
    forecast: forecast,
    timestamp: new Date(),
    isRealTime: false
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
