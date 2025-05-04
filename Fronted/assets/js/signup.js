
$(document).ready(function () {
  // Load header and footer
  // $("#header").load("header.html");
  // $("#footer").load("footer.html");
  // $("#header").css("background", "none");
  console.log("signup.js loaded");
  let captchaText = "";

  // Function to generate CAPTCHA
  function generateCaptcha() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaText = captcha;
    $("#captchaDisplay").text(captcha);
  }

  // Initial CAPTCHA generation
  generateCaptcha();

  // Refresh CAPTCHA
  $("#refreshCaptcha").click(function (e) {
    e.preventDefault();
    generateCaptcha();
  });

  // Form submission and validation
  $("#signupForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    var user_name = $("#user_name").val();
    var user_email = $("#user_mail").val();
    var user_mobile_no = $("#user_mobile_no").val();
    var user_password = $("#userPassword").val();
    var confirmPassword = $("#confirmPassword").val();
    var inputCaptcha = $("#captchaInput").val();
    console.log(inputCaptcha);

    // Validation for username and password
    if (user_email === "") {
      swal.fire("Error", "Please enter your Email.", "error");
      return false;
    } else if (user_name === "") {
      swal.fire("Error", "Please enter your username.", "error");
      return false;
    } else if (user_mobile_no === "") {
      swal.fire("Error", "Please enter your mobile number.", "error");
      return false;
    } else if (user_password === "") {
      swal.fire("Error", "Please enter your password.", "error");
      return false;
    } else if (confirmPassword === "") {
      swal.fire("Error", "Please confirm your password.", "error");
      return false;
    } else if (inputCaptcha === "") {
      swal.fire("Error", "Please enter the CAPTCHA.", "error");
      return false;
    } else if (inputCaptcha !== captchaText) {
      swal.fire("Error", "Invalid CAPTCHA. Please try again.", "error");
      return false;
    } else {
      var user_emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!user_email.match(user_emailRegex)) {
        swal.fire("Error", "Enter Valid Email.", "error");
        return false;
      }

      var user_nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!user_name.match(user_nameRegex)) {
        swal.fire(
          "Error",
          "Username can only contain letters, numbers, and underscores.",
          "error"
        );
        return false;
      }

      // Validation for username length
      if (user_name.length < 3 || user_name.length > 10) {
        swal.fire(
          "Error",
          "Username must be between 3 and 10 characters long.",
          "error"
        );
        return false;
      }

      var mobileRegex = /^[0-9]{10}$/;
      if (!user_mobile_no.match(mobileRegex)) {
        swal.fire(
          "Error",
          "Invalid mobile number. Please enter a 10-digit number.",
          "error"
        );
        return false;
      }

      // Validation for password
      var user_passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&])[a-zA-Z\d!@#$%^&]{6,}$/;
      if (!user_password.match(user_passwordRegex)) {
        swal.fire(
          "Error",
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
          "error"
        );
        return false;
      }

      // Validation for password confirmation
      if (user_password !== confirmPassword) {
        swal.fire("Error", "Passwords do not match.", "error");
        return false;
      }
    }

    submitForm();
  });

  function submitForm() {
    var user_name = $("#user_name").val();
    var user_password = $("#userPassword").val();
    var user_email = $("#user_mail").val();
    var user_mobile_no = $("#user_mobile_no").val();

    var data = {
      "user_name": user_name,
      "user_password": user_password,
      "user_email": user_email,
      "user_mobile_no": user_mobile_no,
    };

    // AJAX request
    $.ajax({
      type: "POST",
      url: "http://127.0.0.1:5000/registration",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        swal.fire("Success", "Registration successful!", "success").then(() => {
          $("#signupModal").modal("hide"); // Hide signup modal
          $("#exampleModalToggle").modal("show"); // Show login modal
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        swal.fire("Error", "An error occurred. Please try again later.", "error");
      },
    });
  }
});



//Contact form
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".c_form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    let name = document.getElementById("name-field").value.trim();
    let email = document.getElementById("email-field").value.trim();
    let subject = document.getElementById("subject-field").value.trim();
    let message = document.getElementById("message-field").value.trim();

    if (!name || !email || !subject || !message) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    let formData = {
      "c_name": name,
      "c_email": email,
      "c_subject": subject,
      "c_message": message
    };
    console.log(formData);
    try {
      let response = await fetch("http://127.0.0.1:5000/submitContact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      let data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Message Sent!",
          text: "Your message has been successfully send in our Team. We will contact you soon..",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          document.querySelector(".c_form").reset(); // Reset form after success
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to send message. Please try again!", "error");
      console.error("Error:", error);
    }
  });
});
