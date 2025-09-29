// dashboard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");
  const userPhotoEl = document.getElementById("user-photo");
  const panelPhoto = document.getElementById("panel-photo");
  const panelName = document.getElementById("panel-name");
  const panelEmail = document.getElementById("panel-email");
  const greetingTitle = document.getElementById("greeting-title");
  const greetingSub = document.getElementById("greeting-sub");
  const profileProgress = document.getElementById("profile-progress");
  const progressPercent = document.getElementById("progress-percent");

  const burgerBtn = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobilePhoto = document.getElementById("mobile-photo");
  const mobileEmail = document.getElementById("mobile-email");
  const mobileLogout = document.getElementById("mobile-logout");

  const logoutBtn = document.getElementById("logout-btn");

  // Auth guard + populate user
  onAuthStateChanged(auth, user => {
    if (!user) {
      // No user → redirect to login
      window.location.href = "login.html";
      return;
    }

    const displayName = user.displayName || user.email.split("@")[0];
    const email = user.email || "—";
    const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00a0fc&color=fff&rounded=true`;

    // Populate header and panel
    userNameEl.textContent = displayName;
    userEmailEl.textContent = email;
    userPhotoEl.src = photo;
    panelPhoto.src = photo;
    panelName.textContent = displayName;
    panelEmail.textContent = email;
    mobilePhoto.src = photo;
    mobileEmail.textContent = email;

    // Greeting by time
    const hour = new Date().getHours();
    let greet = "Welcome";
    if (hour < 12) greet = "Good morning";
    else if (hour < 18) greet = "Good afternoon";
    else greet = "Good evening";
    greetingTitle.textContent = `${greet}, ${displayName.split(" ")[0]}`;

    // simple profile completeness calc
    let completeness = 30;
    if (user.displayName) completeness += 30;
    if (user.photoURL) completeness += 40;
    completeness = Math.min(100, completeness);

    // animate progress bar
    animateProgress(profileProgress, progressPercent, completeness);

    // placeholder metrics (replace with real queries later)
    document.getElementById("m-verified").innerText = 4;
    document.getElementById("m-apps").innerText = 6;
    document.getElementById("m-suggestions").innerText = 10;
  });

  // Logout handlers
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
  mobileLogout?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });

  // Mobile menu toggle
  burgerBtn?.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mobileMenu) return;
    if (!mobileMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
      mobileMenu.classList.remove("open");
    }
  });

  // Smooth counters for metrics using IntersectionObserver
  const metrics = document.querySelectorAll(".metric .metric-value");
  const metricsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target || el.innerText || "0", 10) || Number(el.innerText);
      animatedCount(el, 0, Number(el.innerText), 700);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });

  metrics.forEach(m => {
    // set data-target from innerText for animation
    m.dataset.target = m.innerText;
    m.innerText = "0";
    metricsObserver.observe(m);
  });

  // Accessibility: keyboard close menu on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") mobileMenu?.classList.remove("open");
  });

  // helper functions
  function animateProgress(barEl, percentEl, target) {
    let cur = 0;
    const step = Math.max(1, Math.round(target / 30));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(t);
      }
      barEl.style.width = cur + "%";
      percentEl.textContent = cur + "%";
    }, 18);
  }

  function animatedCount(el, from, to, duration) {
    const start = performance.now();
    const rAF = (ts) => {
      const elapsed = ts - start;
      const progress = Math.min(1, elapsed / duration);
      const value = Math.floor(from + (to - from) * progress);
      el.innerText = value;
      if (progress < 1) requestAnimationFrame(rAF);
    };
    requestAnimationFrame(rAF);
  }
});
