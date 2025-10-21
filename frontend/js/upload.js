/* upload.js
   - Uses XHR to provide upload progress
   - Keeps backend endpoint unchanged (https://hiremind.onrender.com/upload)
   - Shows progress bar and success modal
*/

const BACKEND_UPLOAD_URL = "https://hiremind.onrender.com/upload"; // <--- keep this as your backend
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const txIdEl = document.getElementById("txId");
const txStatusEl = document.getElementById("txStatus");
const proofHashEl = document.getElementById("proofHash");
const downloadLink = document.getElementById("downloadLink");
const downloadWrap = document.getElementById("downloadWrap");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");

const dropArea = document.getElementById("dropArea");
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
const successModal = document.getElementById("successModal");
const modalDownload = document.getElementById("modalDownload");
const modalClose = document.getElementById("modalClose");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// burger toggle (mobile)
if (burger && navLinks) {
  burger.addEventListener("click", () => navLinks.classList.toggle("active"));
}

// drag & drop UX
;["dragenter","dragover"].forEach(ev => {
  dropArea.addEventListener(ev, (e) => { e.preventDefault(); dropArea.classList.add("hover"); });
});
;["dragleave","drop"].forEach(ev => {
  dropArea.addEventListener(ev, (e) => { e.preventDefault(); dropArea.classList.remove("hover"); });
});
dropArea.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) fileInput.files = e.dataTransfer.files;
  showSelectedFileName();
});

// show selected file name
function showSelectedFileName(){
  const file = fileInput.files[0];
  if (file) {
    statusEl.innerHTML = `<div class="file-preview"><strong>${escapeHtml(file.name)}</strong> • ${(file.size/1024|0)} KB</div>`;
  } else {
    statusEl.textContent = "";
  }
}
fileInput.addEventListener("change", showSelectedFileName);

// helper
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }

// copy buttons
document.querySelectorAll(".copy-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const targetId = btn.getAttribute("data-copy");
    const text = document.getElementById(targetId).textContent.trim();
    navigator.clipboard.writeText(text).then(()=>{
      const prev = btn.innerHTML;
      btn.innerHTML = "✓";
      setTimeout(()=> btn.innerHTML = prev, 1000);
    });
  });
});

// handle form submit with XHR to show progress
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  resultEl.hidden = true;
  statusEl.textContent = "";

  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = "Select a PDF or DOCX first.";
    return;
  }

  // prepare UI
  progressWrap.style.display = "block";
  progressBar.style.width = "0%";
  statusEl.innerHTML = "Preparing upload...";

  const fd = new FormData();
  fd.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", BACKEND_UPLOAD_URL, true);

  xhr.upload.onprogress = (evt)=>{
    if (evt.lengthComputable) {
      const pct = Math.round((evt.loaded / evt.total) * 100);
      progressBar.style.width = pct + "%";
      statusEl.innerHTML = `Uploading & anchoring... ${pct}%`;
    }
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      progressWrap.style.display = "none";
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (!data || data.error || !data.success) {
            statusEl.textContent = "Error: " + (data?.error || "upload failed");
            return;
          }

          // display results
          txIdEl.textContent = data.txId || "n/a";
          txStatusEl.textContent = data.consensusStatus || "n/a";
          proofHashEl.textContent = (data.proof && data.proof.sha256) || data.proof?.sha256 || "n/a";

          // download URL fallback logic (server may return different key names)
          const url = data.downloadUrl || data.stampedFileUrl || data.stampedFileLink || data.stampedUrl || null;
          if (url) {
            downloadLink.href = url;
            downloadLink.textContent = "View stamped copy";
            downloadWrap.style.display = "block";
            modalDownload.href = url;
          } else if (data.stampedFile) {
            // legacy: server saved file next to server root and exposes /download/:name
            downloadLink.href = `${window.location.origin}/download/${encodeURIComponent(data.stampedFile)}`;
            downloadLink.textContent = "View stamped copy";
            downloadWrap.style.display = "block";
            modalDownload.href = downloadLink.href;
          } else {
            downloadWrap.style.display = "none";
          }

          statusEl.textContent = "Done ✅";
          resultEl.hidden = false;

          // show success modal
          successModal.hidden = false;
        } else {
          statusEl.textContent = `Upload failed (server returned ${xhr.status})`;
        }
      } catch (err) {
        console.error("Parse/response error:", err, xhr.responseText);
        statusEl.textContent = "Upload failed: " + (err.message || "Unknown");
      }
    }
  };

  xhr.onerror = () => { progressWrap.style.display = "none"; statusEl.textContent = "Network error during upload"; };

  xhr.send(fd);
});

// modal close handlers
function closeModal(){ successModal.hidden = true; }
if (modalClose) modalClose.addEventListener("click", closeModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e)=> { if (e.key === "Escape") closeModal(); });
