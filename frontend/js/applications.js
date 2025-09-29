// Burger menu toggle
const burger = document.querySelector(".burger");
const backBtn = document.querySelector(".btn-back");

burger.addEventListener("click", () => {
  if (backBtn.style.display === "block") {
    backBtn.style.display = "none";
  } else {
    backBtn.style.display = "block";
    backBtn.style.marginTop = "10px";
    backBtn.style.background = "#fff";
    backBtn.style.color = "#0077ff";
    backBtn.style.padding = "10px 20px";
    backBtn.style.borderRadius = "6px";
  }
});

// Filter functionality
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.getElementById("appsBody");

function filterTable() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  Array.from(tableBody.rows).forEach(row => {
    const title = row.cells[0].textContent.toLowerCase();
    const company = row.cells[1].textContent.toLowerCase();
    const badge = row.cells[3].querySelector(".badge").classList[1]; // e.g. 'pending'

    const matchesSearch = title.includes(search) || company.includes(search);
    const matchesStatus = status === "all" || badge === status;

    if (matchesSearch && matchesStatus) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

searchInput.addEventListener("input", filterTable);
statusFilter.addEventListener("change", filterTable);
