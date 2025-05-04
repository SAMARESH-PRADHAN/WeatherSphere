$(document).ready(function () {
  // Load header and footer
  $("#header").load("header.html", function () {
    console.log("Header loaded successfully.");

    // Load `header.js` only after `header.html` is fully inserted
    $.getScript("assets/js/header.js", function () {
      console.log("Header.js loaded after header.html.");
    });
  });

  $("#footer").load("footer.html");
});




// Weather News
const API_KEY = "f5755cecf90a4fee9739715fd37eea8d";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("India"));

// function reload() {
//   window.location.reload();
// }

async function fetchNews() {
  const res = await fetch(`${url}weather&apiKey=${API_KEY}`);
  const data = await res.json();
  bindData(data.articles.slice(0, 6));
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  articles.forEach((article) => {
    if (!article.urlToImage) return;
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");

  newsImg.src = article.urlToImage;
  newsTitle.innerHTML = article.title;
  newsDesc.innerHTML = article.description;

  const date = new Date(article.publishedAt).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });

  newsSource.innerHTML = `${article.source.name} · ${date}`;

  cardClone.firstElementChild.addEventListener("click", () => {
    window.open(article.url, "_blank");
  });
}

let curSelectedNav = null;
function onNavItemClick(id) {
  fetchNews(id);
  const navItem = document.getElementById(id);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = navItem;
  curSelectedNav.classList.add("active");
}



//Weather data

const apikey = "e75cec84dcbae9f5d818722f18b1c856";
const apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";



const searchbox = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const weathericon = document.getElementById("weather-icon");

let weather = document.querySelector(".parent-forecast");
let day = document.getElementById("day");
let date = document.getElementById("date");
let City = document.querySelector(".location");
let minTemp = document.querySelector(".low-temp-p");
let temp = document.querySelector(".temp");
let maxTemp = document.querySelector(".high-temp-p");
let humadity = document.querySelector(".humidity");
let wind = document.querySelector(".wind");
let sunrise = document.querySelector(".sr");
let sunset = document.querySelector(".st");
let description = document.querySelector(".desc");
// let errormsg = document.querySelector(".error");

async function checkweather(city) {
  const response = await fetch(apiurl + city + `&appid=${apikey}`);

  if (response.status == 404) {
    errormsg.style.display = "block";
    weather.style.display = "none";
  } else {
    var data = await response.json();

    console.log(data);



    // Convert timestamp to readable date
    const timestamp = data.dt * 1000; // Convert to milliseconds
    const dateObj = new Date(timestamp);
    // Extract day and date
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    day.innerHTML = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    date.innerHTML = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    City.innerHTML = data.name;
    temp.innerHTML = Math.round(data.main.temp) + "°c";
    minTemp.innerHTML = Math.round(data.main.temp_min) + "°C";
    maxTemp.innerHTML = Math.round(data.main.temp_max) + "°C";
    humadity.innerHTML = data.main.humidity + "%";
    wind.innerHTML = data.wind.speed + " km/h";
    description.innerHTML = data.weather[0].main;


    // Convert sunrise and sunset time
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);

    // Format sunrise and sunset time
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    sunrise.innerHTML = sunriseTime.toLocaleTimeString("en-US", timeOptions);
    sunset.innerHTML = sunsetTime.toLocaleTimeString("en-US", timeOptions);


    if (data.weather[0].main == "Clouds") {
      weathericon.src = "./assets/img/clouds.png";
    }
    else if (data.weather[0].main == "Clear") {
      weathericon.src = "./assets/img/clear.png";
    }
    else if (data.weather[0].main == "Rain") {
      weathericon.src = "./assets/img/rain.png";
    }
    else if (data.weather[0].main == "Drizzle") {
      weathericon.src = "./assets/img/drizzle.png";
    }
    else if (data.weather[0].main == "Mist") {
      weathericon.src = "./assets/img/mist.png";
    }
    else if (data.weather[0].main == "Fog") {
      weathericon.src = "./assets/img/fog.png";
    }
    else if (data.weather[0].main == "Haze") {
      weathericon.src = "./assets/img/haze.png";
    }
    else if (data.weather[0].main == "Snow") {
      weathericon.src = "./assets/img/snow.png";
    }
    else if (data.weather[0].main == "Thunderstorm") {
      weathericon.src = "./assets/img/thunderstorm.png";
    }
    else if (data.weather[0].main == "Tornado") {
      weathericon.src = "./assets/img/tornado.png";
    }
    else if (data.weather[0].main == "Smoke") {
      weathericon.src = "./assets/img/smoke.png";
    }
    else if (data.weather[0].main == "Dust") {
      weathericon.src = "./assets/img/dust.png";
    }
    else if (data.weather[0].main == "Sand") {
      weathericon.src = "./assets/img/sand.png";
    }
    else if (data.weather[0].main == "Ash") {
      weathericon.src = "./assets/img/ash.png";
    }
    else if (data.weather[0].main == "Squall") {
      weathericon.src = "./assets/img/squall.png";
    }
    else {
      weathericon.src = "./assets/img/default.png";  // Default weather image
    }

    // weather.style.display = "block";
    // errormsg.style.display = "none";

    //Fetch 5 days forecast data
    checkforecast(city);
  }

}




