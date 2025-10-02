// Case Manager Tab JS

// === Mock Data for Cases ===
const mockCases = [
  {
    id: "CASE-2024-001",
    title: "Estate Sale - Johnson Family",
    status: "Processing",
    client: "Johnson Family Estate",
    received: "15/01/2024",
    items: 25,
    value: "£12,500",
    auction: "15/02/2024",
    desc: "Complete household contents including furniture, electronics, and collectibles from a 50-year family home in Surrey",
    progress: 50
  },
  {
    id: "CASE-2024-002",
    title: "Business Liquidation - Tech Startup",
    status: "Active",
    client: "TechFlow Solutions Ltd",
    received: "20/01/2024",
    items: 18,
    value: "£8,500",
    auction: "20/02/2024",
    desc: "Office equipment, computers, and furniture from failed startup company in London",
    progress: 25
  }
];

// === Populate Status Filter ===
function populateStatusFilter() {
  const statuses = Array.from(new Set(mockCases.map(c => c.status)));
  const select = document.getElementById("cases-status-filter");
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}

// === Render Cases ===
function renderCases(cases) {
  const grid = document.getElementById("cases-grid");
  grid.innerHTML = "";
  if (cases.length === 0) {
    document.getElementById("cases-empty").style.display = "";
    document.getElementById("cases-results-count").textContent = `Showing 0 of ${mockCases.length} cases`;
    return;
  }
  document.getElementById("cases-empty").style.display = "none";
  document.getElementById("cases-results-count").textContent = `Showing ${cases.length} of ${mockCases.length} cases`;
  cases.forEach(c => {
    const card = document.createElement("div");
    card.className = "cases-card";
    card.innerHTML = `
      <div class="cases-card-title-row">
        <div class="cases-card-title">${c.title}</div>
        <span class="cases-card-status-badge ${c.status.toLowerCase()}">${c.status}</span>
      </div>
      <div class="cases-card-id">${c.id}</div>
      <div class="cases-card-meta">
        <div class="cases-card-meta-row">
          <span class="cases-card-meta-label">Client:</span>
          <span class="cases-card-meta-val bold">${c.client}</span>
        </div>
        <div class="cases-card-meta-row">
          <span class="cases-card-meta-label">Received:</span>
          <span class="cases-card-meta-val">${c.received}</span>
        </div>
        <div class="cases-card-meta-row">
          <span class="cases-card-meta-label">Items:</span>
          <span class="cases-card-meta-val bold">${c.items}</span>
        </div>
        <div class="cases-card-meta-row">
          <span class="cases-card-meta-label">Est. Value:</span>
          <span class="cases-card-meta-val bold">${c.value}</span>
        </div>
        <div class="cases-card-meta-row">
          <span class="cases-card-meta-label">Expected Auction:</span>
          <span class="cases-card-meta-val">${c.auction}</span>
        </div>
      </div>
      <div class="cases-card-desc">${c.desc}</div>
      <div class="cases-card-progress">
        Progress <span style="margin-left:10px;">${c.progress}%</span>
        <div class="cases-card-progress-bar-bg">
          <div class="cases-card-progress-bar-fill ${c.status.toLowerCase()}" style="width:${c.progress}%;"></div>
        </div>
      </div>
      <div class="cases-card-actions">
        <button class="primary-btn" title="View">View</button>
        <button class="cases-card-actions-btn" title="Edit">&#9998;</button>
        <button class="cases-card-actions-btn" title="Delete">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// === Filter/Search Logic ===
function applyFilters() {
  let filtered = [...mockCases];
  const search = document.getElementById("cases-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(search) ||
      c.client.toLowerCase().includes(search) ||
      c.id.toLowerCase().includes(search)
    );
  }
  const status = document.getElementById("cases-status-filter").value;
  if (status) filtered = filtered.filter(c => c.status === status);
  renderCases(filtered);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("cases-search").addEventListener("input", applyFilters);
  document.getElementById("cases-status-filter").addEventListener("change", applyFilters);
  document.getElementById("cases-new-btn").onclick = function () {
    alert("New Case creation form coming soon!");
  };
}

// === Modal Logic ===
function openCaseModal() {
  // Get scrollbar width
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
  document.getElementById("case-modal-backdrop").style.display = "flex";
}
function closeCaseModal() {
  document.body.style.overflow = "";
  document.body.style.marginRight = "";
  document.getElementById("case-modal-backdrop").style.display = "none";
}

// === Modal Submission ===
function setupCaseModal() {
  document.getElementById("cases-new-btn").onclick = openCaseModal;
  document.getElementById("case-modal-close-btn").onclick =
  document.getElementById("case-modal-cancel-btn").onclick = closeCaseModal;

  document.getElementById("case-modal-form").onsubmit = function(e) {
    e.preventDefault();
    alert("Case created (demo)!");
    closeCaseModal();
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  populateStatusFilter();
  renderCases(mockCases);
  setupCaseListeners();
  setupCaseModal();
});
