// Storage Map Tab JS

// === Mock Data for Storage Locations Grouped by Zone ===
const mockZones = [
  {
    group: "Zone Unit 32",
    locations: [
      {
        id: "U32-ELEC-A1",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 50,
        used: 35,
        items: 2
      },
      {
        id: "U32-FURN-B1",
        type: "Floor",
        icon: "✔️",
        status: "Available",
        capacity: 20,
        used: 12,
        items: 2
      }
    ]
  },
  {
    group: "Zone Unit 30",
    locations: [
      {
        id: "U30-ANT-C1",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 30,
        used: 25,
        items: 0
      }
    ]
  },
  {
    group: "Zone On Site",
    locations: [
      {
        id: "On Site of Company",
        type: "CasesOnSite",
        icon: "🏢",
        status: "On Site",
        caseCount: 5,
        desc: "Assets currently at company sites."
      },
      {
        id: "Awaiting Collection",
        type: "AwaitingCollection",
        icon: "⏳",
        status: "Awaiting",
        assetCount: 3,
        desc: "Items/assets awaiting collection for transfer to warehouse."
      }
    ]
  },
  {
    group: "In Transit",
    locations: [
      {
        id: "Transit-Van-1",
        type: "Van",
        icon: "🚚",
        status: "Available",
        inUse: false,
        booking: {}
      },
      {
        id: "Transit-Van-2",
        type: "Van",
        icon: "🚚",
        status: "In Use",
        inUse: true,
        booking: {
          from: "2025-10-01 09:00",
          to: "2025-10-01 15:00",
          by: "John Doe",
          company: "Greentech Ltd.",
          address: "123 Green St, London"
        }
      },
      {
        id: "Shipped to Customers",
        type: "Shipped",
        icon: "📦",
        status: "Shipped",
        shipmentCount: 4,
        desc: "Items shipped off to customers."
      }
    ]
  }
];

// === Utility: Color by utilization percent ===
function getBarColor(percent) {
  if (percent >= 80) return "#fbc02d";
  if (percent >= 60) return "#1976d2";
  return "#43a047";
}
function getStorageCardClass(percent) {
  if (percent >= 76) return "storage-card-red";
  if (percent >= 50) return "storage-card-amber";
  return "storage-card-green";
}

const STORAGE_KEY = "aw_storage_map_data";
let editableZones = [];

// Only restore missing/empty zones; never overwrite user edits!
function ensureZonesPresent(zones) {
  const required = ["Zone On Site", "In Transit"];
  for (const groupName of required) {
    const idx = zones.findIndex(z => z.group === groupName);
    const mockIdx = mockZones.findIndex(z => z.group === groupName);
    if (mockIdx === -1) continue;
    if (idx === -1) {
      zones.push(JSON.parse(JSON.stringify(mockZones[mockIdx])));
    } else if (!Array.isArray(zones[idx].locations) || zones[idx].locations.length === 0) {
      zones[idx].locations = JSON.parse(JSON.stringify(mockZones[mockIdx].locations));
    }
  }
}

function loadZones() {
  let zones;
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { zones = JSON.parse(local); }
    catch { zones = JSON.parse(JSON.stringify(mockZones)); }
  } else {
    zones = JSON.parse(JSON.stringify(mockZones));
  }
  ensureZonesPresent(zones);
  editableZones = zones;
  saveZones();
}
function saveZones() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(editableZones));
}

