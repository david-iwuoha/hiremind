// api.js: modal auth + burger toggle + copy buttons
const COMPANY_LOGOS_API = {
  dora: "dorahacks-logo.png",
  acme: "company-placeholder.png",
  globex: "company-placeholder.png",
  stark: "company-placeholder.png",
  umbrella: "company-placeholder.png"
};

const companySelectApi = document.getElementById("companySelectApi");
const companyLogoApi = document.getElementById("companyLogoApi");
const pinApi = document.getElementById("companyPinApi");
const submitApi = document.getElementById("modalSubmitApi");
const modalErrorApi = document.getElementById("modalErrorApi");
const accessModalApi = document.getElementById("accessModal");
const mainContentApi = document.getElementById("mainContent");
const burgerApi = document.getElementById("burgerApi");
const recRight = document.querySelector(".rec-right");

companySelectApi.addEventListener("change", ()=> companyLogoApi.src = COMPANY_LOGOS_API[companySelectApi.value] || "company-placeholder.png");
companyLogoApi.src = COMPANY_LOGOS_API[companySelectApi.value];

submitApi.addEventListener("click",(e)=>{
  e.preventDefault();
  if(companySelectApi.value === "dora" && (pinApi.value||"").trim() === "090845"){
    accessModalApi.style.display = "none";
    mainContentApi.removeAttribute("aria-hidden");
  } else {
    modalErrorApi.textContent = "Incorrect PIN or access denied";
  }
});

burgerApi?.addEventListener("click", ()=> recRight.classList.toggle("active"));

// Copy buttons
document.querySelectorAll(".copy").forEach(btn=>{
  btn.addEventListener("click", async () => {
    const code = btn.previousElementSibling?.innerText || "";
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied!";
      setTimeout(()=> btn.textContent = "Copy", 1400);
    } catch {
      btn.textContent = "Failed";
      setTimeout(()=> btn.textContent = "Copy", 1400);
    }
  });
});
