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



function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateStr).toLocaleString(undefined, options);
}

let contactData = [], contactSortOrder = 'desc', feedbackSortOrder = 'desc', feedbackData = [];
const itemsPerPage = 5;
let contactFilterStatus = 'all'; // 'all', 'read', 'unread'



// Modal to show full message
function showModal(message, improvement = "", type = "feedback") {
  let title = type === "contact" ? "📨 Contact Message" : "📝 Feedback & Suggestions";

  let modalBody = `
    <div class="modal-section">
      <h6>${type === "contact" ? "📩 Message" : "📝 Feedback"}</h6>
      <p>${message}</p>
    </div>`;

  if (type === "feedback" && improvement) {
    modalBody += `
      <hr class="divider-glow">
      <div class="modal-section">
        <h6>💡 Improvement Suggestion</h6>
        <p>${improvement}</p>
      </div>`;
  }

  $('#messageModalLabel').html(title);
  $('#modalMessageContent').html(modalBody);
  new bootstrap.Modal(document.getElementById('messageModal')).show();
}


// Render pagination controls
function renderPagination(containerId, totalItems, onPageChange) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const container = $(containerId).empty();

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const li = $(`<li class='page-item'><a class='page-link'>${i}</a></li>`);
    li.click(() => {
      onPageChange(i);
      $(`${containerId} .page-item`).removeClass("active");
      li.addClass("active");
    });
    container.append(li);
  }

  container.find("li:first").addClass("active");
}

