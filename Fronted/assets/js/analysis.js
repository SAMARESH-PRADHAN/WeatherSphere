
$(document).ready(function () {
  // Load header
  $("#header").load("header.html", function () {
    $.getScript("assets/js/header.js");
  });

  $("#footer").load("footer.html");
  $("#header").css("background", "none");
});



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


// Function to Show Loader
function showLoader() {
  $("#chartLoader").fadeIn();
}

// Function to Hide Loader
function hideLoader() {
  $("#chartLoader").fadeOut();
}


function showChart(chartType) {
  showLoader();
  document.getElementById("chartContainer").style.display = "none";

  fetchData(chartType);
}



function fetchData(type) {
  let selectedCities = Array.from(document.querySelectorAll(".district-checkbox:checked"))
    .map(cb => cb.value);
  let startDate = document.getElementById("start_date").value;
  let endDate = document.getElementById("end_date").value;
  let datasets = [];

  let title = type === "rainfall" ? "Rainfall Data" : "Temperature Data";
  let yAxisLabel = type === "rainfall" ? "Rainfall (mm/s)" : "Temperature (°C)";

  let requests = selectedCities.map(city =>
    $.ajax({ url: `http://127.0.0.1:5000/get_${type}?city=${city}&start_date=${startDate}&end_date=${endDate}`, type: 'GET' })
  );


  showLoader(); // Show loader before fetching data
  Promise.all(requests).then(responses => {
    hideLoader(); // Hide loader when data is received
    document.getElementById("chartContainer").style.display = "block"; // Show chart

    responses.forEach((response, index) => {
      let labels = response[`${type}_data`].map(item => item.date);
      let data = response[`${type}_data`].map(item => item[type]);
      datasets.push({
        label: `${title} in ${selectedCities[index]}`,
        data: data,
        borderColor: ['red', 'blue', 'yellow', 'purple', 'green', 'orange'][index],
        fill: false,
        tension: 0.2
      });
    });

    let ctx = document.getElementById('weatherChart').getContext('2d');
    if (window.myChart instanceof Chart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
      type: 'line',
      data: { labels: responses[0][`${type}_data`].map(item => item.date), datasets: datasets },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: 'white', font: { size: 14 } } } },
        scales: {
          x: {
            title: { display: true, text: 'Date', color: 'white', font: { size: 16, weight: "bold" } },
            ticks: { color: 'white' }
          },
          y: {
            title: { display: true, text: yAxisLabel, color: 'white', font: { size: 16, weight: "bold" } },
            ticks: { color: 'white' }
          }
        }
      }
    });

    document.getElementById("chartTitle").textContent = title;
    //document.getElementById("chartContainer").style.display = "block";
    $("#chartContainer").fadeIn();
  });
}

function toggleFullScreen() {
  let chartContainer = document.getElementById("chartContainer");
  if (!document.fullscreenElement) {
    chartContainer.requestFullscreen().catch(err => {
      console.log(`Error attempting fullscreen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// function closeChart() {
//   document.getElementById("chartContainer").style.display = "none";
// }

// Close Chart
function closeChart() {
  $("#chartContainer").fadeOut();
}

// function downloadCSV() {
//   let chart = window.myChart;
//   let csvContent = "data:text/csv;charset=utf-8,Date,Value\n";
//   chart.data.labels.forEach((label, index) => {
//     csvContent += `${label},${chart.data.datasets[0].data[index]}\n`;
//   });
//   let link = document.createElement("a");
//   link.href = encodeURI(csvContent);
//   link.download = "weather_data.csv";
//   link.click();
// }
function downloadCSV() {
  let chart = window.myChart;
  if (!chart) return;

  let csvContent = "data:text/csv;charset=utf-8,";

  // Header Row
  csvContent += "Date," + chart.data.datasets.map(ds => ds.label).join(",") + "\n";

  // Data Rows
  let numRows = chart.data.labels.length;
  for (let i = 0; i < numRows; i++) {
    let row = [chart.data.labels[i]]; // Date column
    chart.data.datasets.forEach(ds => {
      row.push(ds.data[i]); // Add data for each city
    });
    csvContent += row.join(",") + "\n";
  }

  // Download CSV
  let link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "weather_data.csv";
  link.click();
}


function downloadChart() {
  let link = document.createElement('a');
  link.href = document.getElementById('weatherChart').toDataURL('image/png');
  link.download = "weather_chart.png";
  link.click();
}
