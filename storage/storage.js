// Storage Map Tab JS

// === Mock Data (Replace with API/backend calls as needed) ===
const mockZones = [
  { id: "A1", name: "Zone A1", desc: "Near main entrance", status: "Available", percent: 40 },
  { id: "A2", name: "Zone A2", desc: "Far left corner", status: "Full", percent: 100 },
  { id: "B1", name: "Zone B1", desc: "Back wall", status: "Ready", percent: 75 },
  { id: "C3", name: "Zone C3", desc: "By loading dock", status: "Processing", percent: 60 },
  { id: "D4", name: "Zone D4", desc: "Middle aisle", status: "Cancelled", percent: 0 }
];

// === Render Zone Cards ===
function renderZones(zones) {
  const grid = document.getElementById("zone-cards");
  grid.innerHTML = "";
  zones.forEach(zone => {
    const card = document.createElement("div");
    card.className = "zone-card";
    card.innerHTML = `
      <div class="zone-card-title">${zone.name}</div>
      <div class="zone-card-desc">${zone.desc}</div>
      <div class="zone-status">${zone.status} (${zone.percent}%)</div>
      <div style="margin-top:10px;">
        <div style="background:#e3eaf2;border-radius:4px;height:8px;position:relative;">
          <div style="background:#2563eb;height:100%;border-radius:4px;width:${zone.percent}%"></div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// === Filter Zones (Demo) ===
function setupZoneFilter() {
  // If you add filter UI, hook up events here.
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  renderZones(mockZones);
  setupZoneFilter();
});
