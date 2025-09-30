const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const txIdEl = document.getElementById("txId");
const txStatusEl = document.getElementById("txStatus");
const proofHashEl = document.getElementById("proofHash");
const downloadLink = document.getElementById("downloadLink");
const downloadWrap = document.getElementById("downloadWrap");
const fontBytes = await fetch("/fonts11/DejaVuSans.ttf").then(res => res.arrayBuffer());



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
  statusEl.innerHTML = "";

  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = "Select a PDF first.";
    return;
  }

  // show spinner
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

    // fill results
    txIdEl.textContent = data.txId || "n/a";
    txStatusEl.textContent = data.consensusStatus || "n/a";
    proofHashEl.textContent = data.proof?.sha256 || "n/a";

    if (data.stampedFile) {
      downloadLink.href = `/download/${encodeURIComponent(data.stampedFile)}`;
      downloadLink.textContent = "Download sealed PDF";
      downloadWrap.style.display = "block";
    } else {
      downloadWrap.style.display = "none";
    }

    statusEl.textContent = "Done ✅";
    resultEl.hidden = false;
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


// Show selected file name
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    statusEl.innerHTML = `
      <div class="file-preview">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#00a0fc" viewBox="0 0 24 24">
          <path d="M6 2a2 2 0 0 0-2 2v16c0 
          1.1.9 2 2 2h12a2 2 0 0 
          0 2-2V8l-6-6H6z"/>
        </svg>
        <span>${file.name}</span>
      </div>
    `;
  }
});