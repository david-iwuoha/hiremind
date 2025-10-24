const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const txIdEl = document.getElementById("txId");
const txStatusEl = document.getElementById("txStatus");
const proofHashEl = document.getElementById("proofHash");
const downloadLink = document.getElementById("downloadLink");
const downloadWrap = document.getElementById("downloadWrap");

/* Burger menu */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
if (burger && navLinks) {
  burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

/* Upload form */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.hidden = true;
  statusEl.innerHTML = "";  // Clear any previous status message

  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = "Select a PDF first.";
    return;
  }

  // Show the "Uploading & Anchoring" spinner initially
  statusEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" fill="none"/>
    </svg>
    <p>Uploading & anchoring...</p>
  `;

  try {
    const fd = new FormData();
    fd.append("file", file);

    const resp = await fetch("https://hiremind.onrender.com/upload", { method: "POST", body: fd });
    const data = await resp.json();

    if (!data || data.error || !data.success) {
      statusEl.textContent = "Error: " + (data?.error || "upload failed");
      return;
    }

    // Step 1: Hide the "Uploading & Anchoring" message and show the new "Done" pop-up
    statusEl.innerHTML = "";  // Clear the spinner and message
    const donePopup = document.getElementById("donePopup");
    donePopup.style.display = "block";  // Show the pop-up

    // Step 2: Show loader bar progress (this starts after verification is complete)
    const loaderBar = document.getElementById("loaderBar");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      loaderBar.style.width = `${progress}%`;

      // Step 3: Once the loader is full, hide the pop-up and show the verification details
      if (progress === 100) {
        clearInterval(interval);  // Stop the loader once it reaches 100%
        setTimeout(() => {
          donePopup.style.display = "none";  // Hide the pop-up after loader finishes
          resultEl.hidden = false;  // Show the result section with verification details
        }, 500);  // Wait a moment before hiding the pop-up
      }
    }, 10);  // Update progress every 10ms (adjust for faster loader)

    // Step 4: Fill the verification results (Tx ID, Status, Proof Hash)
    txIdEl.textContent = data.txId || "n/a";
    txStatusEl.textContent = data.consensusStatus || "n/a";
    proofHashEl.textContent = data.proof?.sha256 || "n/a";

    // Step 5: Apply green color for "SUCCESS" status
    if (txStatusEl.textContent.toLowerCase() === "success") {
      txStatusEl.style.color = "green"; // Change text color to green if status is "SUCCESS"
      txStatusEl.style.fontWeight = "bold"; // Make text bold for "SUCCESS"
    } else {
      txStatusEl.style.color = "black"; // Default color if it's not SUCCESS
      txStatusEl.style.fontWeight = "normal"; // Keep it normal if not "SUCCESS"
    }

    if (data.stampedFileUrl) {
      downloadLink.href = data.stampedFileUrl; // Direct Cloudinary link
      downloadLink.textContent = "Download sealed PDF";
      downloadWrap.style.display = "block";
    } else {
      downloadWrap.style.display = "none";
    }

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Upload failed: " + String(err);
  }
});

/* Copy buttons */
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-copy");
    const text = document.getElementById(targetId).textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = "✔";
      setTimeout(() => {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7h13v13H8z"/><path d="M5 17H4V4h13v1H5z"/></svg>
        `;
      }, 1000);
    });
  });
});

// Show selected file name and size inside the upload area with PDF icon
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    // Get the file name and size
    const fileSize = (file.size / 1024).toFixed(2); // Convert size to KB
    const pdfIcon = `<svg class="pdf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"/></svg>`;

    // Update the file info inside the drop-area
    const fileInfo = document.getElementById("fileInfo");
    fileInfo.innerHTML = `${pdfIcon} <span>${file.name} (${fileSize} KB)</span>`;
    fileInfo.style.display = "flex"; // Make sure it's displayed inside the drop-area
  }
});
