// ------------------ Simulated Data ------------------

const inventory = [
  {
    id: "ITEM-003",
    name: "Dell Laptop",
    subtitle: "Dell Inspiron 15 3000",
    barcode: "987654321998",
    condition: "Like New",
    category: "Electronics",
    status: "Photographed",
    zone: "U32-ELEC-A1",
    case: "CASE-2024-002",
    price: 320
  },
  {
    id: "ITEM-004",
    name: "iPad Air",
    subtitle: "Apple iPad Air (4th generation)",
    barcode: "456789123456",
    condition: "Good",
    category: "Electronics",
    status: "Listed",
    zone: "U32-ELEC-A1",
    case: "CASE-2024-002",
    price: 160
  },
  {
    id: "ITEM-002",
    name: "Oak Dining Chairs (Set of 6)",
    subtitle: "Heritage Furniture Classic Oak",
    barcode: "123456789012",
    condition: "Good",
    category: "Furniture",
    status: "Catalogued",
    zone: "U32-FURN-B1",
    case: "CASE-2024-001",
    price: 230
  },
  {
    id: "ITEM-001",
    name: "Oak Dining Table",
    subtitle: "Heritage Furniture Classic Oak",
    barcode: "123456789012",
    condition: "Good",
    category: "Furniture",
    status: "Catalogued",
    zone: "U32-FURN-B1",
    case: "CASE-2024-001",
    price: 420
  }
];

const zones = [
  {
    zone: "U32-ELEC-A1",
    name: "Unit 32",
    used: 15,
    capacity: 50
  },
  {
    zone: "U32-FURN-B1",
    name: "Unit 32",
    used: 8,
    capacity: 20
  },
  {
    zone: "U30-ANT-C1",
    name: "Unit 30",
    used: 5,
    capacity: 30
  }
];

const cases = [
  {
    id: "CASE-2024-001",
    title: "February Estate & Consignment Auction",
    lots: 65,
    date: "15/02/2024",
    time: "10:00",
    estimate: "£32,000"
  },
  {
    id: "CASE-2024-002",
    title: "March Tech Auction",
    lots: 40,
    date: "01/03/2024",
    time: "15:00",
    estimate: "£14,000"
  }
];

const statusTypes = [
  { key: "Received", label: "Received" },
  { key: "Catalogued", label: "Catalogued" },
  { key: "Photographed", label: "Photographed" },
  { key: "Listed", label: "Listed" },
  { key: "Sold", label: "Sold" },
  { key: "Awaiting Lotting", label: "Awaiting Lotting" }
];

// ------------------ Tab Navigation and Breadcrumb ------------------
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-section");
  const breadcrumb = document.getElementById("breadcrumb");
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
      // Breadcrumb logic
      breadcrumb.innerHTML = `<span>Auction Warehouse</span> / <span>${
        tab.textContent.trim()
      }</span>`;
    };
  });
}

