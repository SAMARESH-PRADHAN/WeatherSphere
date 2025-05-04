$(document).ready(function () {
  // Load header
  $("#header").load("header.html", function () {
    $.getScript("assets/js/header.js");
  });

  $("#footer").load("footer.html");
  $("#header").css("background", "none");
});





var baseLayers = {
  "streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
  "satellite": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
  "terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap contributors' }),
  "googleSatellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', { attribution: '&copy; Google' })
};

var map = L.map('map').setView([20.2961, 85.8245], 7);
baseLayers["streets"].addTo(map);

function changeMapLayer() {
  let selectedLayer = document.getElementById("mapType").value;
  map.eachLayer(layer => map.removeLayer(layer));
  baseLayers[selectedLayer].addTo(map);
}

function searchWeather() {
  let city = document.getElementById("searchCity").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }
  getWeatherDataSearch(city);
}

document.addEventListener("DOMContentLoaded", function () {
  let toggleButton = document.getElementById("toggleSettings");
  let settingsPanel = document.getElementById("settingsPanel");

  toggleButton.addEventListener("click", function () {
    if (settingsPanel.classList.contains("show")) {
      settingsPanel.classList.remove("show");
      setTimeout(() => {
        settingsPanel.style.visibility = "hidden"; // Hide after animation
      }, 400);
      toggleButton.textContent = "Show Settings"; // Change button text
    } else {
      settingsPanel.style.visibility = "visible"; // Make visible before animation
      settingsPanel.classList.add("show");
      toggleButton.textContent = "Hide Settings"; // Change button text
    }
  });
});

// GeoServer WMS URL
const geoServerURL = "http://localhost:8080/geoserver/weather/wms";

// Define Border Layers using WMS
var indiaBorderLayer = L.tileLayer.wms(geoServerURL, {
  layers: "weather:ind_st_bdr",
  format: "image/png",
  transparent: true
});

var stateBorderLayer = L.tileLayer.wms(geoServerURL, {
  layers: "weather:state_bdr",
  format: "image/png",
  transparent: true
});

var districtBorderLayer = L.tileLayer.wms(geoServerURL, {
  layers: "weather:dist_bdr",
  format: "image/png",
  transparent: true
});

// Add a control to toggle layers
var overlayMaps = {
  "India Border": indiaBorderLayer,
  "State Borders": stateBorderLayer,
  "District Borders": districtBorderLayer
};

//L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
// Layer Toggle Function
function toggleLayer(layer) {
  let checkbox, selectedLayer;

  if (layer === "india") {
    checkbox = document.getElementById("indiaBorderToggle");
    selectedLayer = indiaBorderLayer;
  } else if (layer === "state") {
    checkbox = document.getElementById("stateBorderToggle");
    selectedLayer = stateBorderLayer;
  } else if (layer === "district") {
    checkbox = document.getElementById("districtBorderToggle");
    selectedLayer = districtBorderLayer;
  }

  if (checkbox.checked) {
    if (!map.hasLayer(selectedLayer)) {
      map.addLayer(selectedLayer);
    }
  } else {
    if (map.hasLayer(selectedLayer)) {
      map.removeLayer(selectedLayer);
    }
  }
}




document.addEventListener("DOMContentLoaded", function () {
  fetch("http://127.0.0.1:5000/get_districts")
    .then(response => response.json())
    .then(data => {
      let dropdownMenu = document.getElementById("districtList");
      dropdownMenu.innerHTML = ""; // Clear existing options

      data.districts.forEach(district => {
        let listItem = document.createElement("li");
        listItem.innerHTML = ` <label class="dropdown-item">
            <input type="checkbox" class="district-checkbox" value="${district}" />
            ${district}
          </label>`;
        dropdownMenu.appendChild(listItem);
      });

      // Add event listener to update input box
      document.querySelectorAll(".district-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function () {
          let selected = Array.from(document.querySelectorAll(".district-checkbox:checked"))
            .map(cb => cb.value)
            .join(", ");
          document.getElementById("selectedDistricts").value = selected;
        });
      });
    })
    .catch(error => console.error("Error fetching districts:", error));
});







function setDateRange() {
  var days = document.getElementById("datePreset").value;
  if (days) {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    document.getElementById("start_date").value = startDate.toISOString().split('T')[0];
    document.getElementById("end_date").value = endDate.toISOString().split('T')[0];
  }
}

let chartInstance;
let rainfallRasterLayer;
let temperatureRasterLayer;
let cityBorderLayers = {}; // Store city borders

function showChart(chartType) {
  document.querySelector(".spinner-container").style.display = "block";
  document.getElementById("chartContainer").style.display = "none";

  if (chartType === "rainfall") {
    fetchRainfallRaster();
  } else if (chartType === "temperature") {
    fetchTemperatureRaster();
  }

  fetchChartData(chartType);
}