// 5 days forecasting
const weatherImages = {
  "Clouds": "clouds.png",
  "Clear": "clear.png",
  "Rain": "rain.png",
  "Drizzle": "drizzle.png",
  "Mist": "mist.png",
  "Fog": "fog.png",
  "Haze": "haze.png",
  "Snow": "snow.png",
  "Thunderstorm": "thunderstorm.png",
  "Tornado": "tornado.png",
  "Smoke": "smoke.png",
  "Dust": "dust.png",
  "Sand": "sand.png",
  "Ash": "ash.png",
  "Squall": "squall.png",
  "Default": "default.png"
};


async function checkforecast(city) {
  try {
    const response = await fetch(forecastUrl + city + `&appid=${apikey}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    console.log(data);

    updateForecastUI(data);
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}
// Load 5-day forecast for Bhubaneswar by default
window.addEventListener("load", () => {
  checkforecast("Bhubaneswar");
});

function updateForecastUI(data) {
  const forecastContainer = document.querySelector(".cast-row");
  forecastContainer.innerHTML = ""; // Clear previous data

  const dailyForecasts = {}; // Store one forecast per day

  // Loop through forecast data (API provides data every 3 hours)
  data.list.forEach(entry => {
    const date = new Date(entry.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });

    // Store only one forecast per day (prefer midday data)
    if (!dailyForecasts[day] || date.getHours() === 12) {
      dailyForecasts[day] = {
        temp: Math.round(entry.main.temp),
        description: entry.weather[0].description,
        main: entry.weather[0].main
      };
    }
  });


  // Add forecast cards to UI
  Object.keys(dailyForecasts).slice(1, 6).forEach(day => {
    const forecast = dailyForecasts[day];
    const imagePath = weatherImages[forecast.main] ? `./assets/img/${weatherImages[forecast.main]}` : "./assets/img/default.png";


    const forecastHTML = `
      <div class="for-con">
          <h3>${day}</h3>
          <div class="fore-img"><img src="${imagePath}" alt="${forecast.description}"></div>
          <div>${forecast.temp}<sup>o</sup>C</div>
          <p>${forecast.description}</p>
      </div>
  `;

    forecastContainer.innerHTML += forecastHTML;
  });
}



window.addEventListener("load", () => {
  checkweather("Bhubaneswar"); // Default city on page load
});

searchBtn.addEventListener("click", () => {
  checkweather(searchbox.value);
  searchbox.value = "";
});




//India's top 9 cities weather

// List of top Indian cities
const cities = ["Bhubaneswar", "Delhi", "Mumbai", "Kolkata", "Bengaluru", "Goa", "Hyderabad", "Ahmedabad", "Jammu"];

// Function to fetch weather data for multiple cities when the page loads
async function fetchCitiesWeather() {
  const cityWeatherPromises = cities.map(async city => {
    try {
      const response = await fetch(apiurl + city + `&appid=${apikey}`);
      if (!response.ok) throw new Error(`Failed to fetch weather for ${city}`);

      const data = await response.json();
      updateCityWeatherUI(city, data);
    } catch (error) {
      console.error("Error fetching city weather:", error);
    }
  });

  await Promise.all(cityWeatherPromises); // Ensures all cities are fetched in parallel
}

// Function to update UI with weather data
function updateCityWeatherUI(city, data) {
  const cityElements = document.querySelectorAll(".city-solo-div");

  cityElements.forEach(element => {
    const cityName = element.querySelector(".city-name").textContent.trim(); // Get city name from UI
    if (cityName.toLowerCase() === city.toLowerCase()) {
      const tempElement = element.querySelector(".class-temp");
      const iconElement = element.querySelector(".city-img-wd");

      tempElement.innerHTML = `${Math.round(data.main.temp)}<sup>o</sup>C`;

      // Set Weather Icon dynamically with Default Image fallback
      const weatherCondition = data.weather[0].main;
      const weatherIcon = weatherImages[weatherCondition] || weatherImages["Default"];
      iconElement.src = `./assets/img/${weatherIcon}`;
      iconElement.alt = weatherCondition;
    }
  });
}

// Call function when the page loads
window.addEventListener("load", fetchCitiesWeather);