// === Mock Data for Cases ===
const mockCases = [
  {
    number: "CASE-2024-001",
    title: "Estate Sale - Johnson Family",
    client: "Johnson Family Estate",
    clientContact: "johnson@email.com",
    received: "15/01/2024",
    items: 25,
    value: "£12,500",
    auction: "15/02/2024",
    description: "Complete household contents including furniture, electronics, and collectibles from a 50-year family home in Surrey",
    notes: "",
    status: "Ongoing"
  },
  {
    number: "CASE-2024-002",
    title: "Office Clearance - Green Ltd.",
    client: "Green Ltd.",
    clientContact: "green@email.com",
    received: "26/01/2024",
    items: 14,
    value: "£4,000",
    auction: "28/02/2024",
    description: "Office furniture and IT equipment clearance for Green Ltd.",
    notes: "",
    status: "Ongoing"
  }
];

// === Populate Status Filter ===
function populateStatusFilter() {
  const statuses = Array.from(new Set(mockCases.map(c => c.status)));
  const statusSelect = document.getElementById("cases-status-filter");
  statusSelect.innerHTML = '<option value="">All Statuses</option>';
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusSelect.appendChild(opt);
  });
}

// === Render Cases Grid ===
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
      <div class="cases-card-title">${c.title}</div>
      <div class="cases-card-number">${c.number}</div>
      <div class="cases-card-client">
        <b>Client:</b> ${c.client}
      </div>
      <div class="cases-card-row">
        <span><b>Received:</b> ${c.received}</span>
        <span><b>Items:</b> ${c.items}</span>
        <span><b>Est. Value:</b> ${c.value}</span>
      </div>
      <div class="cases-card-row">
        <span><b>Expected Auction:</b> ${c.auction}</span>
      </div>
      <div class="cases-card-desc">${c.description}</div>
      <div class="cases-card-progress">
        <div class="cases-card-progress-bar"></div>
      </div>
      <button class="cases-card-view-btn">View</button>
    `;
    grid.appendChild(card);
  });
}

// === Filter/Search Logic ===
function applyCaseFilters() {
  let filtered = [...mockCases];
  const search = document.getElementById("cases-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c =>
      c.number.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search) ||
      c.client.toLowerCase().includes(search) ||
      (c.clientContact && c.clientContact.toLowerCase().includes(search))
    );
  }
  const stat = document.getElementById("cases-status-filter").value;
  if (stat) filtered = filtered.filter(c => c.status === stat);
  renderCases(filtered);
}

// === Event Listeners ===
function setupCaseListeners() {
  document.getElementById("cases-search").addEventListener("input", applyCaseFilters);
  document.getElementById("cases-status-filter").addEventListener("change", applyCaseFilters);
}

// === Modal Logic ===
function openCaseModal() {
  // Prevent page shift when hiding scrollbar
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
