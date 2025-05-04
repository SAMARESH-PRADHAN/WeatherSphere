$(document).ready(function () {
  $("#header").load("header.html");
  $("#footer").load("footer.html");
  $("#header").css("background", "none");

  const apiUrl = "http://127.0.0.1:5000/users";
  const usersPerPage = 5;
  let currentPage = 1;
  let allUsers = [];

  function renderPagination(totalPages) {
    let paginationHtml = `<nav><ul class="pagination justify-content-center mt-3">`;

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link page-num" href="#">${i}</a>
        </li>`;
    }

    paginationHtml += `</ul></nav>`;
    $(".table-responsive").append(paginationHtml);
  }

  function renderTable(users) {
    const start = (currentPage - 1) * usersPerPage;
    const paginatedUsers = users.slice(start, start + usersPerPage);
    let rows = "";

    paginatedUsers.forEach((user, index) => {
      const statusBtnText = user.is_active ? "Deactivate" : "Activate";
      const statusBtnClass = user.is_active ? "btn-danger" : "btn-success";
      rows += `
        <tr data-id="${user.user_id}" data-status="${user.is_active}">
          <td>${start + index + 1}</td>
          <td>${user.user_name}</td>
          <td>${user.user_email}</td>
          <td>${user.user_mobile_no}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn">Edit</button>
            <button class="btn ${statusBtnClass} btn-sm status-btn">${statusBtnText}</button>
            <button class="btn btn-danger btn-sm delete-btn">Delete</button>
          </td>
        </tr>`;
    });

    $("#userTableBody").html(rows);
    $(".pagination").remove(); // Remove old pagination
    renderPagination(Math.ceil(users.length / usersPerPage));
  }

  function loadUsers() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      dataType: "json",
      success: function (users) {
        allUsers = users;
        renderTable(allUsers);
      },
      error: function (xhr) {
        console.error("Error loading users:", xhr.responseText);
        alert("Failed to load users.");
      },
    });
  }

  loadUsers();

  $(document).on("click", ".page-num", function (e) {
    e.preventDefault();
    currentPage = parseInt($(this).text());
    renderTable(allUsers);
  });


  window.addUser = function () {
    Swal.fire({
      title: "Add New User",
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Name">' +
        '<input id="swal-email" class="swal2-input" placeholder="Email">' +
        '<input id="swal-mobile" class="swal2-input" placeholder="Mobile">' +
        '<input id="swal-password" class="swal2-input" type="password" placeholder="Password">',
      showCancelButton: true,
      confirmButtonText: "Add",
      preConfirm: () => {
        const userData = {
          user_name: document.getElementById("swal-name").value.trim(),
          user_email: document.getElementById("swal-email").value.trim(),
          user_mobile_no: document.getElementById("swal-mobile").value.trim(),
          user_password: document.getElementById("swal-password").value.trim(),
        };

        if (
          !userData.user_name ||
          !userData.user_email ||
          !userData.user_mobile_no ||
          !userData.user_password
        ) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to add user");
            return response.json();
          })
          .then((data) => {
            Swal.fire("Success", data.message, "success");
            loadUsers();
          })
          .catch((error) => {
            console.error("Add User Error:", error);
            Swal.fire("Error", "Failed to add user", "error");
          });
      },
    });
  };

  $(document).on("click", ".edit-btn", function () {
    let row = $(this).closest("tr");
    let user_id = row.data("id");
    let user_name = row.find("td:eq(1)").text();
    let user_email = row.find("td:eq(2)").text();
    let user_mobile_no = row.find("td:eq(3)").text();

    Swal.fire({
      title: "Edit User",
      html:
        `<input id="swal-name" class="swal2-input" value="${user_name}" placeholder="Name">` +
        `<input id="swal-email" class="swal2-input" value="${user_email}" placeholder="Email">` +
        `<input id="swal-mobile" class="swal2-input" value="${user_mobile_no}" placeholder="Mobile">`,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => {
        const updatedUser = {
          user_name: document.getElementById("swal-name").value.trim(),
          user_email: document.getElementById("swal-email").value.trim(),
          user_mobile_no: document.getElementById("swal-mobile").value.trim(),
        };

        if (
          !updatedUser.user_name ||
          !updatedUser.user_email ||
          !updatedUser.user_mobile_no
        ) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return fetch(`${apiUrl}/${user_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to update user");
            return response.json();
          })
          .then((data) => {
            Swal.fire("Success", data.message, "success");
            loadUsers();
          })
          .catch((error) => {
            console.error("Update User Error:", error);
            Swal.fire("Error", "Failed to update user", "error");
          });
      },
    });
  });

  $(document).on("click", ".delete-btn", function () {
    let user_id = $(this).closest("tr").data("id");

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}/${user_id}`, { method: 'DELETE' })
          .then(response => {
            if (!response.ok) throw new Error('Failed to delete user');
            return response.json();
          })
          .then(() => {
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            loadUsers();
          })
          .catch(error => {
            console.error("Delete User Error:", error);
            Swal.fire('Error', 'Failed to delete user', 'error');
          });
      }
    });
  });
  $(document).on("click", ".status-btn", function () {
    let row = $(this).closest("tr");
    let user_id = row.data("id");
    let currentStatus = row.data("status");
    let newStatus = !currentStatus;

    let action = newStatus ? "activate" : "deactivate";

    Swal.fire({
      title: `Are you sure you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}/${user_id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: newStatus }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Status update failed");
            return res.json();
          })
          .then((data) => {
            Swal.fire("Success", data.message, "success");
            loadUsers();
          })
          .catch((err) => {
            console.error("Status Update Error:", err);
            Swal.fire("Error", "Failed to change user status", "error");
          });
      }
    });
  });

});
$(document).ready(function () {
  function filterUsers() {
    let searchTerm = $('#generalSearch').val().toLowerCase();
    $('#userTable tbody tr').each(function () {
      let name = $(this).find('td:eq(1)').text().toLowerCase();
      let email = $(this).find('td:eq(2)').text().toLowerCase();
      let phone = $(this).find('td:eq(3)').text().toLowerCase();
      let regDateStr = $(this).find('td:eq(5)').text(); // "2025-02-07 12:31:08.940678"

      let showRow = true;

      // General search match
      if (searchTerm && !(name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm))) {
        showRow = false;
      }

      $(this).toggle(showRow);
    });
  }

  $('#generalSearch').on('keyup', filterUsers);
  $('#filterBtn').on('click', filterUsers);
});
