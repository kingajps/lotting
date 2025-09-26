// ------------------ Simulated Data ------------------

const inventory = [
  {
    id: "ITEM-001",
    name: "Antique Vase",
    price: 1200,
    condition: "Excellent",
    category: "Antiques",
    status: "a/w lotting",
    zone: "Unit 32",
    recent: true,
    soldWeek: false
  },
  {
    id: "ITEM-002",
    name: "Electric Guitar",
    price: 800,
    condition: "Good",
    category: "Instruments",
    status: "listed",
    zone: "Unit 30",
    recent: true,
    soldWeek: true
  },
  {
    id: "ITEM-003",
    name: "Collectible Toy Car",
    price: 75,
    condition: "Fair",
    category: "Toys",
    status: "listed",
    zone: "Unit 32",
    recent: true,
    soldWeek: false
  },
  {
    id: "ITEM-004",
    name: "Office Desk",
    price: 240,
    condition: "Good",
    category: "Furniture",
    status: "catalogued",
    zone: "Unit 32",
    recent: false,
    soldWeek: false
  },
  {
    id: "ITEM-005",
    name: "Gold Necklace",
    price: 3200,
    condition: "Excellent",
    category: "Jewelry",
    status: "sold",
    zone: "Unit 30",
    recent: false,
    soldWeek: true
  }
];

const zones = [
  {
    name: "Unit 32",
    capacity: 20,
    used: 15
  },
  {
    name: "Unit 30",
    capacity: 15,
    used: 7
  },
  {
    name: "In Transit",
    capacity: 3,
    used: 2
  }
];

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
  }
];

const auctions = [
  {
    title: "Johnson Estate Auction",
    caseName: "Johnson Family Estate",
    datetime: "2025-09-28 14:00",
    lots: 12,
    estimate: "£14,000",
    storage: [
      { zone: "Unit 32", available: 5, used: 7 }
    ]
  },
  {
    title: "Smith Artworks Auction",
    caseName: "James Smith",
    datetime: "2025-09-29 11:30",
    lots: 8,
    estimate: "£8,500",
    storage: [
      { zone: "Unit 30", available: 8, used: 7 }
    ]
  }
];

const statusTypes = [
  { key: "a/w lotting", label: "A/W Lotting", color: "#7c3aed" },
  { key: "a/w photographing", label: "A/W Photographing", color: "#1a73e8" },
  { key: "catalogued", label: "Catalogued", color: "#e0e3e8" },
  { key: "listed", label: "Listed", color: "#e3f0fb" },
  { key: "sold", label: "Sold", color: "#43a047" },
  { key: "unsold", label: "Unsold", color: "#e53935" }
];

// ------------------ Dashboard Tab Functions ------------------
function renderDashboardKPIs() {
  document.getElementById("dashboard-total-items").textContent = inventory.length;
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalUsed = zones.reduce((sum, z) => sum + z.used, 0);
  const util = totalCapacity ? Math.round((totalUsed / totalCapacity) * 100) : 0;
  document.getElementById("dashboard-storage-util").textContent = util + "%";
  document.getElementById("dashboard-active-cases").textContent = cases.filter(
    c => c.status === "Processing" || c.status === "Ready"
  ).length;
  document.getElementById("dashboard-items-sold").textContent = inventory.filter(i => i.soldWeek).length;
}

