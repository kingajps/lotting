// Dashboard Tab JS

// === Mock Data ===
const dashboardMetrics = {
  totalItems: 4,
  totalItemsMeta: "+4 this week",
  storageUtil: 72.3,
  activeCases: 2,
  activeCasesMeta: "Processing inventory",
  itemsSold: 0,
  itemsSoldMeta: "This month"
};

const recentItems = [
  {
    icon: "📦",
    title: "Oak Dining Table",
    desc: "Furniture · Good",
    value: "£420",
    status: "Catalogued"
  },
  {
    icon: "📦",
    title: "Oak Dining Chairs (Set of 6)",
    desc: "Furniture · Good",
    value: "£230",
    status: "Catalogued"
  },
  {
    icon: "📦",
    title: "Dell Laptop",
    desc: "Electronics · Like New",
    value: "£320",
    status: "Photographed"
  },
  {
    icon: "📦",
    title: "iPad Air",
    desc: "Electronics · Good",
    value: "£160",
    status: "Listed"
  }
];

const upcomingAuctions = [
  {
    title: "February Estate & Consignment Auction",
    date: "15/02/2024 at 10:00",
    lots: 65,
    est: "Est. £32,000"
  }
];

const storageStatus = [
  { id: "U32-ELEC-A1", unit: "Unit 32", value: "15/50", status: "Available" },
  { id: "U32-FURN-B1", unit: "Unit 32", value: "8/20", status: "Available" },
  { id: "U30-ANT-C1", unit: "Unit 30", value: "5/30", status: "Available" }
];

const statusDist = [
  { label: "Received", value: 0 },
  { label: "Catalogued", value: 2 },
  { label: "Photographed", value: 1 },
  { label: "Listed", value: 1 },
  { label: "Sold", value: 0 },
  { label: "Awaiting Lotting", value: 0 }
];

// === Render Metrics ===
function renderMetrics() {
  document.getElementById("metric-total-items").textContent = dashboardMetrics.totalItems;
  document.getElementById("metric-total-items-meta").textContent = dashboardMetrics.totalItemsMeta;
  document.getElementById("metric-storage-util").textContent = dashboardMetrics.storageUtil + "%";
  document.getElementById("metric-storage-bar").style.width = dashboardMetrics.storageUtil + "%";
  document.getElementById("metric-active-cases").textContent = dashboardMetrics.activeCases;
  document.getElementById("metric-active-cases-meta").textContent = dashboardMetrics.activeCasesMeta;
  document.getElementById("metric-items-sold").textContent = dashboardMetrics.itemsSold;
  document.getElementById("metric-items-sold-meta").textContent = dashboardMetrics.itemsSoldMeta;
}

// === Render Recent Items ===
function renderRecentItems() {
  const container = document.getElementById("dashboard-recent-list");
  container.innerHTML = "";
  recentItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "dashboard-recent-item";
    row.innerHTML = `
      <span class="dashboard-recent-icon">${item.icon}</span>
      <div class="dashboard-recent-main">
        <div class="dashboard-recent-title">${item.title}</div>
        <div class="dashboard-recent-desc">${item.desc}</div>
      </div>
      <span class="dashboard-recent-value">${item.value}</span>
      <span class="dashboard-recent-status">🕒 ${item.status}</span>
    `;
    container.appendChild(row);
  });
}

// === Render Upcoming Auctions ===
function renderUpcoming() {
  const container = document.getElementById("dashboard-upcoming-list");
  container.innerHTML = "";
  upcomingAuctions.forEach(auc => {
    const row = document.createElement("div");
    row.className = "dashboard-upcoming-auction";
    row.innerHTML = `
      <div class="dashboard-upcoming-title">${auc.title}</div>
      <div class="dashboard-upcoming-date">${auc.date}</div>
      <div class="dashboard-upcoming-meta">${auc.lots} lots<br>${auc.est}</div>
    `;
    container.appendChild(row);
  });
}

// === Render Storage Status ===
function renderStorageStatus() {
  const container = document.getElementById("dashboard-status-list");
  container.innerHTML = "";
  storageStatus.forEach(s => {
    const row = document.createElement("div");
    row.className = "dashboard-status-row";
    row.innerHTML = `
      <span class="dashboard-status-id">${s.id}</span>
      <span class="dashboard-status-value">${s.value}</span>
      <span class="dashboard-status-available">${s.status}</span>
    `;
    container.appendChild(row);
  });
}

// === Render Item Status Distribution ===
function renderStatusDist() {
  const container = document.getElementById("dashboard-statusdist-row");
  container.innerHTML = "";
  statusDist.forEach(s => {
    const box = document.createElement("div");
    box.className = "dashboard-statusdist-box";
    box.innerHTML = `
      <div class="dashboard-statusdist-value">${s.value}</div>
      <div class="dashboard-statusdist-label">${s.label}</div>
    `;
    container.appendChild(box);
  });
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  renderMetrics();
  renderRecentItems();
  renderUpcoming();
  renderStorageStatus();
  renderStatusDist();
});
