// login.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Elements
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const registerMessage = document.getElementById("register-message");
const loginMessage = document.getElementById("login-message");

// Toggle forms
document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

// Register with Email/Password
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    registerMessage.style.color = "green";
    registerMessage.innerText = "Account created successfully!";
    // Redirect after success
    window.location.href = "dashboard.html";
  } catch (error) {
    registerMessage.style.color = "red";
    registerMessage.innerText = error.message;
  }
});

// Login with Email/Password
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMessage.style.color = "green";
    loginMessage.innerText = "Login successful!";
    // Redirect after success
    window.location.href = "dashboard.html";
  } catch (error) {
    loginMessage.style.color = "red";
    loginMessage.innerText = error.message;
  }
});

// Google Auth
document.querySelectorAll(".google-auth").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect after success
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("Google Sign-in failed: " + error.message);
    }
  });
});


// Close button → back to landing page
document.querySelectorAll(".form-close").forEach(btn => {
  btn.addEventListener("click", () => {
    window.location.href = "index.html"; // redirect to landing
  });
});

