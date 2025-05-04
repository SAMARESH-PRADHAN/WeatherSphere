

$(document).ready(function () {
  console.log("login.js loaded");
  $(".btnnn").click(function (event) {
    event.preventDefault();
    let user_email = $("#userEmailLogin").val().trim();
    let user_password = $("#userPasswordLogin").val().trim();

    console.log(user_email);
    console.log(user_password);

    if (user_email === "" || user_password === "") {
      swal("Error", "Please enter both email and password.", "error");
      return;
    }

    $.ajax({
      url: "http://127.0.0.1:5000/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        user_email: user_email,
        user_password: user_password,
      }),
      success: function (response) {
        if (response.message === "Login Successful") {
          localStorage.setItem(
            "user_details",
            JSON.stringify(response.user_details)
          );
          Swal.fire({
            title: "Success",
            text: "Login successful!",
            icon: "success",
          }).then(() => {
            window.location.href = "index.html";
          });

        } else {
          swal.fire({
            title: "Error",
            text: response.message,
            icon: "error"
          });
        }
      },
      error: function () {
        swal.fire({
          title: "Error",
          text: "An error occurred. Please try again later.",
          icon: "error"
        });
      },
    });
  });
});
