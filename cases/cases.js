// Cases Tab JS

// === Mock Data (Replace with API/backend calls as needed) ===
const mockCases = [
  { id: 1, number: "CASE001", client: "Alice Smith", status: "Active", items: 5, created: "2025-09-12" },
  { id: 2, number: "CASE002", client: "Bob Jones", status: "Processing", items: 3, created: "2025-09-14" },
  { id: 3, number: "CASE003", client: "Carla Lee", status: "Ready", items: 7, created: "2025-09-17" },
  { id: 4, number: "CASE004", client: "David Kim", status: "Completed", items: 10, created: "2025-09-06" },
  { id: 5, number: "CASE005", client: "Ella Brown", status: "Cancelled", items: 2, created: "2025-09-02" }
];

// === Filter & Search Logic ===
function applyFilters() {
  let filtered = [...mockCases];

  // Search
  const search = document.querySelector('.cases-search-input').value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c =>
      c.number.toLowerCase().includes(search) ||
      c.client.toLowerCase().includes(search) ||
      String(c.items).includes(search)
    );
  }

  // Status Filter
  const status = document.querySelector('.cases-filter-select').value;
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }

  renderCases(filtered);
}

// === Render Cases ===
function renderCases(cases) {
  const grid = document.querySelector('.cases-grid');
  const info = document.querySelector('.cases-results-count');
  const empty = document.querySelector('.cases-empty');
  grid.innerHTML = "";

  if (cases.length === 0) {
    grid.style.display = "none";
    empty.textContent = "No cases found for your filters.";
    empty.style.display = "";
    info.textContent = `Showing 0 of ${mockCases.length} cases`;
    return;
  }

  grid.style.display = "";
  empty.style.display = "none";
  info.textContent = `Showing ${cases.length} of ${mockCases.length} cases`;

  cases.forEach(c => {
    const card = document.createElement("div");
    card.className = "cases-card";
    card.innerHTML = `
      <div class="cases-card-title">${c.number} - ${c.client}</div>
      <div class="cases-card-desc">Items: ${c.items} &middot; Created: ${c.created}</div>
      <div class="cases-card-status">${c.status}</div>
      <div style="margin-top:10px;">
        <button class="primary-btn" title="View Case">View</button>
        <button class="primary-btn" style="background:#e3f0fb;color:#2563eb;" title="Edit Case">Edit</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// === Add Case (Demo) ===
function setupAddCase() {
  document.getElementById('add-case-btn').onclick = function () {
    alert("New Case creation form coming soon!");
  };
}

// === Event Listeners ===
function setupListeners() {
  document.querySelector('.cases-search-input').addEventListener('input', applyFilters);
  document.querySelector('.cases-filter-select').addEventListener('change', applyFilters);
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  renderCases(mockCases);
  setupAddCase();
  setupListeners();
});
