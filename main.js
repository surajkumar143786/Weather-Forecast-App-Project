//Required Selected Elements
const apiKey = "f2004e6ed8535734c5e82e16030d31c9"
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const cityName = document.getElementById("cityName");
const forecastContainer = document.getElementById("forecastContainer");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const recentCitiesContainer = document.getElementById("recentCitiesContainer");
const recentCities = document.getElementById("recentCities");
const errorMessage = document.getElementById("errorMessage");

let weatherData = null;      // Stores API data
let tempUnit = "C";          // Current display unit (C or F)