// Contact rendering
function renderContactPage(page) {
  const sortedData = [...contactData]; // Clone array
  sortedData.sort((a, b) => {
    const dateA = new Date(a.created_on);
    const dateB = new Date(b.created_on);
    return contactSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Apply filter
  const filteredData = sortedData.filter(item => {
    if (contactFilterStatus === 'read') return item.status === 'read';
    if (contactFilterStatus === 'unread') return item.status === 'unread';
    return true;
  });


  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const items = filteredData.slice(start, end);


  $("#contactContainer").empty();

  if (items.length === 0) {
    $("#contactContainer").append(
      `<p class="text-center text-muted">No contact messages found.</p>`
    );
  } else {
    items.forEach((item) => {
      const isUnread = item.status === 'unread';
      const statusDotClass = isUnread ? 'red' : 'green';
      $("#contactContainer").append(`
        <div class="cardd p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5>${item.c_name} (${item.c_email})</h5>
            </div>
            <div>
              <span class="status-dot ${statusDotClass}"></span>
            </div>
          </div>
          <span class="ttt">Submission Date : ${formatDate(item.created_on)}</span>
          <p class="mt-2"><strong>Subject:</strong> ${item.c_subject}</p>
          ${isUnread ? `<p><button class="btn btn-outline-primary btn-sm" onclick="markAsRead(${item.contact_id})">Mark as Replied</button></p>` : ''}
          <p><button class="btn btn-sm btn-outline-info" onclick="showModal(\`${item.c_message}\`, '', 'contact')">View Message</button></p>
        </div>
      `);
    });
  }
  // Re-render pagination with filtered data
  renderPagination('#contactPagination', filteredData.length, renderContactPage);
}

// Feedback rendering
function renderFeedbackPage(page) {
  const sortedData = [...feedbackData];
  sortedData.sort((a, b) => {
    const dateA = new Date(a.submitted_at);
    const dateB = new Date(b.submitted_at);
    return feedbackSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const items = sortedData.slice(start, end);

  $('#feedbackContainer').empty();

  if (items.length === 0) {
    $('#feedbackContainer').append(`<p class="text-center text-muted">No feedback found.</p>`);
  } else {
    items.forEach(item => {
      $('#feedbackContainer').append(`
        <div class="cardd p-3">
          <h5>${item.user_name} (Rating: ${'⭐'.repeat(item.rating)} (${item.rating}/5))</h5>
          <small class="ttt">Submission Date : ${formatDate(item.submitted_at)}</small>
          <p class="mt-2"><strong>Feedback:</strong> ${item.feedback || '<em>No suggestions provided</em>'}</p>
          <p><button class="btn btn-sm btn-outline-info" onclick="showModal(\`${item.feedback}\`, \`${item.improvement}\`)">View Full Feedback</button></p>
        </div>
      `);
    });
  }
}

// Fetch Contact API
function fetchContactData() {
  const start = $('#contactStartDate').val();
  const end = $('#contactEndDate').val();

  let url = `http://127.0.0.1:5000/get_contact`;
  if (start && end) {
    url += `?start=${start}&end=${end}`;
  }

  $.getJSON(url, (data) => {
    contactData = data;
    renderContactPage(1);
    renderPagination('#contactPagination', contactData.length, renderContactPage);
  }).fail(() => {
    $('#contactContainer').html(`<p class="text-danger text-center">❌ Failed to load contact data.</p>`);
  });
}

// Fetch Feedback API
function fetchFeedbackData() {
  $.getJSON('http://127.0.0.1:5000/get_feedback', (data) => {
    feedbackData = data;
    renderFeedbackPage(1);
    renderPagination('#feedbackPagination', feedbackData.length, renderFeedbackPage);
  }).fail(() => {
    $('#feedbackContainer').html(`<p class="text-danger text-center">❌ Failed to load feedback data.</p>`);
  });
}


// function markAsRead(contact_id) {
//   fetch(`http://127.0.0.1:5000/mark-contact-read/${contact_id}`, {
//     method: 'POST'
//   })
//     .then(res => res.json())
//     .then(data => {
//       if (data.success) {
//         // Reload contact data
//         fetchContactData(); // this exists and reloads data
//       }
//     });
// }
function markAsRead(contact_id) {
  console.log("Marking as read:", contact_id);
  fetch(`http://127.0.0.1:5000/mark-contact-read/${contact_id}`, {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      console.log("Server response:", data);
      if (data.success) {
        fetchContactData();
      } else {
        alert("Failed to mark as read: " + (data.error || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      alert("Error connecting to server.");
    });
}


// Initial fetch when document is ready
$(document).ready(() => {
  fetchContactData();
  fetchFeedbackData();

  $('#toggleSortBtn').click(function () {
    contactSortOrder = contactSortOrder === 'asc' ? 'desc' : 'asc';
    const newText = contactSortOrder === 'asc'
      ? '⏬ Sort: Oldest First'
      : '⏫ Sort: Newest First';
    $(this).text(newText);
    renderContactPage(1);
  });

  $('#toggleFeedbackSortBtn').on('click', () => {
    feedbackSortOrder = feedbackSortOrder === 'asc' ? 'desc' : 'asc';
    $('#toggleFeedbackSortBtn').html(
      feedbackSortOrder === 'asc' ? '⏬ Sort: Oldest First' : '⏫ Sort: Newest First'
    );
    renderFeedbackPage(1); // refresh with new sort order
  });



  $('#filterAllBtn').on('click', () => {
    contactFilterStatus = 'all';
    setActiveFilterBtn('filterAllBtn');
    renderContactPage(1);
  });

  // $('#filterReadBtn').on('click', () => {
  //   contactFilterStatus = 'read';
  //   setActiveFilterBtn('filterReadBtn');
  //   renderContactPage(1);
  // });

  $('#filterUnreadBtn').on('click', () => {
    contactFilterStatus = 'unread';
    setActiveFilterBtn('filterUnreadBtn');
    renderContactPage(1);
  });

  function setActiveFilterBtn(activeId) {
    $('#filterAllBtn, #filterReadBtn, #filterUnreadBtn').removeClass('active');
    $(`#${activeId}`).addClass('active');
  }





  // Re-render when tabs change
  $('button[data-bs-toggle="tab"]').on("shown.bs.tab", function (e) {
    const target = $(e.target).data("bs-target");
    if (target === "#contactTab") {
      renderPagination(
        "#contactPagination",
        contactData.length,
        renderContactPage
      );
      renderContactPage(1);
    } else if (target === "#feedbackTab") {
      renderPagination(
        "#feedbackPagination",
        feedbackData.length,
        renderFeedbackPage
      );
      renderFeedbackPage(1);
    }
  });



});
