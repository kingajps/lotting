// ------------------ Simulated Data ------------------

const recentItems = [
  {
    id: "AA001",
    name: "Antique Vase",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    barcode: "123456789001",
    status: "new",
    time: "Just now"
  },
  {
    id: "BB002",
    name: "Electric Guitar",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    barcode: "123456789002",
    status: "pending",
    time: "8 minutes ago"
  },
  {
    id: "CC003",
    name: "Collectible Toy Car",
    image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
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
    zone: "Zone A",
    status: "new",
    category: "Antiques",
    location: "Zone A",
    last_updated: "2025-09-24"
  },
  {
    id: "BB002",
    name: "Electric Guitar",
    quantity: 3,
    zone: "Zone B",
    status: "pending",
    category: "Instruments",
    location: "Zone B",
    last_updated: "2025-09-23"
  },
  {
    id: "CC003",
    name: "Collectible Toy Car",
    quantity: 12,
    zone: "Zone A",
    status: "new",
    category: "Toys",
    location: "Zone A",
    last_updated: "2025-09-24"
  }
];

const zones = [
  <script>
  const zones = [
    {
      name: "Unit 32",
      locations: {
        mezzanines: {
          count: 3,
          baysPerMezzanine: 5,
          levelsPerBay: 4
        },
        racks: {
          count: 3,
          baysPerRack: 6,
          levelsPerBay: 3
        },
        floorStorageAreas: 6
      }
    },
    {
      name: "Unit 30",
      locations: {
        racks: {
          count: 3,
          baysPerRack: 6,
          levelsPerBay: 3
        },
        floorStorageAreas: 6
      }
    },
    {
      name: "On Site",
      locations: {
        type: "Unspecified",
        description: "Unlimited and unspecified storage"
      }
    },
    {
      name: "In Transit",
      locations: {
        type: "Vehicle",
        description: "Van"
      }
    }
  ];

  const zoneGrid = document.querySelector('.zone-grid');

  zones.forEach(zone => {
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.innerHTML = `
      <div class="zone-name">${zone.name}</div>
      <div class="rack-list">
        ${zone.locations.description || Object.entries(zone.locations).map(([key, val]) => {
          if (typeof val === 'object') {
            return `${key}: ${val.count} × ${val.baysPerRack || val.baysPerMezzanine} bays × ${val.levelsPerBay} levels`;
          } else {
            return `${key}: ${val}`;
          }
        }).join('<br>')}
      </div>
    `;
    zoneGrid.appendChild(card);
  });

// Analytics mock
const kpis = [
  { title: "Total Items", value: 16 },
  { title: "Turnover Rate", value: "2.1x/mo" },
  { title: "Scan Frequency", value: "52/wk" }
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
      <img src="${item.image}" alt="${item.name}" class="item-thumb" />
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
    <img src="${item.image}" alt="${item.name}" />
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

// ------------------ Inventory Tracking ------------------
function fillFilters() {
  // Fill filter dropdowns with unique values from inventory
  const catSel = document.getElementById("filter-category");
  const statusSel = document.getElementById("filter-status");
  const locSel = document.getElementById("filter-location");

  let cats = [...new Set(inventory.map(i => i.category))];
  let stats = [...new Set(inventory.map(i => i.status))];
  let locs = [...new Set(inventory.map(i => i.location))];

  catSel.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `<option>${c}</option>`).join("");
  statusSel.innerHTML = `<option value="">All Status</option>` + stats.map(s => `<option>${statusText(s)}</option>`).join("");
  locSel.innerHTML = `<option value="">All Locations</option>` + locs.map(l => `<option>${l}</option>`).join("");
}

function renderInventoryTable() {
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  // Filters
  const cat = document.getElementById("filter-category").value;
  const stat = document.getElementById("filter-status").value;
  const loc = document.getElementById("filter-location").value;

  let filtered = inventory.filter(i =>
    (!cat || i.category === cat) &&
    (!stat || statusText(i.status) === stat) &&
    (!loc || i.location === loc)
  );

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.zone}</td>
      <td><span class="status-badge ${item.status}">${statusText(item.status)}</span></td>
      <td>
        <button class="table-action-btn" title="Edit">&#9998;</button>
        <button class="table-action-btn" title="View">&#128065;</button>
        <button class="table-action-btn" title="Delete">&#10006;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupInventoryFilters() {
  ["filter-category", "filter-status", "filter-location"].forEach(id => {
    document.getElementById(id).onchange = renderInventoryTable;
  });
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
      <div class="rack-list">${zone.racks.join(", ")}</div>
      <div class="capacity-bar">
        <div class="capacity-bar-fill" style="width:${Math.min(zone.capacity,100)}%;background:${zone.capacity>100?'#e53935':'#1a73e8'}"></div>
      </div>
      ${zone.full ? '<span class="zone-alert">Overfilled</span>' : ''}
    `;
    grid.appendChild(card);
  });
}

// ------------------ Analytics ------------------
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
function renderCharts() {
  const charts = document.getElementById("charts-section");
  charts.innerHTML = "";

  // Bar Chart (Items per Category)
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
  // Line Chart (Scans over Time)
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
  // Pie Chart (Status Distribution)
  charts.appendChild(makeChartCard("Status Distribution", `
    <svg width="120" height="120" viewBox="0 0 32 32">
      <circle r="16" cx="16" cy="16" fill="#f5f7fa"/>
      <path d="M16 16 L16 0 A16 16 0 0 1 31.2 12.7 Z" fill="#1a73e8"/>
      <path d="M16 16 L31.2 12.7 A16 16 0 0 1 16 32 Z" fill="#43a047"/>
      <path d="M16 16 L16 32 A16 16 0 0 1 16 0 Z" fill="#fbc02d"/>
    </svg>
  `));
}

function makeChartCard(title, svg) {
  const div = document.createElement("div");
  div.className = "chart-card";
  div.innerHTML = `<div class="chart-title">${title}</div>${svg}`;
  return div;
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

// ------------------ Main Init ------------------

window.onload = function() {
  setupTabs();
  renderRecentItems();
  setupBarcodeScan();
  fillFilters();
  renderInventoryTable();
  setupInventoryFilters();
  renderZoneCards();
  renderKPIs();
  renderCharts();
};
