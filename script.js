const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const cityInput = document.getElementById("city-input");
const weatherCardDiv = document.getElementById("weather-card");
const currentWeatherDiv = document.getElementById("currentWeather-div");
const recentCitiesDiv = document.getElementById("recent-cities");

const API_KEY = "61148ff67c8a4dd22bdb3c8ca2d69837";

// ----- Helper Functions -----
// Get recent cities from local storage
function getRecentCities() {
  return JSON.parse(localStorage.getItem("recentCities")) || [];
}

// Save city to local storage
function saveCityToLocalStorage(city) {
  let cities = getRecentCities();
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > 5) cities = cities.slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(cities));
  renderRecentCities();
}

// Render recent cities
function renderRecentCities() {
  const cities = getRecentCities();
  recentCitiesDiv.innerHTML = "";
  if (cities.length === 0) {
    recentCitiesDiv.classList.add("hidden");
    return;
  }
  cities.forEach(city => {
    const button = document.createElement("button");
    button.textContent = city;
    button.className = "block w-full text-left px-4 py-2 rounded hover:bg-orange-100 font-medium";
    button.addEventListener("click", () => getCityWeatherByName(city));
    recentCitiesDiv.appendChild(button);
  });
  recentCitiesDiv.classList.remove("hidden");
}

// ----- Weather Cards -----
// Create weather card
const cerateWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `
      <article id="currentWeather-div" class="bg-white/80 text-gray-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md transition-transform hover:scale-105">
        <h2 class="text-lg font-bold mb-3 text-orange-600">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <p class="mb-1 font-medium">🌡️ Temperature: <span class="text-gray-700">${(weatherItem.main.temp - 273.15).toFixed(1)}°C</span></p>
        <p class="mb-1 font-medium">💨 Wind: <span class="text-gray-700">${weatherItem.wind.speed} M/S</span></p>
        <p class="mb-2 font-medium">💧 Humidity: <span class="text-gray-700">${weatherItem.main.humidity}%</span></p>
        <div class="mt-4 flex items-center gap-4">
          <div class="bg-orange-100 p-2 rounded-full shadow-inner">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="icon" class="w-10 h-10">
          </div>
          <h4 class="text-lg capitalize font-semibold text-orange-700">${weatherItem.weather[0].description}</h4>
        </div>
      </article>`;
  } else {
    return `
      <article class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl shadow-md hover:scale-105 transition text-white text-center flex flex-col items-center">
        <h3 class="font-semibold mb-2 text-lg">(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="icon" class="w-16 h-16 mb-3">
        <p class="mb-1">🌡️ Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
        <p class="mb-1">💨 Wind: ${weatherItem.wind.speed} M/S</p>
        <p class="mb-1">💧 Humidity: ${weatherItem.main.humidity}%</p>
      </article>`;
  }
};

// ----- Fetching Weather -----
// Get weather details
function getWeatherDetails(cityName, lat, lon) {
  const weather_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(weather_api_url)
    .then(res => res.json())
    .then(data => {
      const uniqueForecastDays = [];
      const fiveDayForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardDiv.innerHTML = "";
      fiveDayForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
        } else {
          weatherCardDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
        }
      });
    })
    .catch(() => alert("An error occurred while fetching the weather forecast"));
}

// Get city coordinates
function getCityCoorinates() {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  fetch(api_url)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert(`No city found for ${cityName}`);
      const { name, lat, lon } = data[0];
      saveCityToLocalStorage(name);
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("An error occurred while fetching data"));
}

// Get user city
function getUserCity() {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const REVERSE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_URL)
        .then(res => res.json())
        .then(data => {
          const { name } = data[0];
          saveCityToLocalStorage(name);
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => alert("An error occurred while fetching the city"));
    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Please allow location access to get your current location");
      }
    }
  );
}

// Get city weather by name
function getCityWeatherByName(cityName) {
  const api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  fetch(api_url)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert(`No city found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("An error occurred while fetching data"));
}

// ----- Event Listeners -----
// Add event listener to search button
searchBtn.addEventListener("click", getCityCoorinates);
// Add event listener to current location button
currentLocationBtn.addEventListener("click", getUserCity);
// Add event listener to city input
cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") getCityCoorinates();
});

// On page load
renderRecentCities();