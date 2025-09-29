// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
// 🔑 Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAOtJOl48ZQE2o-H4vUYYbhx0Twf_AaVdI",
  authDomain: "hiremind-6097c.firebaseapp.com",
  projectId: "hiremind-6097c",
  storageBucket: "hiremind-6097c.firebasestorage.app",
  messagingSenderId: "838429569829",
  appId: "1:838429569829:web:06b5fee90fa557e08f20cc"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add storage export
export const storage = getStorage(app);