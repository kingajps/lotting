// Inventory Tab JS

// === Mock Data (Replace with API/backend calls as needed) ===
const mockItems = [
  { id: 1, name: "Vintage Camera", barcode: "A123", brand: "Kodak", category: "Electronics", case: "Case 1", status: "Ready", value: 120 },
  { id: 2, name: "Antique Vase", barcode: "B456", brand: "Ming", category: "Art", case: "Case 2", status: "Processing", value: 340 },
  { id: 3, name: "Gold Watch", barcode: "C789", brand: "Omega", category: "Jewellery", case: "Case 3", status: "Awaiting", value: 850 },
  { id: 4, name: "Silver Spoon", barcode: "D234", brand: "Georg Jensen", category: "Silverware", case: "Case 2", status: "Sold", value: 50 },
  { id: 5, name: "Model Train", barcode: "E567", brand: "Hornby", category: "Collectibles", case: "Case 1", status: "Ready", value: 65 }
];

// === Populate Filters ===
function populateFilters() {
  // Category
  const categories = [...new Set(mockItems.map(item => item.category))];
  const categorySelect = document.getElementById("filter-category");
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Status
  const statuses = [...new Set(mockItems.map(item => item.status))];
  const statusSelect = document.getElementById("filter-status");
  statuses.forEach(stat => {
    const option = document.createElement("option");
    option.value = stat;
    option.textContent = stat;
    statusSelect.appendChild(option);
  });

  // Case
  const cases = [...new Set(mockItems.map(item => item.case))];
  const caseSelect = document.getElementById("filter-case");
  cases.forEach(cse => {
    const option = document.createElement("option");
    option.value = cse;
    option.textContent = cse;
    caseSelect.appendChild(option);
  });
}

// === Render Items ===
function renderItems(items) {
  const grid = document.getElementById("inventory-card-grid");
  grid.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "inventory-card";
    card.innerHTML = `
      <div class="inventory-card-title">${item.name}</div>
      <div class="inventory-card-desc">Barcode: ${item.barcode} &middot; Brand: ${item.brand}</div>
      <div class="inventory-card-desc">Category: ${item.category} &middot; Case: ${item.case}</div>
      <div class="inventory-card-desc">Status: <span style="color:#2563eb;font-weight:500;">${item.status}</span> &middot; Value: £${item.value}</div>
      <div class="card-actions">
        <button class="card-actions-btn" title="View">View</button>
        <button class="card-actions-btn" title="Edit">Edit</button>
        <button class="card-actions-btn" title="Delete">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
  updateCount(items.length, mockItems.length);
}

// === Update Results Count ===
function updateCount(filtered, total) {
  document.getElementById("inventory-results-count").textContent = `Showing ${filtered} of ${total} items`;
}

// === Filter/Search Logic ===
function applyFilters() {
  let filtered = [...mockItems];

  // Search
  const search = document.getElementById("inventory-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.barcode.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search)
    );
  }

  // Category
  const category = document.getElementById("filter-category").value;
  if (category) filtered = filtered.filter(item => item.category === category);

  // Status
  const status = document.getElementById("filter-status").value;
  if (status) filtered = filtered.filter(item => item.status === status);

  // Case
  const caseVal = document.getElementById("filter-case").value;
  if (caseVal) filtered = filtered.filter(item => item.case === caseVal);

  // Sort
  const sort = document.getElementById("inventory-sort").value;
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "value") filtered.sort((a, b) => b.value - a.value);
  if (sort === "status") filtered.sort((a, b) => a.status.localeCompare(b.status));

  renderItems(filtered);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("inventory-search").addEventListener("input", applyFilters);
  document.getElementById("filter-category").addEventListener("change", applyFilters);
  document.getElementById("filter-status").addEventListener("change", applyFilters);
  document.getElementById("filter-case").addEventListener("change", applyFilters);
  document.getElementById("inventory-sort").addEventListener("change", applyFilters);

  // Add New Item (demo only)
  document.getElementById("inventory-add-btn").onclick = function () {
    alert("Add New Item functionality coming soon!");
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  populateFilters();
  renderItems(mockItems);
  setupListeners();
});
