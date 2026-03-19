const TABLE_ID = "requestsTable";
const ROW_CLASS = "request-row";
const CHECKBOX_CLASS = "request-checkbox";
// -----------------------------------------------------------------

// -----------------------------------------------------------------
//  FILTER + SEARCH
// -----------------------------------------------------------------
function filterTable() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value.toLowerCase();
  const dateVal = document.getElementById("dateFilter").value;
  const sortVal = document.getElementById("sortFilter").value;

  const table = document.getElementById(TABLE_ID);
  const rows = table.getElementsByClassName(ROW_CLASS);
  let visible = 0;

  Array.from(rows).forEach((row) => {
    const ngo = row.getAttribute("data-ngo").toLowerCase();
    const email = row.getAttribute("data-email").toLowerCase();
    const item = row.getAttribute("data-item").toLowerCase();
    const stat = row.getAttribute("data-status").toLowerCase();
    const date = new Date(row.getAttribute("data-date"));

    let show = true;

    // ---- Search (NGO name, email or item) ----
    if (
      search &&
      !(ngo.includes(search) || email.includes(search) || item.includes(search))
    ) {
      show = false;
    }

    // ---- Status filter ----
    if (status && stat !== status) show = false;

    // ---- Date filter ----
    if (dateVal) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateVal) {
        case "today":
          if (date < today) show = false;
          break;
        case "week":
          const week = new Date(today);
          week.setDate(week.getDate() - 7);
          if (date < week) show = false;
          break;
        case "month":
          const month = new Date(today);
          month.setMonth(month.getMonth() - 1);
          if (date < month) show = false;
          break;
        case "year":
          const year = new Date(today);
          year.setFullYear(year.getFullYear() - 1);
          if (date < year) show = false;
          break;
      }
    }

    row.style.display = show ? "" : "none";
    if (show) visible++;
  });

  // ---- Counter & no-results ----
  document.getElementById("showingCount").textContent = visible;
  const noRes = document.getElementById("noResults");
  if (visible === 0) {
    noRes.style.display = "block";
    table.style.display = "none";
  } else {
    noRes.style.display = "none";
    table.style.display = "table";
  }

  updateActiveFilters();
  if (sortVal) applySorting(sortVal);
}

// -----------------------------------------------------------------
//  RESET FILTERS
// -----------------------------------------------------------------
function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("sortFilter").value = "date-desc";
  filterTable();
}

