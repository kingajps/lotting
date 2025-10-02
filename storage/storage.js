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
        id: "OS-RECEP-R1",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 40,
        used: 22,
        items: 0
      }
    ]
  },
  {
    group: "In Transit",
    locations: [
      {
        id: "TR-INT-01",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 12,
        used: 4,
        items: 0
      }
    ]
  }
];

// === Utility: Color by utilization percent ===
function getBarColor(percent) {
  if (percent >= 80) return "#fbc02d"; // yellow for high
  if (percent >= 60) return "#1976d2"; // blue for medium
  return "#43a047"; // green for low
}

// === Populate Filters ===
function populateFilters() {
  // Zones
  const zoneSet = Array.from(new Set(mockZones.map(z => z.group)));
  const zoneSelect = document.getElementById("map-zone-filter");
  zoneSet.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    zoneSelect.appendChild(opt);
  });

  // Statuses
  const statuses = ["Available", "Full", "Maintenance"];
  const statusSelect = document.getElementById("map-status-filter");
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusSelect.appendChild(opt);
  });
}

// === Render All Zones ===
function renderZones(zones) {
  const container = document.getElementById("zone-groups");
  container.innerHTML = "";
  let count = 0;
  zones.forEach(zone => {
    // Filter out if no locations after filters
    if (!zone.locations.length) return;
    const groupDiv = document.createElement("div");
    groupDiv.className = "zone-group";
    groupDiv.innerHTML = `<div class="zone-group-title">${zone.group}</div>`;
    const cardsDiv = document.createElement("div");
    cardsDiv.className = "zone-group-cards";
    zone.locations.forEach(loc => {
      count++;
      const percent = Math.round((loc.used / loc.capacity) * 100);
      const barColor = getBarColor(percent);
      const card = document.createElement("div");
      card.className = "storage-card";
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
      cardsDiv.appendChild(card);
    });
    groupDiv.appendChild(cardsDiv);
    container.appendChild(groupDiv);
  });
  document.getElementById("map-locations-count").textContent = `${count} locations`;
}

// === Filtering Logic ===
function filterAndRender() {
  const search = document.getElementById("map-search").value.trim().toLowerCase();
  const zone = document.getElementById("map-zone-filter").value;
  const status = document.getElementById("map-status-filter").value;

  // Filter mockZones/groups
  const filtered = mockZones.map(group => {
    let filteredLocs = group.locations;
    if (zone && group.group !== zone) filteredLocs = [];
    if (status) filteredLocs = filteredLocs.filter(loc => loc.status === status);
    if (search) {
      filteredLocs = filteredLocs.filter(loc =>
        loc.id.toLowerCase().includes(search) ||
        loc.type.toLowerCase().includes(search)
      );
    }
    return { ...group, locations: filteredLocs };
  });
  renderZones(filtered);
}

// --- Persistent Storage Map Data (edit & save to localStorage) ---
const STORAGE_KEY = "aw_storage_map_data";

// Try to load from localStorage or use mockZones if not present
let editableZones = [];
function loadZones() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { editableZones = JSON.parse(local); } catch { editableZones = JSON.parse(JSON.stringify(mockZones)); }
  } else {
    editableZones = JSON.parse(JSON.stringify(mockZones));
  }
}
function saveZones() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(editableZones));
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("map-search").addEventListener("input", filterAndRender);
  document.getElementById("map-zone-filter").addEventListener("change", filterAndRender);
  document.getElementById("map-status-filter").addEventListener("change", filterAndRender);
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  populateFilters();
  filterAndRender();
  setupListeners();
});