function fetchChartData(type) {
  let selectedCities = Array.from(document.querySelectorAll(".district-checkbox:checked"))
    .map(cb => cb.value);
  let startDate = document.getElementById("start_date").value;
  let endDate = document.getElementById("end_date").value;
  let datasets = [];

  let requests = selectedCities.map(city =>
    $.ajax({ url: `http://127.0.0.1:5000/get_${type}?city=${city}&start_date=${startDate}&end_date=${endDate}`, type: 'GET' })
  );

  Promise.all(requests).then(responses => {
    document.querySelector(".spinner-container").style.display = "none"; // Hide spinner
    document.getElementById("chartContainer").style.display = "block"; // Show chart

    responses.forEach((response, index) => {
      let labels = response[`${type}_data`].map(item => item.date);
      let data = response[`${type}_data`].map(item => item[type]);
      datasets.push({
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} in ${selectedCities[index]}`,
        data: data,
        borderColor: ['red', 'blue', 'yellow', 'purple', 'black', 'green', 'orange'][index],
        fill: false
      });
    });

    let ctx = document.getElementById('chartCanvas').getContext('2d');
    if (chartInstance instanceof Chart) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels: responses[0][`${type}_data`].map(item => item.date), datasets: datasets },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: type === 'rainfall' ? 'Date' : 'Date' } },
          y: { title: { display: true, text: type === 'rainfall' ? 'Rainfall (mm)' : 'Temperature (°C)' } }
        }
      }
    });
  });
}

// Function to toggle city boundaries
function toggleCityBorders() {
  let selectedCities = Array.from(document.querySelectorAll(".district-checkbox:checked"))
    .map(cb => cb.value);

  selectedCities.forEach(city => {
    if (!cityBorderLayers[city]) {
      cityBorderLayers[city] = L.tileLayer.wms("http://localhost:8080/geoserver/weather/wms", {
        layers: `weather:${city}_boundary`,
        format: "image/png",
        transparent: true,
        styles: "city_borders", // Use the new border-only style
        zIndex: 500
      }).addTo(map);
    }
  });
}


function fetchRainfallRaster() {
  let selectedCities = Array.from(document.querySelectorAll(".district-checkbox:checked"))
    .map(cb => cb.value);

  let startDate = document.getElementById("start_date").value;
  let endDate = document.getElementById("end_date").value;

  if (selectedCities.length === 0) {
    alert("Please select at least one city.");
    return;
  }

  let url = `http://127.0.0.1:5000/get_rainfall_raster?start_date=${startDate}&end_date=${endDate}`;
  selectedCities.forEach(city => {
    url += `&city=${encodeURIComponent(city)}`;
  });

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Error loading raster data: " + data.error);
        return;
      }

      console.log("Adding WMS Layer:", data.wms_url);

      if (rainfallRasterLayer) {
        map.removeLayer(rainfallRasterLayer);
      }

      rainfallRasterLayer = L.tileLayer(data.wms_url, {
        attribution: "Google Earth Engine",
        opacity: 1.0,
        zIndex: 1000
      }).addTo(map);
      updateLegend("rainfall");
      console.log("✅ Raster Layer Added Successfully");
    })
    .catch(error => console.error("Error fetching rainfall raster:", error));
}




function fetchTemperatureRaster() {
  let selectedCities = Array.from(document.querySelectorAll(".district-checkbox:checked"))
    .map(cb => cb.value);

  let startDate = document.getElementById("start_date").value;
  let endDate = document.getElementById("end_date").value;

  if (selectedCities.length === 0) {
    alert("Please select at least one city.");
    return;
  }

  let url = `http://127.0.0.1:5000/get_temperature_raster?start_date=${startDate}&end_date=${endDate}`;
  selectedCities.forEach(city => {
    url += `&city=${encodeURIComponent(city)}`;
  });

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Error loading temperature raster: " + data.error);
        return;
      }

      console.log("Adding Temperature WMS Layer:", data.wms_url);

      // Remove previous temperature raster layer if it exists
      if (temperatureRasterLayer) {
        map.removeLayer(temperatureRasterLayer);
      }

      // Add new temperature WMS layer
      temperatureRasterLayer = L.tileLayer(data.wms_url, {
        attribution: "Google Earth Engine",
        opacity: 1.0,
        zIndex: 999  // Ensure raster is below borders
      }).addTo(map);
      updateLegend("temperature");
      console.log("✅ Temperature Raster Layer Added Successfully");
    })
    .catch(error => console.error("Error fetching temperature raster:", error));
}


