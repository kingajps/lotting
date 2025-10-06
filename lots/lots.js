// === Persistent storage key ===
const LOTS_KEY = "aw_lots_data";

// === Mock Data for Lots ===
const mockLots = [
  {
    number: "LOT-001",
    auction: "February Auction",
    status: "Pending",
    description: "Antique vase in good condition.",
    notes: "Needs authentication."
  }
];

// === LocalStorage load/save logic ===
let lotsData = [];
function loadLots() {
  const local = localStorage.getItem(LOTS_KEY);
  if (local) {
    try { lotsData = JSON.parse(local); }
    catch { lotsData = JSON.parse(JSON.stringify(mockLots)); }
  } else {
    lotsData = JSON.parse(JSON.stringify(mockLots));
  }
}
function saveLots() {
  localStorage.setItem(LOTS_KEY, JSON.stringify(lotsData));
}

// === Render Lots Grid ===
function renderLots(lots) {
  const grid = document.getElementById("lots-grid");
  grid.innerHTML = "";
  if (lots.length === 0) {
    document.getElementById("lots-empty").style.display = "";
    document.getElementById("lots-results-count").textContent = `Showing 0 of ${lotsData.length} lots`;
    return;
  }
  document.getElementById("lots-empty").style.display = "none";
  document.getElementById("lots-results-count").textContent = `Showing ${lots.length} of ${lotsData.length} lots`;
  lots.forEach((l, idx) => {
    const card = document.createElement("div");
    card.className = "lots-card";
    card.innerHTML = `
      <div class="lots-card-title-row">
        <div class="lots-card-title">${l.number}</div>
        <span class="lots-card-status-badge ${l.status.toLowerCase()}">${l.status}</span>
      </div>
      <div class="lots-card-meta">
        <div class="lots-card-meta-row">
          <span class="lots-card-meta-label">Auction:</span>
          <span class="lots-card-meta-val bold">${l.auction}</span>
        </div>
      </div>
      <div class="lots-card-desc">${l.description}</div>
      <div class="lots-card-actions">
        <!-- Add future actions here -->
      </div>
    `;
    grid.appendChild(card);
  });
}

// === Modal Logic, Filter/Search, Listeners: Add similar to cases.js ===

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  loadLots();
  renderLots(lotsData);
  // Add listeners for modal, filters, etc.
});
