// Filter Table Function
function filterTable() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const roleValue = document.getElementById("roleFilter").value.toLowerCase();
  const dateValue = document.getElementById("dateFilter").value;
  const sortValue = document.getElementById("sortFilter").value;

  const table = document.getElementById("farmersTable");
  const rows = table.getElementsByClassName("farmer-row");
  let visibleCount = 0;

  // Filter rows
  Array.from(rows).forEach((row) => {
    const name = row.getAttribute("data-name").toLowerCase();
    const email = row.getAttribute("data-email").toLowerCase();
    const role = row.getAttribute("data-role").toLowerCase();
    const date = new Date(row.getAttribute("data-date"));

    let showRow = true;

    // Search filter
    if (
      searchValue &&
      !(name.includes(searchValue) || email.includes(searchValue))
    ) {
      showRow = false;
    }

    // Role filter
    if (roleValue && role !== roleValue) {
      showRow = false;
    }

    // Date filter
    if (dateValue) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateValue) {
        case "today":
          if (date < today) showRow = false;
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (date < weekAgo) showRow = false;
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (date < monthAgo) showRow = false;
          break;
        case "year":
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          if (date < yearAgo) showRow = false;
          break;
      }
    }

    row.style.display = showRow ? "" : "none";
    if (showRow) visibleCount++;
  });

  // Update counter
  document.getElementById("showingCount").textContent = visibleCount;

  // Show/hide no results message
  const noResults = document.getElementById("noResults");
  if (visibleCount === 0) {
    noResults.style.display = "block";
    table.style.display = "none";
  } else {
    noResults.style.display = "none";
    table.style.display = "table";
  }

  // Update active filters display
  updateActiveFilters();

  // Apply sorting
  if (sortValue) {
    applySorting(sortValue);
  }
}

// Reset Filters
function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("roleFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("sortFilter").value = "date-desc";
  filterTable();
}

// Update Active Filters Display
function updateActiveFilters() {
  const searchValue = document.getElementById("searchInput").value;
  const roleValue = document.getElementById("roleFilter").value;
  const dateValue = document.getElementById("dateFilter").value;

  const activeFiltersDiv = document.getElementById("activeFilters");
  const filterBadges = document.getElementById("filterBadges");

  let badges = [];
  if (searchValue) badges.push(`Search: ${searchValue}`);
  if (roleValue) badges.push(`Role: ${roleValue}`);
  if (dateValue) badges.push(`Date: ${dateValue}`);

  if (badges.length > 0) {
    filterBadges.innerHTML = badges.join(" • ");
    activeFiltersDiv.style.display = "block";
  } else {
    activeFiltersDiv.style.display = "none";
  }
}

// Sorting Function
function applySorting(sortValue) {
  const table = document.getElementById("farmersTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.getElementsByClassName("farmer-row"));

  rows.sort((a, b) => {
    let aVal, bVal;

    switch (sortValue) {
      case "name-asc":
        aVal = a.getAttribute("data-name").toLowerCase();
        bVal = b.getAttribute("data-name").toLowerCase();
        return aVal.localeCompare(bVal);
      case "name-desc":
        aVal = a.getAttribute("data-name").toLowerCase();
        bVal = b.getAttribute("data-name").toLowerCase();
        return bVal.localeCompare(aVal);
      case "email-asc":
        aVal = a.getAttribute("data-email").toLowerCase();
        bVal = b.getAttribute("data-email").toLowerCase();
        return aVal.localeCompare(bVal);
      case "date-asc":
        aVal = new Date(a.getAttribute("data-date"));
        bVal = new Date(b.getAttribute("data-date"));
        return aVal - bVal;
      case "date-desc":
        aVal = new Date(a.getAttribute("data-date"));
        bVal = new Date(b.getAttribute("data-date"));
        return bVal - aVal;
    }
  });

  rows.forEach((row) => tbody.appendChild(row));
}

// Select All Checkbox
function toggleSelectAll() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".farmer-checkbox");
  checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
  updateBulkActions();
}

// Update Bulk Actions Bar
function updateBulkActions() {
  const checkboxes = document.querySelectorAll(".farmer-checkbox:checked");
  const bulkBar = document.getElementById("bulkActionsBar");
  const selectedCount = document.getElementById("selectedCount");

  selectedCount.textContent = checkboxes.length;
  bulkBar.style.display = checkboxes.length > 0 ? "block" : "none";
}

// Initialize event listeners when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Add event listeners to checkboxes
  const checkboxes = document.querySelectorAll(".farmer-checkbox");
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", updateBulkActions);
  });

  // Initialize filters
  filterTable();
});

// Bulk Actions
function bulkAction(action) {
  const selected = document.querySelectorAll(".farmer-checkbox:checked").length;
  const selectedFarmers = [];

  document.querySelectorAll(".farmer-checkbox:checked").forEach((checkbox) => {
    const row = checkbox.closest("tr");
    selectedFarmers.push({
      name: row.getAttribute("data-name"),
      email: row.getAttribute("data-email"),
      role: row.getAttribute("data-role"),
    });
  });

  switch (action) {
    case "export":
      console.log("Exporting farmers:", selectedFarmers);
      alert(`Exporting ${selected} farmer(s). Check console for data.`);
      // TODO: Implement actual export logic
      break;
    case "email":
      console.log("Emailing farmers:", selectedFarmers);
      alert(`Preparing to email ${selected} farmer(s)`);
      // TODO: Implement email functionality
      break;
    case "delete":
      if (confirm(`Are you sure you want to delete ${selected} farmer(s)?`)) {
        console.log("Deleting farmers:", selectedFarmers);
        alert(`Delete functionality - connect to your backend`);
        // TODO: Implement delete API call
      }
      break;
  }
}

// Export Data
function exportData() {
  const table = document.getElementById("farmersTable");
  const rows = Array.from(table.querySelectorAll(".farmer-row")).filter(
    (row) => row.style.display !== "none"
  );

  const data = rows.map((row) => ({
    name: row.getAttribute("data-name"),
    email: row.getAttribute("data-email"),
    role: row.getAttribute("data-role"),
    date: row.getAttribute("data-date"),
  }));

  console.log("Exporting all visible farmers:", data);
  alert(`Exporting ${data.length} farmer(s). Check console for data.`);
  // TODO: Implement CSV/Excel export
}

// Change View (Grid/Table)
function changeView(view) {
  // TODO: Implement grid view
  console.log(`Switching to ${view} view`);

  // Update active button
  document.querySelectorAll(".btn-group button").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.closest("button").classList.add("active");

  alert(`${view.toUpperCase()} view - Implement grid layout as needed`);
}

// Sort Table (Column Header Click)
function sortTable(column) {
  const sortFilter = document.getElementById("sortFilter");
  if (column === "name") sortFilter.value = "name-asc";
  else if (column === "email") sortFilter.value = "email-asc";
  else if (column === "date") sortFilter.value = "date-desc";
  filterTable();
}