// Update Color Legend Based on Raster Type
function updateLegend(type) {
  let legendContainer = document.getElementById("legend-container");
  let legendImage = document.getElementById("legend-image");
  let legendTitle = document.getElementById("legend-title");

  if (type === "rainfall") {
    legendImage.src = "assets/img/rainfall_legend.png";
    legendTitle.innerText = "Rainfall (mm)";
  } else if (type === "temperature") {
    legendImage.src = "assets/img/temperature_legend.png";
    legendTitle.innerText = "Temperature (°C)";
  }

  legendContainer.style.display = "block";
  legendContainer.style.visibility = "visible";
}

function hideLegend() {
  document.getElementById("legend-container").style.display = "none";
}

// Close the Chart and Remove Raster Layer
function closeContainer(containerId) {
  document.getElementById(containerId).style.display = "none";

  if (rainfallRasterLayer) {
    map.removeLayer(rainfallRasterLayer);
    rainfallRasterLayer = null;
  }

  if (temperatureRasterLayer) {
    map.removeLayer(temperatureRasterLayer);
    temperatureRasterLayer = null;
  }

  hideLegend();
}

function toggleFullScreen(containerId) {
  document.getElementById(containerId).classList.toggle("fullscreen");
}

function downloadCSV(chartId, filename) {
  let chart = chartInstance;
  if (!chart) {
    alert("No data to download!");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Date,Value\n";
  chart.data.labels.forEach((label, index) => {
    csvContent += `${label},${chart.data.datasets[0].data[index]}\n`;
  });
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
}

function downloadChart(chartId, filename) {
  let link = document.createElement('a');
  link.href = document.getElementById(chartId).toDataURL('image/png');
  link.download = filename;
  link.click();
}

function getWeatherData(city) {
  let apiKey = "e75cec84dcbae9f5d818722f18b1c856";
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url).then(response => response.json()).then(data => {
    document.getElementById("locat_name").innerText = data.name;
    document.getElementById("temperature").innerText = data.main.temp;
    document.getElementById("humidity").innerText = data.main.humidity;
    document.getElementById("windSpeed").innerText = data.wind.speed;
    document.getElementById("weatherDesc").innerText = data.weather[0].description;
    document.getElementById("weatherContainer").style.display = "block";

    // Place a marker on the map
    let lat = data.coord.lat;
    let lon = data.coord.lon;

    if (window.cityMarker) {
      map.removeLayer(window.cityMarker);
    }
    window.cityMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${city}</b><br>Temperature: ${data.main.temp}°C`)
      .openPopup();

    map.setView([lat, lon], 10); // Zoom into the city
  });
}
function getWeatherDataSearch(city) {
  let apiKey = "e75cec84dcbae9f5d818722f18b1c856";
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url).then(response => response.json()).then(data => {
    document.getElementById("locat_name").innerText = data.name;
    document.getElementById("temperature").innerText = data.main.temp;
    document.getElementById("humidity").innerText = data.main.humidity;
    document.getElementById("windSpeed").innerText = data.wind.speed;
    document.getElementById("weatherDesc").innerText = data.weather[0].description;
    document.getElementById("weatherContainer").style.display = "block";


    // Place a marker on the map
    let lat = data.coord.lat;
    let lon = data.coord.lon;

    if (window.cityMarker) {
      map.removeLayer(window.cityMarker);
    }
    window.cityMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${city}</b><br>Temperature: ${data.main.temp}°C`)
      .openPopup();

    map.setView([lat, lon], 10); // Zoom into the city9178043376
  });
}
document.getElementById("toggleControls").addEventListener("click", function () {
  let controls = document.getElementById("controls");
  if (controls.style.display === "none" || controls.style.display === "") {
    controls.style.display = "block";
    this.textContent = "Hide Features";
  } else {
    controls.style.display = "none";
    this.textContent = "Show Features";
  }
});

document.getElementById("toggleControls").addEventListener("click", function () {
  let controls = document.getElementById("controls");
  controls.classList.toggle("show");
  this.textContent = "Hide Features";
});

// Add Mouse Position Control (Lat/Lng at Bottom Center Inside the Map)
var mousePositionControl = L.control({ position: "bottomcenter" });

mousePositionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "mousePosition");
  div.innerHTML = "Lat: -, Lng: -"; // Default text
  div.style.position = "absolute";

  map.on("mousemove", function (e) {
    div.innerHTML = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
  });

  return div;
};

// Manually add to the bottom center INSIDE the map
setTimeout(() => {
  document.getElementById("map").appendChild(mousePositionControl.onAdd(map));
}, 1000);

// Add Stylish Scale Bar
L.control.scale({
  position: "bottomleft",
  metric: true,
  imperial: false
}).addTo(map);