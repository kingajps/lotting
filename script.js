// ------------------ Simulated Data ------------------

const inventory = [
  {
    id: "ITEM-001",
    name: "Oak Dining Table",
    price: 420,
    condition: "Good",
    category: "Furniture",
    status: "Catalogued",
    zone: "U32-ELEC-A1",
    recent: true,
    soldWeek: false
  },
  {
    id: "ITEM-002",
    name: "Oak Dining Chairs (Set of 6)",
    price: 230,
    condition: "Good",
    category: "Furniture",
    status: "Catalogued",
    zone: "U32-FURN-B1",
    recent: true,
    soldWeek: false
  },
  {
    id: "ITEM-003",
    name: "Dell Laptop",
    price: 320,
    condition: "Like New",
    category: "Electronics",
    status: "Photographed",
    zone: "U32-ELEC-A1",
    recent: true,
    soldWeek: false
  },
  {
    id: "ITEM-004",
    name: "iPad Air",
    price: 160,
    condition: "Good",
    category: "Electronics",
    status: "Listed",
    zone: "U30-ANT-C1",
    recent: true,
    soldWeek: false
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
  }
];

// Status types for the status distribution
const statusTypes = [
  { key: "Received", label: "Received" },
  { key: "Catalogued", label: "Catalogued" },
  { key: "Photographed", label: "Photographed" },
  { key: "Listed", label: "Listed" },
  { key: "Sold", label: "Sold" },
  { key: "Awaiting Lotting", label: "Awaiting Lotting" }
];

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
      const found = inventory.find(i => i.id === code);
      if (found) {
        alert(
          `Found Item:\n` +
          `Name: ${found.name}\n` +
          `Price: £${found.price}\n` +
          `Condition: ${found.condition}\n` +
          `Category: ${found.category}\n` +
          `Status: ${found.status}\n` +
          `Zone: ${found.zone}`
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
function fillFilters() {
  const catSel = document.getElementById("filter-category");
  const statusSel = document.getElementById("filter-status");
  const locSel = document.getElementById("filter-location");

  let cats = [...new Set(inventory.map(i => i.category))];
  let stats = [...new Set(inventory.map(i => i.status))];
  let locs = [...new Set(inventory.map(i => i.zone))];

  catSel.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `<option>${c}</option>`).join("");
  statusSel.innerHTML = `<option value="">All Status</option>` + stats.map(s => `<option>${s}</option>`).join("");
  locSel.innerHTML = `<option value="">All Zones</option>` + locs.map(l => `<option>${l}</option>`).join("");
}

function renderInventoryTable() {
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  const cat = document.getElementById("filter-category").value;
  const stat = document.getElementById("filter-status").value;
  const loc = document.getElementById("filter-location").value;

  let filtered = inventory.filter(i =>
    (!cat || i.category === cat) &&
    (!stat || i.status === stat) &&
    (!loc || i.zone === loc)
  );

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity ? item.quantity : 1}</td>
      <td>${item.zone}</td>
      <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
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
            Price: £${item.price} | Condition: ${item.condition}<br/>
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

// ------------------ Initial Load ------------------
window.onload = function() {
  setupTabs();
  renderDashboardKPIs();
  renderDashboardRecentItems();
  renderDashboardUpcomingAuctions();
  renderDashboardStorageStatus();
  renderDashboardStatusDistribution();
  setupDashboardActions();
  fillFilters();
  renderInventoryTable();
  setupInventoryFilters();
  renderZoneCards();
  // renderCasesTab(); // Add if cases logic is needed
};
