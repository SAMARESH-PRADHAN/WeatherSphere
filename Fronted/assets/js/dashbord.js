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


let userChartInstance = null;
let feedbackChartInstance = null;



function animateCounter(id, target) {
  const el = document.getElementById(id);
  let count = 0;
  const step = Math.max(1, target / 60);
  const interval = setInterval(() => {
    count += step;
    if (count >= target) {
      el.innerText = target;
      el.classList.add("animate__bounceIn");
      clearInterval(interval);
    } else {
      el.innerText = Math.ceil(count);
    }
  }, 20);
}

function loadDashboardStats() {
  $.get('http://127.0.0.1:5000/dashboard-stats', data => {
    animateCounter("totalUsers", data.total_users);
    animateCounter("totalCities", data.total_cities);
    animateCounter("totalFeedbacks", data.total_feedbacks);
    animateCounter("unreadContacts", data.unread_contacts);
  });
}

function renderFeedbackChart(data) {
  const ctx = document.getElementById('feedbackChart');
  if (feedbackChartInstance) feedbackChartInstance.destroy();
  feedbackChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
      datasets: [{
        label: 'Feedbacks',
        data: data,
        backgroundColor: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db']
      }]
    },
    options: {
      animation: {
        duration: 1500,
        easing: 'easeOutBounce'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} feedback(s)`
          }
        },
        legend: { display: false }
      }
    }
  });
}

function renderUserChart(data) {
  const labels = data.map(d => d.date);
  const counts = data.map(d => d.count);
  const ctx = document.getElementById('userChart');
  if (userChartInstance) userChartInstance.destroy();
  userChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'User Registrations',
        data: counts,
        borderColor: '#00ff99',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        backgroundColor: 'rgba(0,255,153,0.1)'
      }]
    },
    options: {
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} registration(s)`
          }
        }
      }
    }
  });
}

function loadFeedbackChart() {
  $.get('http://127.0.0.1:5000/feedback-chart-data', data => renderFeedbackChart(data));
}

function loadUserChart() {
  const start = $('#startDate').val();
  const end = $('#endDate').val();
  let url = 'http://127.0.0.1:5000/user-chart-data';
  if (start && end) url += `?start_date=${start}&end_date=${end}`;
  $.get(url, data => renderUserChart(data));
}

$('#startDate, #endDate').on('change', loadUserChart);

$(document).ready(() => {
  loadDashboardStats();
  loadFeedbackChart();
  loadUserChart();
  setTimeout(() => {
    $('#startDate, #endDate').addClass('animate__animated animate__fadeInDown');
  }, 300);
});


function downloadChartAsImage(chartId) {
  const canvas = document.getElementById(chartId);
  const link = document.createElement('a');
  link.download = `${chartId}.png`;
  link.href = canvas.toDataURL('image/png', 1);
  link.click();
}

function downloadUserCSV() {
  const start = $('#startDate').val();
  const end = $('#endDate').val();
  let url = 'http://127.0.0.1:5000/user-chart-data';
  if (start && end) url += `?start_date=${start}&end_date=${end}`;

  $.get(url, data => {
    console.log("User data for CSV:", data); // Debug line
    let csv = 'Date,Registrations\n';

    if (Array.isArray(data)) {
      data.forEach(d => {
        const date = d.date || d.Date || ''; // handle case sensitivity
        const count = d.count || d.Count || 0;
        csv += `${date},${count}\n`;
      });
      triggerCSVDownload(csv, 'user_data.csv');
    } else {
      alert('Invalid data received for user CSV.');
    }
  });
}

function downloadFeedbackCSV() {
  $.get('http://127.0.0.1:5000/feedback-chart-data', data => {
    const stars = ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'];
    let csv = 'Rating,Count\n';
    data.forEach((count, i) => {
      csv += `${stars[i]},${count}\n`;
    });
    triggerCSVDownload(csv, 'feedback_data.csv');
  });
}

function triggerCSVDownload(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
