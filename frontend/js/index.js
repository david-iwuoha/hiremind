// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// ----------------- Metrics Counter Animation -----------------
const counters = document.querySelectorAll(".counter");
const speed = 200;

const animateCounters = () => {
  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute("data-target");
      const count = +counter.innerText;
      const increment = Math.ceil(target / speed);

      if (count < target) {
        counter.innerText = count + increment;
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
};

// Trigger counter animation when metrics section is visible
const metrics = document.querySelector("#metrics");
if (metrics) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      observer.disconnect(); // run once
    }
  }, { threshold: 0.5 });

  observer.observe(metrics);
}

// ----------------- Section Fade-In Animation -----------------
const sections = document.querySelectorAll("section");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

sections.forEach(section => {
  sectionObserver.observe(section);
});

// ----------------- Burger Menu -----------------
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links li");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("open");

  navItems.forEach((item, index) => {
    if (navLinks.classList.contains("open")) {
      item.style.transitionDelay = `${index * 0.1}s`;
    } else {
      item.style.transitionDelay = "0s";
    }
  });
});