// === Inventory/Case Data Utilities ===
function getInventory() {
  try {
    return JSON.parse(localStorage.getItem("inventory")) || [];
  } catch {
    return [];
  }
}
function getCases() {
  try {
    return JSON.parse(localStorage.getItem("aw_cases_data")) || [];
  } catch {
    return [];
  }
}
// Returns [{company, address, caseNumbers:[], items:[{name, qty}]}]
function getOnSiteCompanies() {
  // Get all inventory items with location "On Site" or similar, or with location/case/caseObj status "On Site".
  // We'll use inventory + cases data.
  const inventory = getInventory();
  const cases = getCases();

  // Map caseId to caseObj for address
  const caseMap = {};
  cases.forEach(cs => { caseMap[cs.id] = cs; });

  // Group items by company (from case)
  const companyMap = {};
  inventory.forEach(item => {
    // Heuristic: On Site items detected if location contains "On Site" (case insensitive)
    if (item.location && item.location.toLowerCase().includes("on site")) {
      const caseObj = caseMap[item.case] || {};
      // Use client name as company, address from case if available
      const company = (caseObj.client || "Unknown Company").trim();
      const address = (caseObj.contact || caseObj.address || "No address").trim();
      const caseNum = item.case || "N/A";
      if (!companyMap[company]) {
        companyMap[company] = {
          company,
          address,
          caseNumbers: new Set(),
          items: {}
        };
      }
      companyMap[company].caseNumbers.add(caseNum);
      companyMap[company].items[item.name] = (companyMap[company].items[item.name] || 0) + 1;
    }
  });
  // Convert to array and flatten sets
  return Object.values(companyMap).map(comp => ({
    company: comp.company,
    address: comp.address,
    caseNumbers: Array.from(comp.caseNumbers),
    items: Object.entries(comp.items).map(([name, qty]) => ({ name, qty }))
  }));
}

// === Modal Logic ===
function removeZoneModal() {
  // Only remove from document.body; never from a section/footer!
  const modal = document.getElementById("zone-modal-backdrop");
  if (modal && modal.parentNode === document.body) {
    modal.parentNode.removeChild(modal);
  }
}

