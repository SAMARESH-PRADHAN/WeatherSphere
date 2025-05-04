$(document).ready(function () {
  // Load header and footer
  $("#header").load("header.html", function () {
    $.getScript("assets/js/header.js");
  });
  $("#footer").load("footer.html");
  $("#header").css("background", "none");
});






// Weather News
// const API_KEY = "f5755cecf90a4fee9739715fd37eea8d";
// const url = "https://newsapi.org/v2/everything?q=";

let currentPage = 1;
const itemsPerPage = 10; // Increased to 10
let allArticles = [];

async function fetchNews() {
  const API_KEY = "f5755cecf90a4fee9739715fd37eea8d";
  const url = "https://newsapi.org/v2/everything?q=weather&apiKey=" + API_KEY;
  const res = await fetch(url);
  const data = await res.json();
  allArticles = data.articles;
  displayPage(currentPage);
}

function displayPage(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  bindData(allArticles.slice(start, end));
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");
  cardsContainer.innerHTML = "";

  articles.forEach((article) => {
    if (!article.urlToImage) return;
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");

  newsImg.src = article.urlToImage;
  newsTitle.innerHTML = article.title;
  newsDesc.innerHTML = article.description;
  const date = new Date(article.publishedAt).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata", // Updated for Bhubaneswar, India
  });
  newsSource.innerHTML = `${article.source.name} · ${date}`;

  cardClone.firstElementChild.addEventListener("click", () => {
    window.open(article.url, "_blank");
  });
}

function changePage(page) {
  currentPage = page;
  displayPage(currentPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage);
  }
}

function nextPage() {
  if (currentPage * itemsPerPage < allArticles.length) {
    currentPage++;
    displayPage(currentPage);
  }
}

window.addEventListener("load", fetchNews);