function renderDashboardRecentItems() {
  const container = document.getElementById("dashboard-recent-items");
  container.innerHTML = "";
  const recent = inventory.filter(i => i.recent);
  if (!recent.length) {
    container.innerHTML = "<span style='color:#888'>No recent items.</span>";
    return;
  }
  recent.forEach(item => {
    const div = document.createElement("div");
    div.className = "dashboard-list-item";
    div.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-meta">Price: £${item.price} | Condition: ${item.condition} | Category: ${item.category}</div>
      <div class="item-meta">Status: <span class="item-status status-${item.status.replace(/[^a-z]/gi, '').toLowerCase()}">${item.status}</span></div>
    `;
    container.appendChild(div);
  });
}

function renderDashboardUpcomingAuctions() {
  const container = document.getElementById("dashboard-upcoming-auctions");
  container.innerHTML = "";
  if (!auctions.length) {
    container.innerHTML = "<span style='color:#888'>No upcoming auctions.</span>";
    return;
  }
  auctions.forEach(auction => {
    const div = document.createElement("div");
    div.className = "dashboard-list-item";
    const storageStatus = auction.storage.map(s =>
      `${s.zone}: ${s.available}/${s.available + s.used} available`
    ).join(", ");
    div.innerHTML = `
      <div class="auction-title">${auction.title}</div>
      <div class="auction-meta">Case: ${auction.caseName}</div>
      <div class="auction-meta">Date/Time: ${auction.datetime}</div>
      <div class="auction-meta">Lots: ${auction.lots}</div>
      <div class="auction-estimate">Estimate: ${auction.estimate}</div>
      <div class="auction-meta">Storage: ${storageStatus}</div>
    `;
    container.appendChild(div);
  });
}

function renderDashboardStorageStatus() {
  const tbody = document.querySelector("#dashboard-storage-table tbody");
  tbody.innerHTML = "";
  zones.forEach(zone => {
    const available = zone.capacity - zone.used;
    let statusClass = "storage-status-available";
    let statusText = "Available";
    if (available === 0) {
      statusClass = "storage-status-full";
      statusText = "Full";
    } else if (zone.used > 0 && available > 0) {
      statusClass = "storage-status-inuse";
      statusText = "In Use";
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${zone.name}</td>
      <td>${available}</td>
      <td>${zone.used}</td>
      <td class="${statusClass}">${statusText}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardStatusChart() {
  const container = document.getElementById("dashboard-status-chart");
  const statusCounts = statusTypes.map(s => ({
    ...s,
    count: inventory.filter(i => i.status === s.key).length
  }));
  const max = Math.max(...statusCounts.map(s => s.count), 1);
  const barWidth = 48, gap = 18, chartHeight = 120;
  let bars = statusCounts.map((s, idx) => {
    const barHeight = Math.round((s.count / max) * (chartHeight - 40));
    return `
      <rect x="${idx * (barWidth + gap) + 12}" y="${chartHeight - barHeight - 24}" width="${barWidth}" height="${barHeight}" fill="${s.color}" rx="7"/>
      <text x="${idx * (barWidth + gap) + 36}" y="${chartHeight - 8}" font-size="12" text-anchor="middle" fill="#222">${s.label}</text>
      <text x="${idx * (barWidth + gap) + 36}" y="${chartHeight - barHeight - 30}" font-size="14" text-anchor="middle" fill="#2563eb" font-weight="600">${s.count}</text>
    `;
  }).join("");
  container.innerHTML = `<svg width="100%" height="${chartHeight}" viewBox="0 0 360 ${chartHeight}">
    ${bars}
  </svg>`;
}

function setupDashboardActions() {
  document.getElementById("dashboard-action-scan").onclick = () => {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
    document.querySelector('.tab-btn[data-tab="scan"]').classList.add("active");
    document.getElementById("tab-scan").classList.add("active");
  };
  document.getElementById("dashboard-action-add").onclick = () => {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
    document.querySelector('.tab-btn[data-tab="inventory"]').classList.add("active");
    document.getElementById("tab-inventory").classList.add("active");
  };
  document.getElementById("dashboard-action-map").onclick = () => {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
    document.querySelector('.tab-btn[data-tab="storage"]').classList.add("active");
    document.getElementById("tab-storage").classList.add("active");
  };
}

// ------------------ Barcode Scanner Tab ------------------

// Manual barcode lookup
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
      <td><span class="status-badge status-${item.status.replace(/[^a-z]/gi, '').toLowerCase()}">${item.status}</span></td>
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
      <div class="zone-name">${zone.name}</div>
      <ul class="zone-details">
        <li>Capacity: ${zone.capacity}</li>
        <li>Used: ${zone.used}</li>
        <li>Available: ${zone.capacity - zone.used}</li>
      </ul>
      <div class="capacity-bar">
        <div class="capacity-bar-fill" style="width:${Math.round((zone.used/zone.capacity)*100)}%;background:${zone.used>=zone.capacity?'#e53935':'#1a73e8'}"></div>
      </div>
      ${zone.used >= zone.capacity ? '<span class="zone-alert">Full</span>' : ''}
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
        <div class="case-card-body" style="padding:1.2rem;">
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
  renderDashboardStatusChart();
  setupDashboardActions();
  fillFilters();
  renderInventoryTable();
  setupInventoryFilters();
  renderZoneCards();
  setupCasesTab();
};
