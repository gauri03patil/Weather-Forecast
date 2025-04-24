

const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const cityInput = document.getElementById("city-input");
const weatherCardDiv = document.getElementById("weather-card");
const currentWeatherDiv = document.getElementById("currentWeather-div");

const API_KEY = "61148ff67c8a4dd22bdb3c8ca2d69837";


const cerateWeatherCard = (cityName, weatherItem, index) =>{
    if(index === 0){    // html for main weather card
        return `
          <article id="currentWeather-div" class="bg-white/30 text-white p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <h2 class="text-xl font-bold mb-2"> ${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
          <p>Temperature: ${weatherItem.main.temp - 273.15}°C</p>
          <p>Wind: ${weatherItem.wind.speed} M/S</p>
          <p>Humidity: ${weatherItem.main.humidity} %</p>
          <div class="mt-3 flex items-center">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon" class="w-16 h-16 mb-2">
            <h4>${weatherItem.weather[0].description}</h4>
          </div>
        </article>
        
        `;
    }else{  // html for the other five day forecast card
    return `<article class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="font-semibold mb-2">(${weatherItem.dt_txt.split(" ")[0]})</h3>
          <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon" class="w-16 h-16 mb-2">
          <p>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
          <p>Wind: ${weatherItem.wind.speed} M/S</p>
          <p>Humidity: ${weatherItem.main.humidity}%</p>
        </article>
    
    `
    }
}


const getWeatherDetails = (cityName, lat, lon) =>{
    const weather_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    
    fetch(weather_api_url).then(res => res.json()).then(data =>{
        //filter the forecast to get only one forecast per day
        
        // console.log(data);

        const uniqueForecastDays = [];
        const fiveDayForecast = data.list.filter(forecast =>{
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
               return uniqueForecastDays.push(forecastDate);
                
            }
        })

        // clearing previous weather value
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardDiv.innerHTML = "";


        // creating weather cards and adding them to the DOM
        console.log(fiveDayForecast);
        fiveDayForecast.forEach((weatherItem, index) =>{

            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardDiv.insertAdjacentHTML("beforeend", cerateWeatherCard(cityName, weatherItem, index));
            }
           
            //  cerateWeatherCard(weatherItem);  
        });
        
    }).catch(()=>{
        alert("An error occurred while fetching the weather forecast")
    })
}

const getCityCoorinates = ()=>{
    const cityName = cityInput.value.trim();
    if(!cityName) return;

    // console.log(cityName);

    const api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`


    // get entered city coordinates (latitude, longitude, and name ) from the api response
    fetch(api_url).then(res => res.json()).then(data =>{
        // console.log(data);
        if(!data.length) return alert(`No city found for ${cityName}`);
        const{name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(()=>{
        alert("An error occurred while fetching data")
    })
}

const getUserCity = ()=>{
   navigator.geolocation.getCurrentPosition(
    position => {
     const {latitude, longitude} = position.coords;
     const REVERSE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`

     // get city from using reverse geocoding api
     fetch(REVERSE_URL).then(res => res.json()).then(data =>{
        // console.log(data);
        const{name} = data[0];
        getWeatherDetails(name, latitude, longitude);
    }).catch(()=>{
        alert("An error occurred while fetching THE CITY")
    })
        // console.log(position)
    }, 
    error =>{
    //    console.log(error) 
    if(error.code === error.PERMISSION_DENIED){
        alert("Please allow location access to get your current location")

    }

    }
   )
}

searchBtn.addEventListener("click", getCityCoorinates);
currentLocationBtn.addEventListener("click", getUserCity);
cityInput.addEventListener("keyup", e.key === "Enter" && getCityCoorinates)