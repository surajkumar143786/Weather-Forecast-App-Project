const apiKey = "f2004e6ed8535734c5e82e16030d31c9";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const forecastContainer = document.getElementById("forecastContainer");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const recentCitiesContainer = document.getElementById("recentCitiesContainer");
const recentCities = document.getElementById("recentCities");
const errorMessage = document.getElementById("errorMessage");

let weatherData = null;
let currentUnit = "C"; // for toggle
let forecastData = []; // store Celsius temps for 5-day forecast

// Icons
const tempIcon = "🌡️";
const windIcon = "🌬️";
const humidityIcon = "💧";
const conditionIcon = "🌥️";

// --- Recent Cities ---
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

// --- Error Handling ---
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
    forecastContainer.innerHTML = "";
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

// --- Fetch Weather ---
async function fetchWeather(city) {
    try {
        clearError();
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found. Please enter a valid city.");
        weatherData = await response.json();
        displayCurrentWeather();
        prepareForecastData();
        renderForecast();
        saveCity(city);
    } catch (error) {
        showError(error.message);
    }
}

// --- Current Weather ---
function displayCurrentWeather() {
    if (!weatherData) return;

    const today = weatherData.list[0];
    cityName.textContent = `${weatherData.city.name}, ${weatherData.city.country}`;
    let temp = currentUnit === "C" ? today.main.temp : (today.main.temp * 9 / 5 + 32);

    temperature.textContent = `${tempIcon} ${Math.round(temp)}°${currentUnit}`;
    conditions.textContent = `${conditionIcon} ${today.weather[0].description}`;
    humidity.textContent = `${humidityIcon} Humidity: ${today.main.humidity}%`;
    windSpeed.textContent = `${windIcon} Wind: ${today.wind.speed} m/s`;

    // Extreme temp alert
    if (today.main.temp > 40 && currentUnit === "C") {
        showError("⚠️ Extreme Heat Alert! Stay Hydrated.");
    }

    // Dynamic background
    const body = document.body;
    const condition = today.weather[0].main.toLowerCase();
    body.className = "min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 text-white";
    if (condition.includes("rain")) body.classList.add("bg-blue-700");
    else if (condition.includes("cloud")) body.classList.add("bg-gray-600");
    else if (condition.includes("sun") || condition.includes("clear")) body.classList.add("bg-yellow-500");
    else body.classList.add("bg-gradient-to-br", "from-blue-500", "to-indigo-700");
}

// --- Prepare 5-Day Forecast Data ---
function prepareForecastData() {
    forecastData = [];
    const dailyData = weatherData.list.filter(item => item.dt_txt.includes("12:00:00"));
    dailyData.forEach(item => {
        forecastData.push({
            date: new Date(item.dt_txt),
            tempC: item.main.temp,
            condition: item.weather[0].main,
            humidity: item.main.humidity,
            wind: item.wind.speed
        });
    });
}

// --- Render Forecast ---
function renderForecast() {
    forecastContainer.innerHTML = "";
    forecastData.forEach(day => {
        const temp = currentUnit === "C" ? `${day.tempC.toFixed(1)}°C` : `${((day.tempC * 9 / 5) + 32).toFixed(1)}°F`;
        const card = document.createElement("div");
        card.className = "p-4 w-48 bg-white text-black rounded-lg shadow-md flex flex-col items-center";
        card.innerHTML = `
      <h3 class="font-semibold mb-2">${day.date.toDateString()}</h3>
      <p class="mb-1">${tempIcon} Temp: <span class="font-bold">${temp}</span></p>
      <p class="mb-1">${conditionIcon} Condition: ${day.condition}</p>
      <p class="mb-1">${humidityIcon} Humidity: <span class="font-bold">${day.humidity}%</span></p>
      <p class="mb-1">${windIcon} Wind: <span class="font-bold">${day.wind} m/s</span></p>
    `;
        forecastContainer.appendChild(card);
    });
}

// --- Current Location Weather ---
async function getCurrentLocationWeather() {
    if (!navigator.geolocation) return showError("Geolocation is not supported by your browser.");

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            clearError();
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Unable to fetch location weather.");
            weatherData = await response.json();
            displayCurrentWeather();
            prepareForecastData();
            renderForecast();
            saveCity(weatherData.city.name);
        } catch (err) {
            showError(err.message);
        }
    }, () => showError("Permission denied for geolocation."));
}

// --- Event Listeners ---
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return showError("Please enter city name.");
    fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
recentCities.addEventListener("change", () => fetchWeather(recentCities.value));

celsiusBtn.addEventListener("click", () => {
    currentUnit = "C";
    displayCurrentWeather();
    renderForecast();
});

fahrenheitBtn.addEventListener("click", () => {
    currentUnit = "F";
    displayCurrentWeather();
    renderForecast();
});

window.onload = loadRecentCities;
