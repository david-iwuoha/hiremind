// shortlist.js (cleaned & defensive)
// Paste entire file to replace old version

document.addEventListener("DOMContentLoaded", () => {
  // Company logos (place images in same folder)
  const COMPANY_LOGOS = {
    dora: "dorahacks-logo.png",
    acme: "company-placeholder.png",
    globex: "company-placeholder.png",
    stark: "company-placeholder.png",
    umbrella: "company-placeholder.png"
  };

  /* ---------- DOM references (grab after DOM ready) ---------- */
  const accessModal = document.getElementById("accessModal");
  const companySelect = document.getElementById("companySelect");
  const companyLogo = document.getElementById("companyLogo");
  const companyPin = document.getElementById("companyPin");
  const modalSubmit = document.getElementById("modalSubmit");
  const modalError = document.getElementById("modalError");
  const mainContent = document.getElementById("mainContent");
  const burger = document.getElementById("burger");
  const recRight = document.querySelector(".rec-right");

  // shortlist UI
  const addForm = document.getElementById("addForm");
  const listWrap = document.getElementById("listWrap");
  const detailsPanel = document.getElementById("candidateDetails");
  const detailsEmpty = document.getElementById("detailsEmpty");
  const dt_name = document.getElementById("dt_name");
  const dt_email = document.getElementById("dt_email");
  const dt_role = document.getElementById("dt_role");
  const notesList = document.getElementById("notesList");
  const noteInput = document.getElementById("noteInput");
  const saveNote = document.getElementById("saveNote");
  const statusSelect = document.getElementById("statusSelect");
  const removeCandidate = document.getElementById("removeCandidate");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");
  const exportCsv = document.getElementById("exportCsv");

  /* ---------- state ---------- */
  let currentCompany = null; // 'dora', etc
  let shortlist = [];       // candidate objects
  let selectedId = null;

  /* ---------- helpers ---------- */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const storageKeyFor = (company) => `hiremind_shortlist_${company || "public"}`;

  // safe escape
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* ---------- modal show/hide + blur ---------- */
  function showModal() {
    if (accessModal) accessModal.style.display = "flex";
    if (mainContent) mainContent.classList.add("blurred");
  }
  function hideModal() {
    if (accessModal) accessModal.style.display = "none";
    if (mainContent) mainContent.classList.remove("blurred");
  }

  /* ---------- init company logo preview ---------- */
  if (companySelect && companyLogo) {
    companyLogo.src = COMPANY_LOGOS[companySelect.value] || "company-placeholder.png";
    companySelect.addEventListener("change", () => {
      companyLogo.src = COMPANY_LOGOS[companySelect.value] || "company-placeholder.png";
      if (modalError) modalError.textContent = "";
    });
  }

  /* ---------- persistence helpers ---------- */
  function loadShortlist() {
    if (!currentCompany) {
      shortlist = [];
      return;
    }
    try {
      const raw = localStorage.getItem(storageKeyFor(currentCompany));
      shortlist = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("loadShortlist error", err);
      shortlist = [];
    }
  }

  function saveShortlist() {
    if (!currentCompany) return;
    try {
      localStorage.setItem(storageKeyFor(currentCompany), JSON.stringify(shortlist));
    } catch (err) {
      console.error("saveShortlist error", err);
    }
  }

  /* ---------- render list ---------- */
  function renderList() {
    if (!listWrap) return;
    listWrap.innerHTML = "";
    const q = (searchInput && searchInput.value || "").toLowerCase();
    const filter = (filterStatus && filterStatus.value) || "";

    const filtered = shortlist.filter(s => {
      if (filter && s.status !== filter) return false;
      if (!q) return true;
      return (s.name || "").toLowerCase().includes(q) ||
             (s.email || "").toLowerCase().includes(q) ||
             (s.role || "").toLowerCase().includes(q);
    });

    if (!filtered.length) {
      listWrap.innerHTML = `<div class="muted">No candidates yet.</div>`;
      return;
    }

    filtered.forEach(c => {
      const row = document.createElement("div");
      row.className = "candidate";
      row.dataset.id = c.id;

      // safe star icon markup (fixed quote and icon names)
      const starHtml = c.starred ? '<i class="bx bxs-star"></i>' : '<i class="bx bx-star"></i>';

      row.innerHTML = `
        <div class="c-left">
          <div class="avatar">${escapeHtml((c.name||"").split(" ").map(n=>n[0]||"").slice(0,2).join("").toUpperCase())}</div>
          <div class="c-meta">
            <div class="c-name">${escapeHtml(c.name)}</div>
            <div class="c-email muted">${escapeHtml(c.email)} · ${escapeHtml(c.role||"—")}</div>
          </div>
        </div>
        <div class="c-actions">
          <button class="icon-btn star" title="Toggle shortlist">${starHtml}</button>
          <button class="icon-btn view" title="View details"><i class="bx bx-chevrons-right"></i></button>
        </div>
      `;
      listWrap.appendChild(row);

      const viewBtn = row.querySelector(".view");
      const starBtn = row.querySelector(".star");

      if (viewBtn) viewBtn.addEventListener("click", () => openDetails(c.id));
      if (starBtn) starBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        c.starred = !c.starred;
        saveShortlist();
        renderList();
      });
    });
  }

  /* ---------- details & notes ---------- */
  function openDetails(id) {
    selectedId = id;
    const c = shortlist.find(x => x.id === id);
    if (!c) return;
    if (detailsPanel) detailsPanel.hidden = false;
    if (detailsEmpty) detailsEmpty.style.display = "none";

    if (dt_name) dt_name.textContent = c.name || "—";
    if (dt_email) dt_email.textContent = c.email || "—";
    if (dt_role) dt_role.textContent = c.role || "—";
    if (statusSelect) statusSelect.value = c.status || "shortlisted";

    renderNotes(c);
  }

  function renderNotes(c) {
    if (!notesList) return;
    notesList.innerHTML = "";
    if (!c.notes || !c.notes.length) {
      notesList.innerHTML = `<div class="muted">No notes yet.</div>`;
      return;
    }
    c.notes.forEach((n, i) => {
      const d = document.createElement("div");
      d.className = "note-row";
      d.innerHTML = `<div class="note-text">${escapeHtml(n.text)}</div>
                     <div class="note-meta muted">${new Date(n.created).toLocaleString()} <button class="btn small rm" data-i="${i}">Delete</button></div>`;
      notesList.appendChild(d);

      const rm = d.querySelector(".rm");
      if (rm) rm.addEventListener("click", () => {
        c.notes.splice(i, 1);
        saveShortlist();
        renderNotes(c);
        renderList();
      });
    });
  }

  /* ---------- add candidate ---------- */
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("c_name");
      const emailEl = document.getElementById("c_email");
      const roleEl = document.getElementById("c_role");
      const name = (nameEl && nameEl.value || "").trim();
      const email = (emailEl && emailEl.value || "").trim();
      const role = (roleEl && roleEl.value || "").trim();
      if (!name || !email) return alert("Name and email required");
      const rec = { id: uid(), name, email, role, notes: [], status: "shortlisted", starred: false, createdAt: new Date().toISOString() };
      shortlist.unshift(rec);
      saveShortlist();
      renderList();
      addForm.reset();
    });
  }

  /* ---------- save note ---------- */
  if (saveNote) {
    saveNote.addEventListener("click", () => {
      const text = (noteInput && noteInput.value || "").trim();
      if (!text) return;
      const c = shortlist.find(x => x.id === selectedId);
      if (!c) return alert("Select a candidate first");
      c.notes = c.notes || [];
      c.notes.push({ text, created: new Date().toISOString() });
      noteInput.value = "";
      saveShortlist();
      renderNotes(c);
      renderList();
    });
  }

  /* ---------- status change & remove ---------- */
  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      const c = shortlist.find(x => x.id === selectedId);
      if (!c) return;
      c.status = statusSelect.value;
      saveShortlist();
      renderList();
    });
  }
  if (removeCandidate) {
    removeCandidate.addEventListener("click", () => {
      if (!confirm("Remove candidate?")) return;
      shortlist = shortlist.filter(x => x.id !== selectedId);
      saveShortlist();
      renderList();
      if (detailsPanel) detailsPanel.hidden = true;
      if (detailsEmpty) detailsEmpty.style.display = "block";
    });
  }

  /* ---------- search/filter/export ---------- */
  if (searchInput) searchInput.addEventListener("input", renderList);
  if (filterStatus) filterStatus.addEventListener("change", renderList);

  if (exportCsv) exportCsv.addEventListener("click", () => {
    if (!shortlist || !shortlist.length) return alert("No data to export");
    const rows = [["Name", "Email", "Role", "Status", "Created At"]];
    shortlist.forEach(s => rows.push([s.name, s.email, s.role || "", s.status, s.createdAt]));
    const csv = rows.map(r => r.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentCompany || "shortlist"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ---------- burger toggle ---------- */
  if (burger && recRight) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      recRight.classList.toggle("active");
    });
    // click outside to close menu
    document.addEventListener("click", (e) => {
      if (recRight && !recRight.contains(e.target) && recRight.classList.contains("active")) recRight.classList.remove("active");
    });
  }

  /* ---------- modal PIN logic ---------- */
  const persistedAccess = localStorage.getItem("hiremind_recruiter_access");
  if (persistedAccess) {
    currentCompany = persistedAccess;
    hideModal();
    loadShortlist();
    renderList();
  } else {
    showModal();
  }

  if (modalSubmit) {
    modalSubmit.addEventListener("click", (e) => {
      e.preventDefault();
      const company = (companySelect && companySelect.value) || null;
      const pin = (companyPin && (companyPin.value || "").trim()) || "";
      const correctPin = "090845";

      if (company === "dora" && pin === correctPin) {
        currentCompany = company;
        localStorage.setItem("hiremind_recruiter_access", company);
        hideModal();
        if (modalError) modalError.textContent = "";
        if (companyPin) companyPin.value = "";
        loadShortlist();
        renderList();
      } else {
        if (modalError) modalError.textContent = "Incorrect PIN or access denied for selected company.";
        const box = document.querySelector(".modal-box");
        if (box) {
          box.classList.remove("shake");
          // force reflow to restart animation if present
          void box.offsetWidth;
          box.classList.add("shake");
        }
      }
    });
  }

  /* ---------- on unload: persist current shortlist (defensive) ---------- */
  window.addEventListener("beforeunload", () => {
    try { saveShortlist(); } catch (e) { /* silent */ }
  });

  // expose for debug (optional)
  window.__hiremind_shortlist = { loadShortlist, saveShortlist, renderList, shortlist };
});