// ------------------ Dashboard Tab Functions ------------------
function renderDashboardKPIs() {
  const totalItems = inventory.length;
  document.getElementById("dashboard-total-items").textContent = totalItems;
  document.getElementById("dashboard-total-items-trend").textContent = `+${totalItems} this week`;

  // Storage Utilisation
  const totalUsed = zones.reduce((sum, z) => sum + z.used, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const storageUtil = totalCapacity ? ((totalUsed / totalCapacity) * 100).toFixed(1) : "0";
  document.getElementById("dashboard-storage-util").textContent = `${storageUtil}%`;
  document.getElementById("dashboard-storage-bar").style.width = `${storageUtil}%`;

  // Active Cases (simulate 2/processing inventory)
  document.getElementById("dashboard-active-cases").textContent = "2";
  document.getElementById("dashboard-active-cases-trend").textContent = "Processing inventory";

  // Items Sold (simulate 0/this month)
  document.getElementById("dashboard-items-sold").textContent = "0";
  document.getElementById("dashboard-items-sold-trend").textContent = "This month";
}

function renderDashboardRecentItems() {
  const container = document.getElementById("dashboard-recent-items");
  container.innerHTML = "";
  inventory.forEach(item => {
    const div = document.createElement("div");
    div.className = "dashboard-list-item";
    div.innerHTML = `
      <div class="item-left">
        <span class="item-icon">
          <svg width="28" height="28" fill="none"><rect width="28" height="28" rx="7" fill="#e3f0fb"/><path d="M14 8l6 3.5v5c0 .59-.33 1.13-.83 1.37l-4.67 2.12-4.67-2.12A1.34 1.34 0 0 1 8 16.5v-5L14 8Z" fill="#2563eb"/><path d="M14 8v9.5" stroke="#2563eb" stroke-width="2"/></svg>
        </span>
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-meta">${item.category} &bull; ${item.condition}</span>
        </div>
      </div>
      <span class="item-price">£${item.price}</span>
      <span class="item-status status-${item.status.toLowerCase()}">
        ${item.status === "Catalogued" ? '<svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#fbc02d" stroke-width="2"/><path d="M9 6v3h3" stroke="#fbc02d" stroke-width="2" stroke-linecap="round"/></svg>' : 
        item.status === "Photographed" ? '<svg width="18" height="18" fill="none"><rect x="3" y="5" width="12" height="8" rx="2" stroke="#2563eb" stroke-width="2"/><circle cx="9" cy="9" r="2" fill="#2563eb"/></svg>' :
        item.status === "Listed" ? '<svg width="18" height="18" fill="none"><rect x="4" y="4" width="10" height="10" rx="2" stroke="#43a047" stroke-width="2"/><path d="M7 7h4v4H7V7Z" fill="#43a047"/></svg>' : ""}
        ${item.status}
      </span>
    `;
    container.appendChild(div);
  });
}

function renderDashboardUpcomingAuctions() {
  const container = document.getElementById("dashboard-upcoming-auctions");
  container.innerHTML = "";
  cases.forEach(auction => {
    const div = document.createElement('div');
    div.className = 'dashboard-auction-box';
    div.innerHTML = `
      <div class="dashboard-auction-title">${auction.title}</div>
      <div class="dashboard-auction-meta">${auction.date} at ${auction.time}</div>
      <div class="dashboard-auction-meta"><span class="dashboard-auction-lots">${auction.lots} lots</span> Est. ${auction.estimate}</div>
    `;
    container.appendChild(div);
  });
}

function renderDashboardStorageStatus() {
  const container = document.getElementById("dashboard-storage-status");
  container.innerHTML = "";
  zones.forEach(zone => {
    const available = zone.capacity - zone.used;
    container.innerHTML += `
      <div class="dashboard-storage-box">
        <div>
          <span class="dashboard-storage-zone">${zone.zone}</span><br>
          <span class="dashboard-storage-info">${zone.name}</span>
        </div>
        <div>
          <span class="dashboard-storage-count">${available}/${zone.capacity}</span>
          <span class="dashboard-storage-available">${available > 0 ? "Available" : ""}</span>
          <span class="dashboard-storage-full">${available === 0 ? "Full" : ""}</span>
        </div>
      </div>
    `;
  });
}

function renderDashboardStatusDistribution() {
  const container = document.getElementById("dashboard-status-distribution");
  container.innerHTML = "";
  // Count items per status
  const counts = {
    "Received": 0,
    "Catalogued": inventory.filter(i => i.status === "Catalogued").length,
    "Photographed": inventory.filter(i => i.status === "Photographed").length,
    "Listed": inventory.filter(i => i.status === "Listed").length,
    "Sold": 0,
    "Awaiting Lotting": 0
  };
  statusTypes.forEach(st => {
    const div = document.createElement("div");
    div.className = "status-distribution-card";
    div.innerHTML = `
      <div class="status-distribution-value">${counts[st.key]}</div>
      <div class="status-distribution-label">${st.label}</div>
    `;
    container.appendChild(div);
  });
}

// ------------------ Quick Actions ------------------
function setupDashboardActions() {
  document.getElementById("dashboard-action-scan").onclick = () => {
    switchTab("scan");
  };
  document.getElementById("dashboard-action-add").onclick = () => {
    switchTab("inventory");
  };
  document.getElementById("dashboard-action-map").onclick = () => {
    switchTab("storage");
  };
}

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
  document.querySelector('.tab-btn[data-tab="' + tab + '"]').classList.add("active");
  document.getElementById("tab-" + tab).classList.add("active");
}

// ------------------ Barcode Scanner Tab ------------------
document.addEventListener("DOMContentLoaded", function() {
  const lookupBtn = document.getElementById("barcode-lookup-btn");
  if (lookupBtn) {
    lookupBtn.onclick = () => {
      const code = document.getElementById("barcode-manual-input").value.trim();
      const found = inventory.find(i => i.id === code || i.barcode === code);
      if (found) {
        alert(
          `Found Item:\n` +
          `Name: ${found.name}\n` +
          `Price: £${found.price}\n` +
          `Condition: ${found.condition}\n` +
          `Category: ${found.category}\n` +
          `Status: ${found.status}\n` +
          `Zone: ${found.zone}\n` +
          `Case: ${found.case}`
        );
      } else {
        alert("No item found for this barcode.");
      }
    };
  }
  const cameraBtn = document.getElementById("barcode-start-camera-btn");
  if (cameraBtn) {
    cameraBtn.onclick = () => {
      alert("Camera starting... (Demo placeholder)");
    };
  }
});

// ------------------ Inventory Tab ------------------
function fillInventoryFilters() {
  // Fill select options
  const catSel = document.getElementById("filter-category");
  const statusSel = document.getElementById("filter-status");
  const caseSel = document.getElementById("filter-case");
  // Categories
  let cats = [...new Set(inventory.map(i => i.category))];
  catSel.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `<option>${c}</option>`).join("");
  // Statuses
  let stats = [...new Set(inventory.map(i => i.status))];
  statusSel.innerHTML = `<option value="">All Statuses</option>` + stats.map(s => `<option>${s}</option>`).join("");
  // Cases
  let casesList = [...new Set(inventory.map(i => i.case))];
  caseSel.innerHTML = `<option value="">All Cases</option>` + casesList.map(c => `<option>${c}</option>`).join("");
}

