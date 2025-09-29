const uploadBox = document.getElementById("uploadBox");
const resumeInput = document.getElementById("resumeInput");
const previewBox = document.getElementById("previewBox");
const statusEl = document.getElementById("status");
const replaceBtn = document.getElementById("replaceBtn");

// Clicking upload box triggers input
uploadBox.addEventListener("click", () => resumeInput.click());

// Handle fake upload
resumeInput.addEventListener("change", () => {
  if (resumeInput.files.length > 0) {
    statusEl.textContent = "Uploading... ⏳";
    setTimeout(() => {
      statusEl.textContent = "Upload successful ✅";
      previewBox.hidden = false;
    }, 1500);
  }
});

// Replace resume
replaceBtn.addEventListener("click", () => {
  resumeInput.value = "";
  previewBox.hidden = true;
  statusEl.textContent = "Upload a new resume.";
});

// Burger menu (simple demo)
const burger = document.querySelector(".burger");
const backBtn = document.querySelector(".btn-back");
burger.addEventListener("click", () => {
  backBtn.style.display = backBtn.style.display === "block" ? "none" : "block";
  backBtn.style.transition = "all 0.3s ease";
});