function showOnSiteCompanyListModal() {
  removeZoneModal();
  const companies = getOnSiteCompanies();
  const backdrop = document.createElement("div");
  backdrop.className = "zone-modal-backdrop";
  backdrop.id = "zone-modal-backdrop";
  backdrop.innerHTML = `
    <div class="zone-modal">
      <div class="zone-modal-header">
        Companies with On Site Assets
        <button class="zone-modal-close-btn" id="zone-modal-close-btn">&times;</button>
      </div>
      <div class="zone-modal-list">
        ${companies.length === 0
          ? `<div style="color:#888;">No companies with on-site assets found.</div>`
          : companies.map((c, i) =>
            `<button class="zone-modal-list-btn" data-company-idx="${i}">${c.company}</button>`
          ).join('')}
      </div>
    </div>
  `;
  // MODAL FIX: Append to document.body ONLY!
  document.body.appendChild(backdrop);
  document.getElementById("zone-modal-close-btn").onclick = removeZoneModal;
  if (companies.length > 0) {
    backdrop.querySelectorAll(".zone-modal-list-btn").forEach(btn => {
      btn.onclick = () => {
        showOnSiteCompanyDetailModal(companies[btn.getAttribute("data-company-idx")]);
      };
    });
  }
}
function showOnSiteCompanyDetailModal(companyObj) {
  removeZoneModal();
  const backdrop = document.createElement("div");
  backdrop.className = "zone-modal-backdrop";
  backdrop.id = "zone-modal-backdrop";
  backdrop.innerHTML = `
    <div class="zone-modal">
      <div class="zone-modal-header">
        ${companyObj.company}
        <button class="zone-modal-close-btn" id="zone-modal-close-btn">&times;</button>
      </div>
      <div class="zone-modal-detail-row">
        <span class="zone-modal-detail-label">Address:</span>
        <span class="zone-modal-detail-value">${companyObj.address || "N/A"}</span>
      </div>
      <div class="zone-modal-detail-row">
        <span class="zone-modal-detail-label">Case Number(s):</span>
        <span class="zone-modal-detail-value">${companyObj.caseNumbers.join(", ")}</span>
      </div>
      <div class="zone-modal-section-title">Items at this site:</div>
      <table class="zone-modal-items-table">
        <thead><tr><th>Item Name</th><th>Quantity</th></tr></thead>
        <tbody>
        ${companyObj.items.length === 0
          ? `<tr><td colspan="2" style="color:#888;">No items found.</td></tr>`
          : companyObj.items.map(item =>
            `<tr><td>${item.name}</td><td>${item.qty}</td></tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
  `;
  // MODAL FIX: Append to document.body ONLY!
  document.body.appendChild(backdrop);
  document.getElementById("zone-modal-close-btn").onclick = removeZoneModal;
}

// === Populate Filters ===
function populateFilters() {
  const zoneSet = Array.from(new Set(editableZones.map(z => z.group)));
  const zoneSelect = document.getElementById("map-zone-filter");
  zoneSelect.innerHTML = '<option value="">All Zones</option>';
  zoneSet.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    zoneSelect.appendChild(opt);
  });

  const statuses = ["Available", "Full", "Maintenance", "On Site", "OnSite", "Awaiting", "Shipped", "In Use"];
  const statusSelect = document.getElementById("map-status-filter");
  statusSelect.innerHTML = '<option value="">All Statuses</option>';
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusSelect.appendChild(opt);
  });
}

// === Render All Zones (standard & edit mode) ===
function renderZones(zones, editable = false) {
  const container = document.getElementById("zone-groups");
  container.innerHTML = "";
  let count = 0;
  zones.forEach((zone, zoneIdx) => {
    if (!zone.locations.length) return;
    const groupDiv = document.createElement("div");
    groupDiv.className = "zone-group";
    let addAreaBtn = "";
    if (editable) {
      addAreaBtn = `<button class="add-area-btn" onclick="window.addAreaToZone(${zoneIdx})">+ Add Area</button>`;
    }
    groupDiv.innerHTML = `<div class="zone-group-title">${zone.group} ${addAreaBtn}</div>`;
    const cardsDiv = document.createElement("div");
    cardsDiv.className = "zone-group-cards";
    zone.locations.forEach((loc, locIdx) => {
      count++;
      let cardClass = "storage-card";
      let percent = 0;
      if (
        zone.group !== "Zone On Site" &&
        zone.group !== "In Transit" &&
        typeof loc.capacity === "number" &&
        typeof loc.used === "number" &&
        loc.capacity > 0
      ) {
        percent = Math.round((loc.used / loc.capacity) * 100);
        cardClass += " " + getStorageCardClass(percent);
      }
      const card = document.createElement("div");
      card.className = cardClass;

      // Render different layouts for special zones
      if (zone.group === "Zone On Site") {
        // On Site special display
        if (loc.type === "CasesOnSite") {
          // "On Site of Company"
          card.innerHTML = `
            <div class="storage-card-header">
              <span style="font-size:1.3em">${loc.icon}</span>
              <span class="storage-card-id" style="cursor:pointer;text-decoration:underline;color:#2563eb;">${loc.id}</span>
            </div>
            <div class="storage-card-desc">${loc.desc || ""}</div>
            <div class="storage-card-items"><b>Click to view companies</b></div>
          `;
          // Make the full card clickable
          card.style.cursor = "pointer";
          card.onclick = showOnSiteCompanyListModal;
        } else {
          // "Awaiting Collection" and others
          card.innerHTML = `
            <div class="storage-card-header">
              <span style="font-size:1.3em">${loc.icon}</span>
              <span class="storage-card-id">${loc.id}</span>
            </div>
            <div class="storage-card-desc">${loc.desc || ""}</div>
            <div class="storage-card-items"><b>Assets awaiting collection:</b> ${loc.assetCount||0}</div>
          `;
        }
      } else if (zone.group === "In Transit") {
        if (editable) {
          if (loc.type === "Van") {
            card.innerHTML = `
              <div class="storage-card-header">
                <input type="text" value="${loc.id}" style="width:125px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
                <span style="margin-left:8px;font-size:1.3em">${loc.icon}</span>
              </div>
              <div>
                <select onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'status')">
                  <option value="Available"${loc.status === "Available" ? " selected" : ""}>Available</option>
                  <option value="In Use"${loc.status === "In Use" ? " selected" : ""}>In Use</option>
                </select>
              </div>
              ${loc.status === "In Use" ? `
                <div>
                  <label>From: <input type="datetime-local" value="${loc.booking && loc.booking.from ? toDatetimeLocal(loc.booking.from) : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'from')" /></label>
                  <label>To: <input type="datetime-local" value="${loc.booking && loc.booking.to ? toDatetimeLocal(loc.booking.to) : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'to')" /></label>
                  <label>By: <input type="text" value="${loc.booking && loc.booking.by ? loc.booking.by : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'by')" /></label>
                  <label>Company: <input type="text" value="${loc.booking && loc.booking.company ? loc.booking.company : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'company')" /></label>
                  <label>Address: <input type="text" value="${loc.booking && loc.booking.address ? loc.booking.address : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'address')" /></label>
                </div>
              ` : ""}
              <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
            `;
          } else if (loc.type === "Shipped") {
            card.innerHTML = `
              <div class="storage-card-header">
                <input type="text" value="${loc.id}" style="width:150px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
                <span style="margin-left:8px;font-size:1.3em">${loc.icon}</span>
              </div>
              <div class="storage-card-desc"><input type="text" value="${loc.desc||''}" style="width:95%;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'desc')" /></div>
              <label>Shipments: <input type="number" min="0" value="${loc.shipmentCount||0}" style="width:55px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'shipmentCount')" /></label>
              <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
            `;
          }
        } else {
          if (loc.type === "Van") {
            card.innerHTML = `
              <div class="storage-card-header">
                <span style="font-size:1.3em">${loc.icon}</span>
                <span class="storage-card-id">${loc.id}</span>
                <span class="storage-card-type">Van</span>
              </div>
              <div><b>Status:</b> ${loc.status}</div>
              ${loc.status === "In Use" && loc.booking
                ? `<div>
                    <b>From:</b> ${loc.booking.from} <b>To:</b> ${loc.booking.to}<br>
                    <b>By:</b> ${loc.booking.by} <b>Company:</b> ${loc.booking.company}<br>
                    <b>Address:</b> ${loc.booking.address}
                  </div>`
                : ""}
            `;
          } else if (loc.type === "Shipped") {
            card.innerHTML = `
              <div class="storage-card-header">
                <span style="font-size:1.3em">${loc.icon}</span>
                <span class="storage-card-id">${loc.id}</span>
              </div>
              <div class="storage-card-desc">${loc.desc || ""}</div>
              <div class="storage-card-items"><b>Shipments:</b> ${loc.shipmentCount||0}</div>
            `;
          }
        }
      } else {
        const barColor = getBarColor(percent);
        if (editable) {
          card.innerHTML = `
            <div class="storage-card-header">
              <input type="text" value="${loc.id}" style="width:110px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
              <select onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'type')">
                <option value="Shelf"${loc.type === "Shelf" ? " selected" : ""}>Shelf</option>
                <option value="Floor"${loc.type === "Floor" ? " selected" : ""}>Floor</option>
              </select>
            </div>
            <div class="storage-card-capacity-row">
              <label>Used: <input type="number" min="0" max="${loc.capacity}" value="${loc.used}" style="width:40px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'used')" /></label>
              <label>Capacity: <input type="number" min="1" value="${loc.capacity}" style="width:50px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'capacity')" /></label>
            </div>
            <div class="storage-card-bar-bg">
              <div class="storage-card-bar-fill" style="background:${barColor};width:${percent}%"></div>
            </div>
            <div class="storage-card-items">
              <label>Items: <input type="number" min="0" value="${loc.items}" style="width:40px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'items')" /></label>
            </div>
            <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
          `;
        } else {
          card.innerHTML = `
            <div class="storage-card-header">
              <span class="storage-card-icon">✔️</span>
              <span class="storage-card-id">${loc.id}</span>
              <span class="storage-card-type">${loc.type}</span>
              <span class="storage-card-dot" style="background:#43a047"></span>
            </div>
            <div class="storage-card-capacity-row">
              <span class="storage-card-capacity-label">Capacity</span>
              <span class="storage-card-capacity-value">${loc.used}/${loc.capacity}</span>
            </div>
            <div class="storage-card-bar-bg">
              <div class="storage-card-bar-fill" style="background:${barColor};width:${percent}%"></div>
            </div>
            <div class="storage-card-util">${percent}% utilized</div>
            <div class="storage-card-avail">Available: ${loc.capacity - loc.used}</div>
            <div class="storage-card-items">${loc.items} items stored</div>
          `;
        }
      }
      cardsDiv.appendChild(card);
    });
    groupDiv.appendChild(cardsDiv);
    container.appendChild(groupDiv);
  });
  document.getElementById("map-locations-count").textContent = `${count} locations`;
}

// Expose for HTML inline handlers
window.handleZoneEdit = function(e, zoneIdx, locIdx, field) {
  let val = e.target.value;
  if (["used", "capacity", "items", "caseCount", "assetCount", "shipmentCount"].includes(field)) val = parseInt(val, 10) || 0;
  editableZones[zoneIdx].locations[locIdx][field] = val;
};
window.handleVanBookingEdit = function(e, zoneIdx, locIdx, field) {
  const val = e.target.value;
  if (!editableZones[zoneIdx].locations[locIdx].booking) editableZones[zoneIdx].locations[locIdx].booking = {};
  editableZones[zoneIdx].locations[locIdx].booking[field] = val;
};
window.addAreaToZone = function(zoneIdx) {
  const zone = editableZones[zoneIdx];
  let newArea = {};
  if (zone.group === "Zone On Site") {
    newArea = {
      id: "New Area",
      type: "CasesOnSite",
      icon: "🏢",
      status: "On Site",
      caseCount: 0,
      desc: ""
    };
  } else if (zone.group === "In Transit") {
    newArea = {
      id: "New Van",
      type: "Van",
      icon: "🚚",
      status: "Available",
      inUse: false,
      booking: {}
    };
  } else {
    newArea = {
      id: "New Area",
      type: "Shelf",
      icon: "✔️",
      status: "Available",
      capacity: 10,
      used: 0,
      items: 0
    };
  }
  zone.locations.push(newArea);
  saveZones();
  renderZones(editableZones, true);
};
window.removeAreaFromZone = function(zoneIdx, locIdx) {
  if(confirm("Are you sure you want to remove this area?")) {
    editableZones[zoneIdx].locations.splice(locIdx, 1);
    saveZones();
    renderZones(editableZones, true);
  }
};

function toDatetimeLocal(str) {
  if (!str) return "";
  return str.replace(" ", "T");
}

// === Filtering Logic ===
function filterAndRender() {
  const search = document.getElementById("map-search").value.trim().toLowerCase();
  const zone = document.getElementById("map-zone-filter").value;
  const status = document.getElementById("map-status-filter").value;
  const filtered = editableZones.map(group => {
    let filteredLocs = group.locations;
    if (zone && group.group !== zone) filteredLocs = [];
    if (status) filteredLocs = filteredLocs.filter(loc => loc.status === status);
    if (search) {
      filteredLocs = filteredLocs.filter(loc =>
        (loc.id && loc.id.toLowerCase().includes(search)) ||
        (loc.type && loc.type.toLowerCase().includes(search))
      );
    }
    return { ...group, locations: filteredLocs };
  });
  renderZones(filtered, editMode);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("map-search").addEventListener("input", filterAndRender);
  document.getElementById("map-zone-filter").addEventListener("change", filterAndRender);
  document.getElementById("map-status-filter").addEventListener("change", filterAndRender);
}

// --- Edit Mode UI ---
let editMode = false;
function toggleEditMode() {
  editMode = !editMode;
  if (!editMode) saveZones();
  filterAndRender();
  document.getElementById("edit-storage-map-btn").textContent = editMode ? "Save Changes" : "Edit Storage Map";
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  loadZones();
  populateFilters();
  filterAndRender();
  setupListeners();
  const btn = document.getElementById("edit-storage-map-btn");
  if (btn) btn.onclick = toggleEditMode;
  // Modal should close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") removeZoneModal();
  });
});
