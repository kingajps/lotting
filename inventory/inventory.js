// Inventory Tab JS

// === Mock Data for Items ===
const mockInventory = [
  {
    name: "Dell Laptop",
    desc: "Dell Inspiron 15 3000",
    barcode: "987654321098",
    status: "Photographed",
    condition: "Like New",
    value: "£320",
    category: "Electronics",
    location: "U32-ELEC-A1",
    case: "CASE-2024-002"
  },
  {
    name: "iPad Air",
    desc: "Apple iPad Air (4th generation)",
    barcode: "456789123456",
    status: "Listed",
    condition: "Good",
    value: "£160",
    category: "Electronics",
    location: "U32-ELEC-A1",
    case: "CASE-2024-002"
  },
  {
    name: "Oak Dining Chairs (Set of 6)",
    desc: "Heritage Furniture Classic Oak",
    barcode: "123456789012",
    status: "Catalogued",
    condition: "Good",
    value: "£230",
    category: "Furniture",
    location: "U32-FURN-B1",
    case: "CASE-2024-001"
  },
  {
    name: "Oak Dining Table",
    desc: "Heritage Furniture Classic Oak",
    barcode: "123456789012",
    status: "Catalogued",
    condition: "Good",
    value: "£420",
    category: "Furniture",
    location: "U32-FURN-B1",
    case: "CASE-2024-001"
  }
];

// === Populate Filters ===
function populateFilters() {
  // Categories
  const catSet = Array.from(new Set(mockInventory.map(i => i.category)));
  const catSelect = document.getElementById("inventory-category-filter");
  catSet.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });
  // Statuses
  const statusSet = Array.from(new Set(mockInventory.map(i => i.status)));
  const statSelect = document.getElementById("inventory-status-filter");
  statusSet.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statSelect.appendChild(opt);
  });
  // Cases
  const caseSet = Array.from(new Set(mockInventory.map(i => i.case)));
  const caseSelect = document.getElementById("inventory-case-filter");
  caseSet.forEach(cs => {
    const opt = document.createElement("option");
    opt.value = cs;
    opt.textContent = cs;
    caseSelect.appendChild(opt);
  });
}

// === Render Items Grid ===
function renderItems(items) {
  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";
  if (items.length === 0) {
    document.getElementById("inventory-empty").style.display = "";
    document.getElementById("inventory-results-count").textContent = `Showing 0 of ${mockInventory.length} items`;
    return;
  }
  document.getElementById("inventory-empty").style.display = "none";
  document.getElementById("inventory-results-count").textContent = `Showing ${items.length} of ${mockInventory.length} items`;
  items.forEach(i => {
    const card = document.createElement("div");
    card.className = "inventory-card";
    card.innerHTML = `
      <div class="inventory-card-header">
        <span class="inventory-card-icon">🗃️</span>
      </div>
      <div class="inventory-card-main">
        <div class="inventory-card-title">${i.name}</div>
        <div class="inventory-card-desc">${i.desc}</div>
        <div class="inventory-card-barcode">${i.barcode}</div>
        <div class="inventory-card-row">
          <span class="inventory-card-status ${i.status.toLowerCase()}">${i.status}</span>
          <span class="inventory-card-condition">${i.condition}</span>
        </div>
        <div class="inventory-card-row">
          <span class="inventory-card-value">${i.value}</span>
          <span class="inventory-card-category">${i.category}</span>
        </div>
        <div class="inventory-card-row">
          <span class="inventory-card-location">📍 ${i.location}</span>
          <span class="inventory-card-case">#${i.case}</span>
        </div>
      </div>
      <div class="inventory-card-actions">
        <button class="inventory-card-view-btn" title="View">View</button>
        <button class="inventory-card-actions-btn" title="Edit">&#9998;</button>
        <button class="inventory-card-actions-btn" title="Delete">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// === Filter/Search/Sort Logic ===
function applyFilters() {
  let filtered = [...mockInventory];
  const search = document.getElementById("inventory-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(search) ||
      i.desc.toLowerCase().includes(search) ||
      i.barcode.toLowerCase().includes(search)
    );
  }
  const cat = document.getElementById("inventory-category-filter").value;
  if (cat) filtered = filtered.filter(i => i.category === cat);
  const stat = document.getElementById("inventory-status-filter").value;
  if (stat) filtered = filtered.filter(i => i.status === stat);
  const cs = document.getElementById("inventory-case-filter").value;
  if (cs) filtered = filtered.filter(i => i.case === cs);
  const sort = document.getElementById("inventory-sort-filter").value;
  if (sort === "name-az") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-za") filtered.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "value-high") filtered.sort((a, b) => Number(b.value.replace(/[^0-9.-]+/g,"")) - Number(a.value.replace(/[^0-9.-]+/g,"")));
  if (sort === "value-low") filtered.sort((a, b) => Number(a.value.replace(/[^0-9.-]+/g,"")) - Number(b.value.replace(/[^0-9.-]+/g,"")));
  renderItems(filtered);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("inventory-search").addEventListener("input", applyFilters);
  document.getElementById("inventory-category-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-status-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-case-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-sort-filter").addEventListener("change", applyFilters);
}

// === Modal logic for + Add New Item ===
document.addEventListener("DOMContentLoaded", function () {
  populateFilters();
  renderItems(mockInventory);
  setupListeners();

  // Modal open
  document.getElementById("inventory-new-btn").onclick = function () {
    // Populate selects in modal
    const cats = Array.from(new Set(mockInventory.map(i => i.category)));
    const cases = Array.from(new Set(mockInventory.map(i => i.case)));
    const locs = Array.from(new Set(mockInventory.map(i => i.location)));
    const catSel = document.getElementById("item-category");
    const caseSel = document.getElementById("item-case");
    const locSel = document.getElementById("item-location");
    catSel.innerHTML = `<option value="">Select Category</option>`;
    cats.forEach(c => { catSel.innerHTML += `<option value="${c}">${c}</option>`; });
    caseSel.innerHTML = `<option value="">Select Case</option>`;
    cases.forEach(cs => { caseSel.innerHTML += `<option value="${cs}">${cs}</option>`; });
    locSel.innerHTML = `<option value="">Select Location</option>`;
    locs.forEach(lc => { locSel.innerHTML += `<option value="${lc}">${lc}</option>`; });
    document.getElementById("inventory-modal-backdrop").style.display = "flex";
    document.body.style.overflow = "hidden";
  };
  document.getElementById("inventory-modal-close-btn").onclick =
  document.getElementById("inventory-modal-cancel-btn").onclick = function () {
    document.getElementById("inventory-modal-backdrop").style.display = "none";
    document.body.style.overflow = "";
  };
  document.getElementById("inventory-modal-form").onsubmit = function(e) {
    e.preventDefault();
    alert("Item added (demo)!");
    document.getElementById("inventory-modal-backdrop").style.display = "none";
    document.body.style.overflow = "";
  };
});
