// Dashboard Tab JS

// === Mock Data (Replace with API or backend calls as needed) ===
const mockKPIs = {
  totalItems: 348,
  totalItemsTrend: "+12 this week",
  storageUtil: 74,
  activeCases: 5,
  activeCasesTrend: "2 new cases",
  itemsSold: 41,
  itemsSoldTrend: "7 this month"
};

const mockRecentItems = [
  { name: "Vintage Camera", barcode: "A123", category: "Electronics", date: "2025-09-21" },
  { name: "Antique Vase", barcode: "B456", category: "Art", date: "2025-09-20" },
  { name: "Gold Watch", barcode: "C789", category: "Jewellery", date: "2025-09-18" }
];

const mockUpcomingAuctions = [
  { title: "Monthly Antiques Auction", date: "2025-10-05" },
  { title: "Jewellery & Watches Sale", date: "2025-10-12" }
];

const mockStorageStatus = [
  { zone: "A1", percent: 80, status: "Almost Full" },
  { zone: "B2", percent: 40, status: "Available" },
  { zone: "C3", percent: 100, status: "Full" }
];

const mockStatusDistribution = [
  { label: "Ready", value: 132, color: "#43a047" },
  { label: "Processing", value: 47, color: "#fbc02d" },
  { label: "Awaiting", value: 53, color: "#2563eb" },
  { label: "Sold", value: 41, color: "#7c3aed" }
];

// === KPI Cards ===
function renderKPIs() {
  document.getElementById("dashboard-total-items").textContent = mockKPIs.totalItems;
  document.getElementById("dashboard-total-items-trend").textContent = mockKPIs.totalItemsTrend;
  document.getElementById("dashboard-storage-util").textContent = mockKPIs.storageUtil + "%";
  document.getElementById("dashboard-active-cases").textContent = mockKPIs.activeCases;
  document.getElementById("dashboard-active-cases-trend").textContent = mockKPIs.activeCasesTrend;
  document.getElementById("dashboard-items-sold").textContent = mockKPIs.itemsSold;
  document.getElementById("dashboard-items-sold-trend").textContent = mockKPIs.itemsSoldTrend;

  // Animate storage bar
  document.getElementById("dashboard-storage-bar").style.width = mockKPIs.storageUtil + "%";
}

// === Recent Items List ===
function renderRecentItems() {
  const container = document.getElementById("dashboard-recent-items");
  container.innerHTML = "";
  mockRecentItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "dashboard-list-item";
    div.innerHTML = `
      <strong>${item.name}</strong> 
      <span style="color:#6584b9;font-size:0.97rem;">Barcode: ${item.barcode}</span>
      <span style="color:#43a047;margin-left:8px;">${item.category}</span>
      <span style="float:right;color:#777;">${item.date}</span>
    `;
    container.appendChild(div);
  });
}

// === Upcoming Auctions List ===
function renderUpcomingAuctions() {
  const container = document.getElementById("dashboard-upcoming-auctions");
  container.innerHTML = "";
  mockUpcomingAuctions.forEach(auction => {
    const div = document.createElement("div");
    div.className = "dashboard-auction-item";
    div.innerHTML = `
      <span style="font-weight:600;color:#2563eb;">${auction.title}</span>
      <span style="float:right;color:#6584b9;">${auction.date}</span>
    `;
    container.appendChild(div);
  });
}

// === Storage Status List ===
function renderStorageStatus() {
  const container = document.getElementById("dashboard-storage-status");
  container.innerHTML = "";
  mockStorageStatus.forEach(zone => {
    const div = document.createElement("div");
    div.className = "dashboard-storage-zone";
    div.innerHTML = `
      <span style="font-weight:500;">Zone ${zone.zone}</span>
      <span style="margin-left:10px;color:#2563eb;">${zone.percent}%</span>
      <span style="margin-left:14px;color:#43a047;">${zone.status}</span>
    `;
    container.appendChild(div);
  });
}

// === Status Distribution Chart ===
function renderStatusDistribution() {
  const container = document.getElementById("dashboard-status-distribution");
  container.innerHTML = "";
  let total = mockStatusDistribution.reduce((sum, d) => sum + d.value, 0);
  mockStatusDistribution.forEach(status => {
    const percent = ((status.value / total) * 100).toFixed(1);
    const bar = document.createElement("div");
    bar.className = "dashboard-status-bar";
    bar.style.background = status.color;
    bar.style.height = "22px";
    bar.style.width = percent + "%";
    bar.style.marginBottom = "8px";
    bar.style.borderRadius = "6px";
    bar.innerHTML = `
      <span style="color:#fff;padding-left:12px;font-weight:500;">${status.label} (${status.value})</span>
      <span style="float:right;color:#fff;padding-right:10px;">${percent}%</span>
    `;
    container.appendChild(bar);
  });
}

// === Quick Actions ===
function setupQuickActions() {
  document.getElementById("dashboard-action-scan").onclick = function() {
    window.location.href = "/lotting/scan/scan.html";
  };
  document.getElementById("dashboard-action-add").onclick = function() {
    window.location.href = "/lotting/inventory/inventory.html";
  };
  document.getElementById("dashboard-action-map").onclick = function() {
    window.location.href = "/lotting/storage/storage.html";
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  renderKPIs();
  renderRecentItems();
  renderUpcomingAuctions();
  renderStorageStatus();
  renderStatusDistribution();
  setupQuickActions();
});
