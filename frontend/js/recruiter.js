/* recruiter.js
   - Adds recruiter access modal (company + PIN)
   - Loads "verified" table from /verified (fallback to sample data)
   - Keeps your verify form handler exactly unchanged (copied at bottom)
*/

/* ---------- UI references ---------- */
const accessModal = document.getElementById("accessModal");
const companySelect = document.getElementById("companySelect");
const companyLogo = document.getElementById("companyLogo");
const companyPin = document.getElementById("companyPin");
const modalSubmit = document.getElementById("modalSubmit");
const modalCancel = document.getElementById("modalCancel");
const modalError = document.getElementById("modalError");
const mainContent = document.getElementById("mainContent");
const refreshTableBtn = document.getElementById("refreshTable");
const verifiedTbody = document.getElementById("verifiedTbody");
const tableNote = document.getElementById("tableNote");
const resultBox = document.getElementById("result");
const txInput = document.getElementById("txId");

/* ---------- Demo company data & assets ---------- */
const COMPANY_LOGOS = {
  dora: "dorahacks-logo.png",
  acme: "company-placeholder.png",
  globex: "company-placeholder.png",
  stark: "company-placeholder.png",
  umbrella: "company-placeholder.png"
};

/* ---------- initial modal behavior ---------- */
function showModal() {
  accessModal.style.display = "flex";
  mainContent.setAttribute("aria-hidden", "true");
}
function hideModal() {
  accessModal.style.display = "none";
  mainContent.removeAttribute("aria-hidden");
}
showModal();

function updateCompanyLogo() {
  const key = companySelect.value;
  companyLogo.src = COMPANY_LOGOS[key] || "company-placeholder.png";
}
companySelect.addEventListener("change", updateCompanyLogo);
updateCompanyLogo(); // initial

modalCancel.addEventListener("click", () => {
  modalError.textContent = "";
  hideModal();
});

modalSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const selected = companySelect.value;
  const pin = (companyPin.value || "").trim();
  const correctPin = "090845";

  if (selected === "dora" && pin === correctPin) {
    modalError.textContent = "";
    hideModal();
    loadVerifiedDocs();
    return;
  }

  modalError.textContent = "Incorrect PIN or access denied for selected company.";
  const box = document.querySelector(".modal-box");
  box.classList.remove("shake");
  void box.offsetWidth;
  box.classList.add("shake");
});

/* ---------- Verified table loading ---------- */
async function loadVerifiedDocs() {
  tableNote.textContent = "Loading...";
  try {
    const res = await fetch("/verified");
    if (!res.ok) throw new Error("No backend response");
    const data = await res.json();
    populateTable(data);
    tableNote.textContent = "Loaded from backend.";
  } catch (err) {
    console.warn("Fetch /verified failed, using sample data:", err.message);
    const sample = [
      { txId: "0.0.6871751@1758538332.951137995", fileName: "test.pdf", sha256: "6e5c0a3b...", issuer: "0.0.6871751", verifiedAt: "2025-09-22T10:52:16Z" },
      { txId: "0.0.6871751@1758539082.954983887", fileName: "test1.pdf", sha256: "6e5c0a3b...", issuer: "0.0.6871751", verifiedAt: "2025-09-22T11:04:49Z" }
    ];
    populateTable(sample);
    tableNote.textContent = "Demo data used (verified backend). click on view to see result on hashscan";
  }
}

function populateTable(records = []) {
  verifiedTbody.innerHTML = "";
  if (!records.length) {
    verifiedTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted)">No verified documents yet.</td></tr>`;
    return;
  }

  records.forEach((r, i) => {
    const tr = document.createElement("tr");

    const viewLink = `<a class="btn small" href="https://hashscan.io/testnet/tx/${encodeURIComponent(r.txId)}" target="_blank" rel="noopener">View</a>`;

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="mono">${escapeHtml(r.txId || "")}</td>
      <td>${escapeHtml(r.fileName || "")}</td>
      <td class="mono">${escapeHtml(r.sha256 || "").slice(0, 20)}${(r.sha256 && r.sha256.length > 20) ? "…" : ""}</td>
      <td class="mono">${escapeHtml(r.issuer || "")}</td>
      <td>${escapeHtml(new Date(r.verifiedAt || Date.now()).toLocaleString())}</td>
      <td>${viewLink}</td>
    `;
    verifiedTbody.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s || "").replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

/* refresh button */
refreshTableBtn.addEventListener("click", loadVerifiedDocs);

/* ---------- Observe result box to auto-add successful verifications to table ---------- */
const resultObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === "childList" || m.type === "characterData") {
      const text = resultBox.textContent || "";
      if (text.includes("✅ Document is authentic")) {
        const txId = (txInput && txInput.value) || "unknown";
        const rec = {
          txId,
          fileName: "unknown.pdf",
          sha256: "unknown",
          issuer: "unknown",
          verifiedAt: new Date().toISOString()
        };
        prependRow(rec);
        break;
      }
    }
  }
});
resultObserver.observe(resultBox, { subtree: true, characterData: true, childList: true });

function prependRow(r) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>—</td>
    <td class="mono">${escapeHtml(r.txId)}</td>
    <td>${escapeHtml(r.fileName)}</td>
    <td class="mono">${escapeHtml(r.sha256).slice(0, 20)}…</td>
    <td class="mono">${escapeHtml(r.issuer)}</td>
    <td>${new Date(r.verifiedAt).toLocaleString()}</td>
    <td><a class="btn small" href="https://hashscan.io/testnet/tx/${encodeURIComponent(r.txId)}" target="_blank" rel="noopener">View</a></td>
  `;
  verifiedTbody.insertBefore(tr, verifiedTbody.firstChild);
}

/* ---------- Verification Handler ---------- */
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const txId = document.getElementById("txId").value;

  // Show loader pop-up
  const verificationPopup = document.createElement("div");
  verificationPopup.classList.add("verification-result-popup");
  verificationPopup.innerHTML = `
    <div class="popup-content">
      <h2>Verifying...</h2>
      <div class="loader-bar-container">
        <div class="loader-bar"></div>
      </div>
      <p>Please wait while we verify the document.</p>
    </div>
  `;
  document.body.appendChild(verificationPopup);

  try {
    const res = await fetch("https://hiremind.onrender.com/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txId })
    });

    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();

    // Handle result and pop-up close after 1 second to allow users to see the loader
    setTimeout(() => {
      verificationPopup.remove(); // Remove loader pop-up

      const resultBox = document.getElementById("result");
      if (data.valid) {
        resultBox.textContent = "✅ Document is authentic!";
        resultBox.classList.add("valid");
      } else {
        resultBox.textContent = "❌ Not authentic.\n\n" + (data.message || data.error || "Verification failed");
        resultBox.classList.add("invalid");
      }
    }, 1000); // Wait for loader to complete and close after that

  } catch (err) {
    const resultBox = document.getElementById("result");
    resultBox.textContent = "❌ Not Authentic: " + err.message;
    resultBox.classList.add("invalid");

    // Ensure the popup closes even in case of error
    setTimeout(() => {
      verificationPopup.remove(); // Remove loader pop-up
    }, 1000); // Wait for error message to show, then remove popup
  }
});