function renderInventoryCards() {
  const searchVal = document.getElementById("inventory-search").value.toLowerCase();
  const catVal = document.getElementById("filter-category").value;
  const statusVal = document.getElementById("filter-status").value;
  const caseVal = document.getElementById("filter-case").value;
  const sortVal = document.getElementById("inventory-sort").value;
  let filtered = inventory.filter(i =>
    (!catVal || i.category === catVal) &&
    (!statusVal || i.status === statusVal) &&
    (!caseVal || i.case === caseVal) &&
    (
      !searchVal ||
      i.name.toLowerCase().includes(searchVal) ||
      i.subtitle.toLowerCase().includes(searchVal) ||
      i.barcode.toLowerCase().includes(searchVal)
    )
  );

  // Sort logic
  if (sortVal === "name") {
    filtered.sort((a,b) => a.name.localeCompare(b.name));
  } else if (sortVal === "value") {
    filtered.sort((a,b) => b.price - a.price);
  } else if (sortVal === "status") {
    filtered.sort((a,b) => a.status.localeCompare(b.status));
  }

  document.getElementById("inventory-results-count").textContent =
    `Showing ${filtered.length} of ${inventory.length} items`;

  const grid = document.getElementById("inventory-card-grid");
  grid.innerHTML = "";
  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "inventory-card";
    div.innerHTML = `
      <div class="card-icon">
        <svg width="28" height="28" fill="none"><rect width="28" height="28" rx="7" fill="#e3f0fb"/><path d="M14 8l6 3.5v5c0 .59-.33 1.13-.83 1.37l-4.67 2.12-4.67-2.12A1.34 1.34 0 0 1 8 16.5v-5L14 8Z" fill="#2563eb"/><path d="M14 8v9.5" stroke="#2563eb" stroke-width="2"/></svg>
      </div>
      <div class="card-title">${item.name}</div>
      <div class="card-subtitle">${item.subtitle}</div>
      <div class="card-barcode">${item.barcode}</div>
      <div>
        <span class="card-status-badge card-status-${item.status.toLowerCase()}">${item.status}</span>
        <span class="card-status-badge card-status-good">${item.condition}</span>
      </div>
      <div class="card-meta-group">
        <span class="card-meta-label">Value:</span>
        <span class="card-meta-value">£${item.price}</span>
        <span class="card-meta-label">Category:</span>
        <span class="card-meta-value">${item.category}</span>
      </div>
      <div class="card-zone">📦 ${item.zone}</div>
      <div class="card-case">📝 ${item.case}</div>
      <div class="inventory-card-actions">
        <button class="view-btn">View</button>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

function setupInventoryTabEvents() {
  document.getElementById("inventory-search").addEventListener("input", renderInventoryCards);
  document.getElementById("filter-category").addEventListener("change", renderInventoryCards);
  document.getElementById("filter-status").addEventListener("change", renderInventoryCards);
  document.getElementById("filter-case").addEventListener("change", renderInventoryCards);
  document.getElementById("inventory-sort").addEventListener("change", renderInventoryCards);
  document.getElementById("inventory-add-btn").addEventListener("click", () => {
    alert("Add New Item functionality to be implemented!");
  });
}

// ------------------ Storage Tab ------------------
function renderZoneCards() {
  const grid = document.getElementById("zone-cards");
  grid.innerHTML = "";
  zones.forEach(zone => {
    const card = document.createElement("div");
    card.className = "zone-card";
    card.innerHTML = `
      <div class="zone-name">${zone.zone}</div>
      <ul class="zone-details">
        <li>Capacity: ${zone.capacity}</li>
        <li>Used: ${zone.used}</li>
        <li>Available: ${zone.capacity - zone.used}</li>
      </ul>
      <div class="capacity-bar">
        <div class="capacity-bar-fill" style="width:${Math.round((zone.used/zone.capacity)*100)}%;background:${zone.used>=zone.capacity?'#e53935':'#2563eb'}"></div>
      </div>
      ${zone.used >= zone.capacity ? '<span class="zone-alert">Full</span>' : ''}
    `;
    card.onclick = () => showZoneInventory(zone.zone);
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
            Value: £${item.price} | Condition: ${item.condition}<br/>
            Status: ${item.status}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

// ------------------ Cases Tab ------------------
function renderCasesTab() {
  // For brevity, cases tab logic can be filled out as needed
}

// ------------------ Initial Load ------------------
window.onload = function() {
  setupTabs();
  // Dashboard
  renderDashboardKPIs();
  renderDashboardRecentItems();
  renderDashboardUpcomingAuctions();
  renderDashboardStorageStatus();
  renderDashboardStatusDistribution();
  setupDashboardActions();
  // Inventory
  fillInventoryFilters();
  renderInventoryCards();
  setupInventoryTabEvents();
  // Storage
  renderZoneCards();
  // Cases/Analytics tabs can be enhanced as needed
};
