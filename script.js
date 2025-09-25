// ------------------ Simulated Data ------------------

const recentItems = [
  {
    id: "AA001",
    name: "Antique Vase",
    barcode: "123456789001",
    status: "new",
    time: "Just now"
  },
  {
    id: "BB002",
    name: "Electric Guitar",
    barcode: "123456789002",
    status: "pending",
    time: "8 minutes ago"
  },
  {
    id: "CC003",
    name: "Collectible Toy Car",
    barcode: "123456789003",
    status: "new",
    time: "25 minutes ago"
  }
];

const inventory = [
  {
    id: "AA001",
    name: "Antique Vase",
    quantity: 1,
    zone: "Unit 32",
    status: "new",
    category: "Antiques",
    location: "Mezzanine 1, Bay 2, Level 3",
    last_updated: "2025-09-24"
  },
  {
    id: "BB002",
    name: "Electric Guitar",
    quantity: 3,
    zone: "Unit 30",
    status: "pending",
    category: "Instruments",
    location: "Rack 2, Bay 4, Level 2",
    last_updated: "2025-09-23"
  },
  {
    id: "CC003",
    name: "Collectible Toy Car",
    quantity: 12,
    zone: "Unit 32",
    status: "new",
    category: "Toys",
    location: "Floor Storage Area 1",
    last_updated: "2025-09-24"
  }
  // Add more items as needed
];

// ---------- UPDATED ZONES DATA STRUCTURE ----------
const zones = [
  {
    name: "Unit 32",
    details: [
      "3 Mezzanines (5 bays each, 4 levels per bay)",
      "3 Racks (6 bays each, 3 levels per bay)",
      "6 Floor Storage Areas"
    ],
    capacity: 80,
    full: false
  },
  {
    name: "Unit 30",
    details: [
      "3 Racks (6 bays each, 3 levels per bay)",
      "6 Floor Storage Areas"
    ],
    capacity: 65,
    full: false
  },
  {
    name: "On Site",
    details: [
      "Unlimited and unspecified storage"
    ],
    capacity: 100,
    full: false
  },
  {
    name: "In Transit",
    details: [
      "Van"
    ],
    capacity: 30,
    full: false
  }
];

// ------------------ Utilities ------------------
function statusText(status) {
  switch (status) {
    case "new": return "New";
    case "pending": return "Pending";
    case "alert": return "Alert";
    default: return "Unknown";
  }
}

