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




let selectedRating = 0;
document.querySelectorAll(".rating i").forEach(star => {
  star.addEventListener("click", function () {
    selectedRating = this.getAttribute("data-value");
    document.querySelectorAll(".rating i").forEach(s => s.classList.remove("active"));
    this.classList.add("active");
    let prev = this.previousElementSibling;
    while (prev) {
      prev.classList.add("active");
      prev = prev.previousElementSibling;
    }
  });
});

function submitFeedback() {
  let feedback = document.getElementById("feedback").value.trim();
  let improvement = document.getElementById("improvement").value.trim();
  const userDetails = JSON.parse(localStorage.getItem("user_details"));
  //console.log("User Details from localStorage:", userDetails); // Debugging
  let user_id = userDetails.user_id;
  // console.log(user_id);

  if (feedback === "") {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Feedback cannot be empty!',
    });
    return;
  }

  fetch('http://127.0.0.1:5000/submit_feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedback: feedback,
      rating: selectedRating,
      improvement: improvement,
      user_id: user_id
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        Swal.fire({
          icon: 'success',
          title: 'Thank You!',
          text: 'Your feedback has been submitted.',
        });
        document.getElementById("feedback").value = "";
        document.getElementById("improvement").value = "";
        document.querySelectorAll(".rating i").forEach(s => s.classList.remove("active"));
        selectedRating = 0;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong! Try again.',
        });
      }
    });
}