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

// Icons
const tempIcon = "🌡️";
const windIcon = "🌬️";
const humidityIcon = "💧";
const conditionIcon = "🌥️";

// --- Recent cities functions ---
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
        cities.unshift(city);
        if (cities.length > 5) cities.pop();
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    loadRecentCities();
}

function loadRecentCities() {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (cities.length > 0) {
        recentCitiesContainer.classList.remove("hidden");
        recentCities.innerHTML = "";
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            recentCities.appendChild(option);
        });
    } else {
        recentCitiesContainer.classList.add("hidden");
    }
}

// --- Error handling ---
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
    forecastContainer.innerHTML = "";
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

// --- Fetch 5-day forecast ---
async function fetchWeather(city) {
    try {
        clearError();
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found. Please enter a valid city.");
        weatherData = await response.json();
        displayWeather();
        saveCity(city);
    } catch (error) {
        showError(error.message);
    }
}

// --- Display 5-day forecast ---
function displayWeather() {
    if (!weatherData) return;

    cityName.textContent = `${weatherData.city.name}, ${weatherData.city.country}`;
    forecastContainer.innerHTML = "";

    // Pick data at 12:00 PM for each day
    const dailyData = weatherData.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
        let temp = item.main.temp;
        let windUnit = "m/s";
        if (tempUnit === "F") {
            temp = (temp * 9) / 5 + 32;
            windUnit = "mph";
        }

        const dayDiv = document.createElement("div");
        dayDiv.className = "p-4 w-48 bg-white text-black rounded-lg shadow-md flex flex-col items-center";

        dayDiv.innerHTML = `
            <h3 class="font-semibold mb-2">${new Date(item.dt_txt).toDateString()}</h3>
            <p class="mb-1">${tempIcon} Temp: <span class="font-bold">${Math.round(temp)}°${tempUnit}</span></p>
            <p class="mb-1">${conditionIcon} Condition: ${item.weather[0].description}</p>
            <p class="mb-1">${humidityIcon} Humidity: <span class="font-bold">${item.main.humidity}%</span></p>
            <p class="mb-1">${windIcon} Wind: <span class="font-bold">${item.wind.speed} ${windUnit}</span></p>
        `;
        forecastContainer.appendChild(dayDiv);
    });
}  

// --- Toggle Celsius/Fahrenheit ---
function toggleTemp(unit) {
    tempUnit = unit;
    displayWeather();
}

// --- Current location weather ---
async function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
            clearError();
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Unable to fetch location weather.");
            weatherData = await response.json();
            displayWeather();
            saveCity(weatherData.city.name);
        } catch (error) {
            showError(error.message);
        }
    }, () => {
        showError("Permission denied for geolocation.");
    });
}