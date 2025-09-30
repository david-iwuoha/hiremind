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
// You MUST place a Dora Hacks logo in repo as: dorahacks-logo.png
// Also add company-placeholder.png as fallback for the other companies.
const COMPANY_LOGOS = {
  dora: "dorahacks-logo.png",           // ➜ add this file to repo
  acme: "company-placeholder.png",
  globex: "company-placeholder.png",
  stark: "company-placeholder.png",
  umbrella: "company-placeholder.png"
};

/* ---------- initial modal behavior ---------- */
// show modal on page load (block access until validated)
function showModal() {
  accessModal.style.display = "flex";
  mainContent.setAttribute("aria-hidden", "true");
}
function hideModal() {
  accessModal.style.display = "none";
  mainContent.removeAttribute("aria-hidden");
}
// default show
showModal();

// update logo when company changes
function updateCompanyLogo() {
  const key = companySelect.value;
  companyLogo.src = COMPANY_LOGOS[key] || "company-placeholder.png";
}
companySelect.addEventListener("change", updateCompanyLogo);
updateCompanyLogo(); // initial

// modal cancel -> just keep blocked (for demo just close to go back)
modalCancel.addEventListener("click", () => {
  modalError.textContent = "";
  // if you want to deny cancel, remove the following line.
  // We'll close and still keep the page usable; adjust as needed.
  hideModal();
});

// modal submit -> validate company + pin
modalSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const selected = companySelect.value;
  const pin = (companyPin.value || "").trim();
  const correctPin = "090845";

  // Only Dora Hacks can be unlocked in this demo with the correct pin
  if (selected === "dora" && pin === correctPin) {
    modalError.textContent = "";
    hideModal();
    // load table after allowed
    loadVerifiedDocs();
    return;
  }

  // For all others or wrong pin -> show error
  modalError.textContent = "Incorrect PIN or access denied for selected company.";
  // tiny shake animation
  const box = document.querySelector(".modal-box");
  box.classList.remove("shake");
  void box.offsetWidth;
  box.classList.add("shake");
});

/* small CSS shake helper (will be defined in CSS) */
const style = document.createElement("style");
style.textContent = `
.modal-box.shake { animation: shake .36s ease; }
@keyframes shake {
  10% { transform: translateX(-6px); }
  30% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  70% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
`;
document.head.appendChild(style);

/* ---------- Verified table loading ---------- */
// expected backend endpoint: GET /verified
// expected response: JSON array of objects:
// [{ txId, fileName, sha256, issuer, verifiedAt }, ...]
async function loadVerifiedDocs() {
  tableNote.textContent = "Loading...";
  try {
    const res = await fetch("/verified");
    if (!res.ok) throw new Error("No backend response");
    const data = await res.json();
    populateTable(data);
    tableNote.textContent = "Loaded from backend.";
  } catch (err) {
    // fallback sample data (safe for demo)
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
      <td>${i+1}</td>
      <td class="mono">${escapeHtml(r.txId || "")}</td>
      <td>${escapeHtml(r.fileName || "")}</td>
      <td class="mono">${escapeHtml(r.sha256 || "").slice(0, 20)}${(r.sha256 && r.sha256.length>20) ? "…" : ""}</td>
      <td class="mono">${escapeHtml(r.issuer || "")}</td>
      <td>${escapeHtml(new Date(r.verifiedAt || Date.now()).toLocaleString())}</td>
      <td>${viewLink}</td>
    `;
    verifiedTbody.appendChild(tr);
  });
}

// small safe HTML escaper
function escapeHtml(s){ return String(s || "").replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

/* refresh button */
refreshTableBtn.addEventListener("click", loadVerifiedDocs);

/* ---------- Observe result box to auto-add successful verifications to table ---------- */
/* We do not alter your original verify code. Instead we watch the result DOM text and when it shows success we add an entry to the table. */
const resultObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === "childList" || m.type === "characterData") {
      const text = resultBox.textContent || "";
      if (text.includes("✅ Document is authentic")) {
        // Grab txId from input and push to table (basic record)
        const txId = (txInput && txInput.value) || "unknown";
        const rec = {
          txId,
          fileName: "unknown.pdf",
          sha256: "unknown",
          issuer: "unknown",
          verifiedAt: new Date().toISOString()
        };
        // Prepend row to the table
        prependRow(rec);
        // stop here for this mutation
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
    <td class="mono">${escapeHtml(r.sha256).slice(0,20)}…</td>
    <td class="mono">${escapeHtml(r.issuer)}</td>
    <td>${new Date(r.verifiedAt).toLocaleString()}</td>
    <td><a class="btn small" href="https://hashscan.io/testnet/tx/${encodeURIComponent(r.txId)}" target="_blank" rel="noopener">View</a></td>
  `;
  // insert at top
  verifiedTbody.insertBefore(tr, verifiedTbody.firstChild);
}

/* ---------- Initial load: only after access is granted (modal hide) ---------- */
// table will be loaded after successful modal auth
// If you want to auto-load for dev, uncomment:
// loadVerifiedDocs();

/* ---------- KEEP YOUR ORIGINAL VERIFY HANDLER BELOW — COPIED EXACTLY ---------- */
/* do not edit this block unless you need to change server contract */
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const txId = document.getElementById("txId").value;

  const resultBox = document.getElementById("result");
  resultBox.textContent = "⏳ Verifying...";
  resultBox.className = "result-box";

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

    if (data.valid) {
      resultBox.textContent = "✅ Document is authentic!";
      resultBox.classList.add("valid");
    } else {
      resultBox.textContent = "❌ Not authentic.\n\n" + (data.message || data.error || "Verification failed");
      resultBox.classList.add("invalid");
    }
  } catch (err) {
    resultBox.textContent = "❌ Not Authentic: " + err.message;
    resultBox.classList.add("invalid");
  }
});
/* ---------- end original handler ---------- */

const burger = document.getElementById("burger");
const recRight = document.querySelector(".rec-right");

burger.addEventListener("click", () => {
  recRight.classList.toggle("active");
});

