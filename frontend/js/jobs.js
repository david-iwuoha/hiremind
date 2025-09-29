// Carousel Scroll
const track = document.querySelector(".carousel-track");
const leftBtn = document.querySelector(".carousel-btn.left");
const rightBtn = document.querySelector(".carousel-btn.right");

rightBtn.addEventListener("click", () => {
  track.scrollBy({ left: 300, behavior: "smooth" });
});
leftBtn.addEventListener("click", () => {
  track.scrollBy({ left: -300, behavior: "smooth" });
});

// Burger Menu
const burger = document.querySelector(".burger");
const backBtn = document.querySelector(".btn-back");

burger.addEventListener("click", () => {
  backBtn.style.display =
    backBtn.style.display === "block" ? "none" : "block";
  backBtn.style.transition = "all 0.3s ease";
});
