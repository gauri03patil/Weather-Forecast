const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const cityInput = document.getElementById("city-input");
const weatherCardDiv = document.getElementById("weather-card");
const currentWeatherDiv = document.getElementById("currentWeather-div");
const dropdownContainer = document.getElementById("dropdown-container");
const recentDropdown = document.getElementById("recent-cities-dropdown");

const API_KEY = "61148ff67c8a4dd22bdb3c8ca2d69837";

const cerateWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // current weather card
    return `
    <article id="currentWeather-div" class="bg-white/80 text-gray-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md transition-transform hover:scale-105">
      <h2 class="text-lg font-bold mb-3 text-orange-600">
        ${cityName} (${weatherItem.dt_txt.split(" ")[0]})
      </h2>
      <p class="mb-1 font-medium">🌡️ Temperature: 
        <span class="text-gray-700">${(weatherItem.main.temp - 273.15).toFixed(1)}°C</span>
      </p>
      <p class="mb-1 font-medium">💨 Wind: 
        <span class="text-gray-700">${weatherItem.wind.speed} M/S</span>
      </p>
      <p class="mb-2 font-medium">💧 Humidity: 
        <span class="text-gray-700">${weatherItem.main.humidity} %</span>
      </p>
      <div class="mt-4 flex items-center gap-4">
        <div class="bg-orange-100 p-2 rounded-full shadow-inner">
          <img 
            src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" 
            alt="weather icon" 
            class="w-10 h-10"
          >
        </div>
        <h4 class="text-lg capitalize font-semibold text-orange-700">
          ${weatherItem.weather[0].description}
        </h4>
      </div>
    </article>`;
  } else {
    // weather cards 5 days
    return `<article class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl shadow-md hover:scale-105 transition text-white text-center flex flex-col items-center">
      <h3 class="font-semibold mb-2 text-lg">(${weatherItem.dt_txt.split(" ")[0]})</h3>
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon" class="w-16 h-16 mb-3 bg-amber-600">
      <p class="mb-1">🌡️ Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
      <p class="mb-1">💨 Wind: ${weatherItem.wind.speed} M/S</p>
      <p class="mb-1">💧 Humidity: ${weatherItem.main.humidity}%</p>
    </article>`;
  }
};


//This function fetches weather data for a given city and displays it on the page
const getWeatherDetails = (cityName, lat, lon) => {
  //Create the URL for the weather API using the latitude and longitude of the city
  const weather_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  //Fetch the weather data from the API
  fetch(weather_api_url)
    .then((res) => res.json())
    .then((data) => {
      //Create an array to store the unique forecast days
      const uniqueForecastDays = [];
      //Filter the forecast data to only include unique forecast days
      const fiveDayForecast = data.list.filter((forecast) => {
        //Get the date of the forecast
        const forecastDate = new Date(forecast.dt_txt).getDate();
        //If the date is not already in the uniqueForecastDays array, add it
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      //Clear the input field and the weather card divs
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardDiv.innerHTML = "";

      //Loop through the five day forecast and create a weather card for each day
      fiveDayForecast.forEach((weatherItem, index) => {
        //If the index is 0, create a weather card for the current day
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
        //Otherwise, create a weather card for the other days
        } else {
          weatherCardDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast");
    });
};

const getCityCoorinates = () => {
  const cityName = cityInput.value.trim();
  // if (!cityName) return;
  if (!cityName) {
    alert("Please enter a city name");
    return;
  }

  const api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(api_url)
    .then((res) => res.json())
    .then((data) => {

      console.log("Geocoding API response:", data);

      if (!data.length || !data[0].name || !data[0].lat || !data[0].lon) {
        alert(`No city found for "${cityName}". Please enter a proper city name.`);
        return;
      }
      const { name, lat, lon } = data[0];
      
      addCityToStorage(name)
      getWeatherDetails(name, lat, lon);

    })
    .catch(() => {
      alert("An error occurred while fetching data");
    });
};

const getUserCity = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(REVERSE_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching THE CITY");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Please allow location access to get your current location");
      }
    }
  );
};

// Utility: Get recent cities
const getCities = () => JSON.parse(localStorage.getItem("recentCities")) || [];

// Add city to localStorage
const addCityToStorage = (city) => {
  const cities = getCities().filter((c) => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  localStorage.setItem("recentCities", JSON.stringify(cities.slice(0, 5)));
  updateDropdown();
};

// Update dropdown


const updateDropdown = () => {
  const cities = getCities();
  dropdownContainer.classList.toggle("hidden", cities.length === 0);
  recentDropdown.innerHTML = `<option disabled selected>Recently Searched Cities</option>` +
    cities.map((city) => `<option value="${city}">${city}</option>`).join("");
};

// Dropdown selection
recentDropdown.addEventListener("change", (e) => {
  const selectedCity = e.target.value;
  cityInput.value = selectedCity;
  fetchWeatherData(selectedCity);
});


// Fetch weather
const fetchWeatherData = (city) => {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod !== "200") return ;

      const list = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      const cityName = data.city.name;

      currentWeatherDiv.innerHTML = cerateWeatherCard(cityName, list[0], 0);
      weatherCardDiv.innerHTML = list.slice(1).map((item, i) => cerateWeatherCard(cityName, item, i + 1)).join("");
    })
    .catch(() => alert("Something went wrong!"));
};

// Init
updateDropdown();
searchBtn.addEventListener("click", getCityCoorinates);
currentLocationBtn.addEventListener("click", getUserCity);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoorinates());