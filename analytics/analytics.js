// Analytics Dashboard Tab JS

// === Mock Data ===
const metrics = {
  inventoryValue: "£1,130",
  inventoryChange: "+12.5%",
  avgValue: "£283",
  avgChange: "+8.2%",
  activeCases: 2,
  activeCasesChange: "0",
  efficiency: "67%",
  efficiencyDetails: "94/140 capacity used"
};

const trends = {
  items: [
    { label: "Week 1", value: 120 },
    { label: "Week 2", value: 135 },
    { label: "Week 3", value: 128 },
    { label: "Week 4", value: 140 }
  ],
  value: [
    { label: "Week 1", value: 3000 },
    { label: "Week 2", value: 3400 },
    { label: "Week 3", value: 3200 },
    { label: "Week 4", value: 3800 }
  ],
  cases: [
    { label: "Week 1", value: 1 },
    { label: "Week 2", value: 1 },
    { label: "Week 3", value: 2 },
    { label: "Week 4", value: 2 }
  ],
  storage: [
    { label: "Week 1", value: 60 },
    { label: "Week 2", value: 62 },
    { label: "Week 3", value: 65 },
    { label: "Week 4", value: 67 }
  ]
};

const statusOverview = [
  { label: "Received", value: 0, percent: 0, color: "grey" },
  { label: "Catalogued", value: 2, percent: 50, color: "blue" },
  { label: "Photographed", value: 1, percent: 25, color: "purple" },
  { label: "Listed", value: 1, percent: 25, color: "green" },
  { label: "Sold", value: 0, percent: 0, color: "grey" },
  { label: "Awaiting Lotting", value: 0, percent: 0, color: "grey" }
];

const activity = [
  { label: "Items Added", value: 4, icon: "📦", color: "blue", desc: "This week" },
  { label: "Items Sold", value: 0, icon: "📈", color: "green", desc: "This week" },
  { label: "Items Photographed", value: 1, icon: "📸", color: "purple", desc: "This week" }
];

const storageZones = [
  { label: "Unit 32", percent: 67.1 },
  { label: "Unit 30", percent: 83.3 },
  { label: "On Site", percent: 55.0 }
];

const storageTypes = [
  { label: "Shelf", value: 3, percent: 75.0 },
  { label: "Floor", value: 1, percent: 25.0 }
];

const storageStatus = [
  { label: "Available", value: 4, percent: 100.0, color: "green" }
];

const events = [
  {
    label: "Upcoming Auctions",
    value: 1,
    desc: "Scheduled this month",
    est: "Est. £32,000",
    color: "blue"
  },
  {
    label: "Items Ready",
    value: 1,
    desc: "Ready for auction",
    est: "Est. £160",
    color: "green"
  },
  {
    label: "Awaiting Lotting",
    value: 0,
    desc: "Need lot allocation",
    est: "Est. £0",
    color: "yellow"
  }
];

const categoryDist = [
  { label: "Furniture", value: 2, percent: 50, color: "#2563eb" },
  { label: "Electronics", value: 2, percent: 50, color: "#43a047" },
  { label: "Collectibles", value: 0, percent: 0, color: "#fa8c1f" },
  { label: "Jewellery", value: 0, percent: 0, color: "#fbc02d" },
  { label: "Art", value: 0, percent: 0, color: "#f43f5e" },
  { label: "Tools", value: 0, percent: 0, color: "#a259e7" },
  { label: "Appliances", value: 0, percent: 0, color: "#6584b9" }
];

// === Render Trends Bar Chart ===
function renderTrends(tab = "items") {
  const bars = trends[tab];
  const max = Math.max(...bars.map(b => b.value), 1);
  const container = document.getElementById("analytics-trends-bars");
  container.innerHTML = "";
  bars.forEach(b => {
    const barDiv = document.createElement("div");
    barDiv.style.position = "relative";
    barDiv.innerHTML = `
      <div class="analytics-trends-bar-label">${b.label}</div>
      <div class="analytics-trends-bar-bg">
        <div class="analytics-trends-bar-fill" style="width:${(b.value / max) * 100}%"></div>
        <span class="analytics-trends-bar-value">${b.value}</span>
      </div>
    `;
    container.appendChild(barDiv);
  });
}

// === Render Category Distribution ===
function renderCategories() {
  const container = document.getElementById("analytics-category-list");
  container.innerHTML = "";
  categoryDist.forEach(cat => {
    const row = document.createElement("div");
    row.className = "analytics-category-row";
    row.innerHTML = `
      <span class="analytics-category-dot" style="background:${cat.color}"></span>
      <span class="analytics-category-label">${cat.label}</span>
      <span class="analytics-category-value">${cat.value} items</span>
      <span class="analytics-category-percent">${cat.percent}%</span>
    `;
    container.appendChild(row);
  });
}

// === Render Item Status Overview ===
function renderStatus() {
  const container = document.getElementById("analytics-status-bars");
  container.innerHTML = "";
  statusOverview.forEach(st => {
    const row = document.createElement("div");
    row.className = "analytics-status-row";
    row.innerHTML = `
      <span class="analytics-status-label">${st.label}</span>
      <div class="analytics-status-bar-bg">
        <div class="analytics-status-bar-fill analytics-status-bar-${st.color}" style="width:${st.percent}%"></div>
      </div>
      <span class="analytics-status-value">${st.value} items</span>
      <span class="analytics-status-percent">(${st.percent}%)</span>
    `;
    container.appendChild(row);
  });
}

// === Render Activity Summary ===
function renderActivity() {
  const container = document.getElementById("analytics-activity-summary");
  container.innerHTML = "";
  activity.forEach(act => {
    const row = document.createElement("div");
    row.className = `analytics-activity-row activity-${act.color}`;
    row.innerHTML = `
      <span class="activity-icon">${act.icon}</span>
      <span>${act.label}</span>
      <span class="activity-desc">${act.desc}</span>
      <span class="activity-value">${act.value}</span>
    `;
    container.appendChild(row);
  });
}

// === Render Storage Analytics ===
function renderStorage() {
  // Utilisation by zone
  const zoneContainer = document.getElementById("analytics-storage-zones");
  zoneContainer.innerHTML = "";
  storageZones.forEach(z => {
    const row = document.createElement("div");
    row.className = "analytics-storage-zone-row";
    row.innerHTML = `
      <span class="analytics-storage-zone-label">${z.label}</span>
      <div class="analytics-storage-zone-bar-bg">
        <div class="analytics-storage-zone-bar-fill" style="width:${z.percent}%"></div>
      </div>
      <span class="analytics-storage-zone-value">${z.percent.toFixed(1)}%</span>
    `;
    zoneContainer.appendChild(row);
  });

  // Storage types
  const typeContainer = document.getElementById("analytics-storage-types");
  typeContainer.innerHTML = "";
  storageTypes.forEach(t => {
    const row = document.createElement("div");
    row.className = "analytics-storage-types-row";
    row.innerHTML = `
      <span class="analytics-storage-types-label">${t.label}</span>
      <span class="analytics-storage-types-value">${t.value}</span>
      <span class="analytics-storage-types-percent">(${t.percent}%)</span>
    `;
    typeContainer.appendChild(row);
  });

  // Storage status
  const statusContainer = document.getElementById("analytics-storage-status");
  statusContainer.innerHTML = "";
  storageStatus.forEach(s => {
    const row = document.createElement("div");
    row.className = "analytics-storage-status-row";
    row.innerHTML = `
      <span class="analytics-storage-status-label">${s.label}</span>
      <span class="analytics-storage-status-value">${s.value}</span>
      <span class="analytics-storage-status-percent">(${s.percent}%)</span>
    `;
    statusContainer.appendChild(row);
  });
}

// === Render Events & Milestones ===
function renderEvents() {
  const container = document.getElementById("analytics-events-row");
  container.innerHTML = "";
  events.forEach(ev => {
    const row = document.createElement("div");
    row.className = `analytics-event-card event-${ev.color}`;
    row.innerHTML = `
      <div class="analytics-event-title">${ev.label}</div>
      <div class="analytics-event-value">${ev.value}</div>
      <div class="analytics-event-meta">${ev.desc}</div>
      <div class="analytics-event-desc">${ev.est}</div>
    `;
    container.appendChild(row);
  });
}

// === Tabs for Trends Chart ===
function setupTrendsTabs() {
  const tabs = document.querySelectorAll('.analytics-tab');
  tabs.forEach((tab, idx) => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const keys = ["items", "value", "cases", "storage"];
      renderTrends(keys[idx]);
    };
  });
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  // Metrics row is static text
  renderTrends("items");
  renderCategories();
  renderStatus();
  renderActivity();
  renderStorage();
  renderEvents();
  setupTrendsTabs();
});