// ------------------ Recent Items ------------------
function renderRecentItems() {
  const grid = document.getElementById("recent-items");
  grid.innerHTML = "";
  recentItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-meta">
          <span>Barcode: ${item.barcode}</span>
          <span class="status-badge ${item.status}">${statusText(item.status)}</span>
        </div>
        <div class="item-time">${item.time}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ------------------ Barcode Scanning ------------------
function renderBarcodeResult(item) {
  const result = document.getElementById("barcode-result");
  if (!item) {
    result.className = "barcode-result";
    result.innerHTML = "<span style='color:#e53935;font-weight:600'>No item found for this barcode.</span>";
    return;
  }
  result.className = "barcode-result active";
  result.innerHTML = `
    <div style="font-weight:600;font-size:1.1em;margin-bottom:4px">${item.name}</div>
    <div style="color:#888;margin-bottom:4px">Location: ${item.zone || item.location || "N/A"}</div>
    <span class="status-badge ${item.status}">${statusText(item.status)}</span>
  `;
}

function setupBarcodeScan() {
  const btn = document.getElementById("barcode-scan-btn");
  const input = document.getElementById("barcode-input");
  btn.onclick = () => {
    const code = input.value.trim();
    const found = inventory.find(i => i.id === code || i.barcode === code);
    renderBarcodeResult(found);
  };
  input.onkeypress = (e) => {
    if (e.key === "Enter") btn.click();
  };
}

// ---- Inventory Data ----
const inventoryItems = [
  {
    id: "123456789012",
    name: "Oak Dining Table",
    brand: "Heritage Furniture Classic Oak",
    status: "Catalogued",
    condition: "Good",
    value: 420,
    category: "Furniture",
    location: "U32-FURN-B1",
    case: "CASE-2024-001",
    date: "2024-08-01"
  },
  {
    id: "234567890123",
    name: "Electric Guitar",
    brand: "Fender",
    status: "Received",
    condition: "Excellent",
    value: 1100,
    category: "Electronics",
    location: "U32-ELEC-A2",
    case: "CASE-2024-002",
    date: "2024-08-04"
  },
  {
    id: "345678901234",
    name: "Antique Vase",
    brand: "Ming Dynasty",
    status: "Listed",
    condition: "Fair",
    value: 2500,
    category: "Collectibles",
    location: "U32-COL-B3",
    case: "CASE-2024-001",
    date: "2024-08-07"
  }
];

// ---- Inventory Grid Rendering ----
function renderInventoryGrid(items) {
  const grid = document.querySelector(".inventory-grid");
  grid.innerHTML = items.length ? items.map(item => `
    <div class="inventory-card">
      <div class="inventory-image">
        <svg class="inventory-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div class="inventory-details">
        <div class="inventory-header">
          <h3>${item.name}</h3>
          <div class="inventory-brand">${item.brand}</div>
          <div class="inventory-id">${item.id}</div>
        </div>
        <div class="inventory-status-row">
          <span class="inventory-status status-${item.status.toLowerCase().replace(/ /g,'-')}">${item.status}</span>
          <span class="inventory-condition">${item.condition}</span>
        </div>
        <div class="inventory-value-category">
          <div>Value: <span>£${item.value}</span></div>
          <div>Category: <span>${item.category}</span></div>
        </div>
        <div class="inventory-location-case">
          <div><span class="inventory-location">${item.location}</span></div>
          <div><span class="inventory-case">${item.case}</span></div>
        </div>
        <div class="inventory-actions">
          <button class="inventory-btn view-btn">View</button>
          <button class="inventory-btn edit-btn">Edit</button>
          <button class="inventory-btn delete-btn">Delete</button>
        </div>
      </div>
    </div>
  `).join("") : `
    <div class="inventory-empty">
      <svg class="inventory-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3>No items found</h3>
      <p>Try adjusting your search filters or add new items to inventory.</p>
    </div>
  `;
}

// ---- Filter, Search, and Sorting Logic ----
function filterSortInventory() {
  const search = document.querySelector(".inventory-search").value.trim().toLowerCase();
  const category = document.querySelector(".inventory-category").value;
  const status = document.querySelector(".inventory-status").value;
  const caseId = document.querySelector(".inventory-case").value;
  const sort = document.querySelector(".inventory-sort").value;

  let filtered = inventoryItems.filter(i => {
    let matchesSearch = i.name.toLowerCase().includes(search) ||
      i.brand.toLowerCase().includes(search) ||
      i.id.toLowerCase().includes(search);
    let matchesCategory = !category || i.category === category;
    let matchesStatus = !status || i.status === status;
    let matchesCase = !caseId || i.case === caseId;
    return matchesSearch && matchesCategory && matchesStatus && matchesCase;
  });

  filtered.sort((a, b) => {
    switch (sort) {
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "category-asc": return a.category.localeCompare(b.category);
      case "category-desc": return b.category.localeCompare(a.category);
      case "value-asc": return a.value - b.value;
      case "value-desc": return b.value - a.value;
      case "date-asc": return new Date(a.date) - new Date(b.date);
      case "date-desc": return new Date(b.date) - new Date(a.date);
      case "status-asc": return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  document.querySelector(".inventory-count").textContent =
    `Showing ${filtered.length} of ${inventoryItems.length} items`;

  renderInventoryGrid(filtered);
}

function setupInventoryTab() {
  [
    ".inventory-search",
    ".inventory-category",
    ".inventory-status",
    ".inventory-case",
    ".inventory-sort"
  ].forEach(sel =>
    document.querySelector(sel).addEventListener("input", filterSortInventory)
  );
  filterSortInventory();
}

// ------------------ Storage Management ------------------
function renderZoneCards() {
  const grid = document.getElementById("zone-cards");
  grid.innerHTML = "";
  zones.forEach(zone => {
    const card = document.createElement("div");
    card.className = "zone-card";
    card.innerHTML = `
      <div class="zone-name">${zone.name}</div>
      <ul class="zone-details">
        ${zone.details.map(detail => `<li>${detail}</li>`).join("")}
      </ul>
      <div class="capacity-bar">
        <div class="capacity-bar-fill" style="width:${Math.min(zone.capacity,100)}%;background:${zone.capacity>100?'#e53935':'#1a73e8'}"></div>
      </div>
      ${zone.full ? '<span class="zone-alert">Overfilled</span>' : ''}
    `;
    card.onclick = () => showZoneInventory(zone.name);
    grid.appendChild(card);
  });
}

function showZoneInventory(zoneName) {
  let overlay = document.getElementById("zone-inventory-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "zone-inventory-overlay";
    overlay.className = "zone-inventory-overlay";
    document.body.appendChild(overlay);
  }
  const items = inventory.filter(item => item.zone === zoneName);
  overlay.innerHTML = `
    <div class="zone-inventory-modal">
      <h3>Items in ${zoneName}</h3>
      <button class="close-zone-inventory" onclick="document.getElementById('zone-inventory-overlay').remove()">Close</button>
      <ul>
        ${items.length === 0 ? "<li>No items in this zone.</li>" : items.map(item => `
          <li>
            <strong>${item.name}</strong> <br/>
            Location: ${item.location ? item.location : "N/A"}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

// ------------------ Analytics ------------------
const kpis = [
  { title: "Total Items", value: 16 },
  { title: "Turnover Rate", value: "2.1x/mo" },
  { title: "Scan Frequency", value: "52/wk" }
];

function renderKPIs() {
  const kpiBox = document.getElementById("kpi-cards");
  kpiBox.innerHTML = "";
  kpis.forEach(kpi => {
    const card = document.createElement("div");
    card.className = "kpi-card";
    card.innerHTML = `
      <div class="kpi-title">${kpi.title}</div>
      <div class="kpi-value">${kpi.value}</div>
    `;
    kpiBox.appendChild(card);
  });
}

// Mock chart rendering with SVG
function makeChartCard(title, svg) {
  const div = document.createElement("div");
  div.className = "chart-card";
  div.innerHTML = `<div class="chart-title">${title}</div>${svg}`;
  return div;
}

function renderCharts() {
  const charts = document.getElementById("charts-section");
  charts.innerHTML = "";

  charts.appendChild(makeChartCard("Items per Category", `
    <svg width="220" height="120">
      <rect x="20" y="40" width="30" height="60" fill="#1a73e8"/>
      <rect x="70" y="70" width="30" height="30" fill="#43a047"/>
      <rect x="120" y="20" width="30" height="80" fill="#fbc02d"/>
      <text x="20" y="115" font-size="12">Antiques</text>
      <text x="70" y="115" font-size="12">Instruments</text>
      <text x="120" y="115" font-size="12">Toys</text>
    </svg>
  `));

  charts.appendChild(makeChartCard("Scans Over Time", `
    <svg width="220" height="120">
      <polyline points="10,100 40,80 70,95 100,60 130,20 160,40 190,30"
        fill="none" stroke="#1a73e8" stroke-width="3"/>
      <circle cx="10" cy="100" r="3" fill="#1a73e8"/>
      <circle cx="40" cy="80" r="3" fill="#1a73e8"/>
      <circle cx="70" cy="95" r="3" fill="#1a73e8"/>
      <circle cx="100" cy="60" r="3" fill="#1a73e8"/>
      <circle cx="130" cy="20" r="3" fill="#1a73e8"/>
      <circle cx="160" cy="40" r="3" fill="#1a73e8"/>
      <circle cx="190" cy="30" r="3" fill="#1a73e8"/>
    </svg>
  `));

  charts.appendChild(makeChartCard("Status Distribution", `
    <svg width="120" height="120" viewBox="0 0 32 32">
      <circle r="16" cx="16" cy="16" fill="#f5f7fa"/>
      <path d="M16 16 L16 0 A16 16 0 0 1 31.2 12.7 Z" fill="#1a73e8"/>
      <path d="M16 16 L31.2 12.7 A16 16 0 0 1 16 32 Z" fill="#43a047"/>
      <path d="M16 16 L16 32 A16 16 0 0 1 16 0 Z" fill="#fbc02d"/>
    </svg>
  `));
}

// ------------------ Tab Navigation ------------------
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-section");
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
    };
  });
}

// ------------------ Cases Tab ------------------
const cases = [
  {
    id: "CASE-2024-001",
    title: "Estate Sale - Johnson Family",
    client: "Johnson Family Estate",
    received: "15/01/2024",
    items: 25,
    value: "£12,500",
    status: "Processing",
    description: "Complete household contents including furniture, electronics, and collectibles from a 50-year family home in Surrey",
    progress: 50
  },
  {
    id: "CASE-2024-002",
    title: "Artwork Consignment - Smith",
    client: "James Smith",
    received: "22/02/2024",
    items: 8,
    value: "£8,000",
    status: "Ready",
    description: "Modern art collection consignment for upcoming auction.",
    progress: 90
  },
  {
    id: "CASE-2024-003",
    title: "Jewelry Collection - Lee",
    client: "Lee Family",
    received: "28/03/2024",
    items: 12,
    value: "£22,500",
    status: "Completed",
    description: "Estate jewelry consignment completed and returned.",
    progress: 100
  }
  // Add more cases as needed
];

function renderCasesTab() {
  const casesGrid = document.querySelector("#tab-cases .cases-grid");
  const countLabel = document.querySelector(".cases-results-count");
  const searchInput = document.querySelector(".cases-search-input");
  const statusSelect = document.querySelector(".cases-filter-select");

  let search = searchInput.value.toLowerCase();
  let status = statusSelect.value;

  let filtered = cases.filter(c => {
    let matchesStatus = !status || c.status === status;
    let matchesSearch = !search ||
      c.title.toLowerCase().includes(search) ||
      c.client.toLowerCase().includes(search) ||
      c.id.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  casesGrid.innerHTML = filtered.length
    ? filtered.map(c => `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-header-top">
            <h3 class="case-title">${c.title}</h3>
            <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
          </div>
          <span class="case-number">${c.id}</span>
        </div>
        <div class="case-card-body">
          <div>
            <div><strong>Client:</strong> ${c.client}</div>
            <div><strong>Received:</strong> ${c.received}</div>
            <div><strong>Items:</strong> ${c.items}</div>
            <div><strong>Est. Value:</strong> ${c.value}</div>
          </div>
          <div style="margin:12px 0;">
            <p>${c.description}</p>
          </div>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:0.97em;">
              <span>Progress</span>
              <span>${c.progress}%</span>
            </div>
            <div style="background:#e5e7eb;border-radius:999px;height:8px;width:100%;margin-top:4px;">
              <div style="background:#2563eb;border-radius:999px;height:8px;width:${c.progress}%;"></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button style="flex:1;background:#2563eb;color:#fff;padding:8px 0;border-radius:8px;font-size:0.97em;border:none;cursor:pointer;">View</button>
            <button style="flex:1;background:#f3f4f6;color:#222;padding:8px 0;border-radius:8px;font-size:0.97em;border:none;cursor:pointer;">Edit</button>
            <button style="flex:1;background:#fee2e2;color:#dc2626;padding:8px 0;border-radius:8px;font-size:0.97em;border:none;cursor:pointer;">Delete</button>
          </div>
        </div>
      </div>
    `).join("")
    : `<div class="cases-empty"><h3>No cases found</h3><p>Try adjusting your search filters or create a new case.</p></div>`;

  countLabel.textContent = `Showing ${filtered.length} of ${cases.length} cases`;
}

function setupCasesTab() {
  const searchInput = document.querySelector(".cases-search-input");
  const statusSelect = document.querySelector(".cases-filter-select");

  searchInput.addEventListener("input", renderCasesTab);
  statusSelect.addEventListener("change", renderCasesTab);

  renderCasesTab();
}

// ------------------ Window Onload ------------------
window.onload = function() {
  setupTabs();
  renderRecentItems();
  setupBarcodeScan();
  setupInventoryTab();
  renderZoneCards();
  renderKPIs();
  renderCharts();
  setupCasesTab();
};
