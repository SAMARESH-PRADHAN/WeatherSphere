$(document).ready(function () {
  // Ensure modals properly switch
  $('[data-bs-target="#signupModal"]').on("click", function (e) {
    e.preventDefault();
    $("#exampleModalToggle").modal("hide");
    setTimeout(() => {
      $("#signupModal").modal("show");
    }, 300);
  });

  $('[data-bs-target="#exampleModalToggle"]').on("click", function (e) {
    e.preventDefault();
    $("#signupModal").modal("hide");
    setTimeout(() => {
      $("#exampleModalToggle").modal("show");
    }, 300);
  });

  // Fix aria-hidden issue for login modal
  $("#exampleModalToggle").on("shown.bs.modal", function () {
    $(this).removeAttr("aria-hidden").removeAttr("inert");
  });

  $("#exampleModalToggle").on("hidden.bs.modal", function () {
    $(this).attr("inert", "true");
  });

  // Fix aria-hidden issue for signup modal
  $("#signupModal").on("shown.bs.modal", function () {
    $(this).removeAttr("aria-hidden").removeAttr("inert");
  });

  $("#signupModal").on("hidden.bs.modal", function () {
    $(this).attr("inert", "true");
  });
});