// -----------------------------------------------------------------
//  ACTIVE FILTER BADGES
// -----------------------------------------------------------------
function updateActiveFilters() {
  const search = document.getElementById("searchInput").value;
  const status = document.getElementById("statusFilter").value;
  const date = document.getElementById("dateFilter").value;

  const div = document.getElementById("activeFilters");
  const badge = document.getElementById("filterBadges");

  const parts = [];
  if (search) parts.push(`Search: ${search}`);
  if (status) parts.push(`Status: ${status}`);
  if (date) parts.push(`Date: ${date}`);

  if (parts.length) {
    badge.innerHTML = parts.join(" • ");
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}

// -----------------------------------------------------------------
//  SORTING
// -----------------------------------------------------------------
function applySorting(sortKey) {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  const rows = Array.from(tbody.getElementsByClassName(ROW_CLASS));

  rows.sort((a, b) => {
    let aVal, bVal;

    switch (sortKey) {
      case "ngo-asc":
        aVal = a.getAttribute("data-ngo").toLowerCase();
        bVal = b.getAttribute("data-ngo").toLowerCase();
        return aVal.localeCompare(bVal);
      case "ngo-desc":
        aVal = a.getAttribute("data-ngo").toLowerCase();
        bVal = b.getAttribute("data-ngo").toLowerCase();
        return bVal.localeCompare(aVal);

      case "email-asc":
        aVal = a.getAttribute("data-email").toLowerCase();
        bVal = b.getAttribute("data-email").toLowerCase();
        return aVal.localeCompare(bVal);
      case "email-desc":
        aVal = a.getAttribute("data-email").toLowerCase();
        bVal = b.getAttribute("data-email").toLowerCase();
        return bVal.localeCompare(aVal);

      case "item-asc":
        aVal = a.getAttribute("data-item").toLowerCase();
        bVal = b.getAttribute("data-item").toLowerCase();
        return aVal.localeCompare(bVal);
      case "item-desc":
        aVal = a.getAttribute("data-item").toLowerCase();
        bVal = b.getAttribute("data-item").toLowerCase();
        return bVal.localeCompare(aVal);

      case "status-asc":
        aVal = a.getAttribute("data-status").toLowerCase();
        bVal = b.getAttribute("data-status").toLowerCase();
        return aVal.localeCompare(bVal);
      case "status-desc":
        aVal = a.getAttribute("data-status").toLowerCase();
        bVal = b.getAttribute("data-status").toLowerCase();
        return bVal.localeCompare(aVal);

      case "date-asc":
        aVal = new Date(a.getAttribute("data-date"));
        bVal = new Date(b.getAttribute("data-date"));
        return aVal - bVal;
      case "date-desc":
        aVal = new Date(a.getAttribute("data-date"));
        bVal = new Date(b.getAttribute("data-date"));
        return bVal - aVal;

      default:
        return 0;
    }
  });

  rows.forEach((r) => tbody.appendChild(r));
}

// -----------------------------------------------------------------
//  SELECT-ALL & BULK BAR
// -----------------------------------------------------------------
function toggleSelectAll() {
  const master = document.getElementById("selectAll");
  document
    .querySelectorAll(`.${CHECKBOX_CLASS}`)
    .forEach((cb) => (cb.checked = master.checked));
  updateBulkActions();
}

function updateBulkActions() {
  const checked = document.querySelectorAll(
    `.${CHECKBOX_CLASS}:checked`
  ).length;
  const bar = document.getElementById("bulkActionsBar");
  const count = document.getElementById("selectedCount");

  count.textContent = checked;
  bar.style.display = checked ? "block" : "none";
}

// -----------------------------------------------------------------
//  BULK ACTIONS
// -----------------------------------------------------------------
function bulkAction(act) {
  const selected = document.querySelectorAll(`.${CHECKBOX_CLASS}:checked`);
  const data = [];

  selected.forEach((cb) => {
    const row = cb.closest("tr");
    data.push({
      id: row.querySelector("form")?.closest("tr").id || row.dataset.id,
      ngo: row.getAttribute("data-ngo"),
      email: row.getAttribute("data-email"),
      item: row.getAttribute("data-item"),
      status: row.getAttribute("data-status"),
    });
  });

  switch (act) {
    case "export":
      console.log("Export selected requests →", data);
      alert(`Export ${selected.length} request(s). Check console.`);
      break;
    case "delete":
      if (confirm(`Delete ${selected.length} request(s)?`)) {
        console.log("Delete selected →", data);
        alert("Connect to backend DELETE endpoint");
      }
      break;
  }
}

// -----------------------------------------------------------------
//  EXPORT VISIBLE ROWS
// -----------------------------------------------------------------
function exportData() {
  const rows = Array.from(document.querySelectorAll(`.${ROW_CLASS}`)).filter(
    (r) => r.style.display !== "none"
  );

  const csv = [
    ["NGO", "Email", "Item", "Qty", "Status", "Date"],
    ...rows.map((r) => [
      r.getAttribute("data-ngo"),
      r.getAttribute("data-email"),
      r.getAttribute("data-item"),
      r.getAttribute("data-qty"),
      r.getAttribute("data-status"),
      r.getAttribute("data-date"),
    ]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ngo_requests_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------
//  VIEW SWITCH (grid / table) – stub, you can implement later
// -----------------------------------------------------------------
function changeView(view) {
  console.log("Switch to", view);
  document
    .querySelectorAll(".btn-group button")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");
  alert(`${view.toUpperCase()} view – implement grid layout if needed`);
}

// -----------------------------------------------------------------
//  COLUMN-HEADER SORT (click on th)
// -----------------------------------------------------------------
function sortTable(col) {
  const map = {
    ngo: "ngo-asc",
    email: "email-asc",
    item: "item-asc",
    status: "status-asc",
    date: "date-desc",
  };
  document.getElementById("sortFilter").value = map[col] || "date-desc";
  filterTable();
}

// -----------------------------------------------------------------
//  INITIALISE
// -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // checkbox listeners
  document
    .querySelectorAll(`.${CHECKBOX_CLASS}`)
    .forEach((cb) => cb.addEventListener("change", updateBulkActions));

  // run once
  filterTable();
});
