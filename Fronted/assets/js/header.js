
/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu')
  })
}

/* Menu hidden */
if (navClose) {
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu')
  })
}



//Profile Button
$(document).ready(function () {
  console.log("Header.js Loaded");

  const profileButton = $("#profile-btn");
  const subAdmin = $("#subAdmin");
  const subUser = $("#subUser");

  // Fetch user details from localStorage
  const userDetails = JSON.parse(localStorage.getItem("user_details"));
  console.log("User Details from localStorage:", userDetails); // Debugging

  if (userDetails && userDetails.user_name) {
    const userName = userDetails.user_name; // FIXED: Correct key
    const roleId = userDetails.role_id;

    // Update the user name inside the sub-menu
    if (roleId === 1) {
      $("#subAdmin .user-info h2").text(userName);
      subUser.hide();
    } else {
      $("#subUser .user-info h2").text(userName);
      subAdmin.hide();
    }
  } else {
    console.log("No user details found in localStorage.");
  }

  // Toggle sub-menu when clicking profile button
  profileButton.click(function () {
    if (userDetails) {
      if (userDetails.role_id === 1) {
        $("#subUser").hide();
        $("#subAdmin").toggle();
      } else {
        $("#subAdmin").hide();
        $("#subUser").toggle();
      }
    }
  });

  $(document).click(function (event) {
    if (!profileButton.is(event.target) && !subAdmin.is(event.target) && !subUser.is(event.target) && subAdmin.has(event.target).length === 0 && subUser.has(event.target).length === 0) {
      subAdmin.hide();
      subUser.hide();
    }
  });

  // Close menu when clicking outside
  $(document).click(function (event) {
    if (!$(event.target).closest("#nav-menu, #nav-toggle").length) {
      $("#nav-menu").removeClass("show-menu");
    }
  }); 8 / 721

  // Logout Button
  $(".logout-link").click(function () {
    localStorage.clear();
    window.location.href = "landing.html";
  });
});


const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
const numParticles = 30;
let animationFrameId;

// Create particles
function createParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 0.5) * 3,
      opacity: Math.random(),
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    });
  }
}

// Animate particles
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.opacity -= 0.01;
    ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.opacity <= 0) {
      particles[i] = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        opacity: Math.random(),
        color: `hsl(${Math.random() * 360}, 100%, 70%)`
      };
    }
  });
  animationFrameId = requestAnimationFrame(animateParticles);
}

// Start particles on hover
document.querySelector(".h_logo").addEventListener("mouseenter", () => {
  createParticles();
  canvas.style.display = "block";
  animateParticles();
});

// Stop particles on mouse leave
document.querySelector(".h_logo").addEventListener("mouseleave", () => {
  canvas.style.display = "none";
  cancelAnimationFrame(animationFrameId);
});

// Resize canvas dynamically
canvas.width = 300;
canvas.height = 300;
