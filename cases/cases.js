// === Mock Data for Cases ===
const mockCases = [
  {
    id: "CASE-2024-001",
    title: "Estate Sale - Johnson Family",
    status: "Processing",
    client: "Johnson Family Estate",
    contact: "estate@johnsonlaw.co.uk",
    received: "15/01/2024",
    auction: "15/02/2024",
    items: 25,
    value: "£12,500",
    description: "Complete household contents including furniture, electronics, and collectibles from a 50-year family home in Surrey",
    notes: "High-value antiques included, requires careful handling",
    itemsList: [
      {
        name: "Oak Dining Table",
        meta: "Furniture • Good",
        value: "£420",
        status: "Catalogued"
      },
      {
        name: "Oak Dining Chairs (Set of 6)",
        meta: "Furniture • Good",
        value: "£230",
        status: "Catalogued"
      }
    ]
  },
  {
    id: "CASE-2024-002",
    title: "Office Clearance - Green Ltd.",
    status: "Processing",
    client: "Green Ltd.",
    contact: "info@greenltd.com",
    received: "26/01/2024",
    auction: "28/02/2024",
    items: 14,
    value: "£4,000",
    description: "Office furniture and IT equipment clearance for Green Ltd.",
    notes: "",
    itemsList: [
      {
        name: "Dell Laptop",
        meta: "Electronics • Like New",
        value: "£320",
        status: "Photographed"
      }
    ]
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
  cases.forEach((c, idx) => {
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
      <div class="cases-card-desc">${c.description}</div>
      <div class="cases-card-actions">
        <button class="primary-btn cases-card-view-btn" data-index="${idx}">View</button>
        <button class="cases-card-actions-btn cases-card-edit-btn" title="Edit" data-index="${idx}">&#9998;</button>
        <button class="cases-card-actions-btn" title="Delete">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach view button listeners
  document.querySelectorAll('.cases-card-view-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      showCaseDetailModal(mockCases[idx]);
    };
  });

  // Attach edit button listeners
  document.querySelectorAll('.cases-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openCaseEditModal(mockCases[idx], idx);
    };
  });
}

// === Filter/Search Logic ===
function applyCaseFilters() {
  let filtered = [...mockCases];
  const search = document.getElementById("cases-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c =>
      c.id.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search) ||
      c.client.toLowerCase().includes(search) ||
      (c.contact && c.contact.toLowerCase().includes(search))
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

// === Case Edit Modal Logic ===
function openCaseEditModal(caseObj, idx) {
  // Reuse New Case Modal for editing
  openCaseModal();
  document.querySelector(".case-modal-title").textContent = "Edit Case";
  document.getElementById("case-number").value = caseObj.id;
  document.getElementById("case-title").value = caseObj.title;
  document.getElementById("case-client-name").value = caseObj.client;
  document.getElementById("case-client-contact").value = caseObj.contact || "";
  document.getElementById("case-auction-date").value = caseObj.auction ? formatISODate(caseObj.auction) : "";
  document.getElementById("case-desc").value = caseObj.description || "";
  document.getElementById("case-notes").value = caseObj.notes || "";
  // Disable editing Case Number
  document.getElementById("case-number").readOnly = true;

  // Overwrite the form submit handler for editing
  const form = document.getElementById("case-modal-form");
  const originalHandler = form.onsubmit;
  form.onsubmit = function(e) {
    e.preventDefault();
    // Update the case in mockCases
    mockCases[idx].title = document.getElementById("case-title").value;
    mockCases[idx].client = document.getElementById("case-client-name").value;
    mockCases[idx].contact = document.getElementById("case-client-contact").value;
    mockCases[idx].auction = document.getElementById("case-auction-date").value;
    mockCases[idx].description = document.getElementById("case-desc").value;
    mockCases[idx].notes = document.getElementById("case-notes").value;
    alert("Case updated!");
    closeCaseModal();
    renderCases(mockCases);
    form.onsubmit = originalHandler; // Restore original handler
  };
}

// Utility to format date as yyyy-mm-dd
function formatISODate(dateStr) {
  // Accepts e.g. "15/02/2024" or "2024-02-15"
  if (!dateStr) return "";
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
}

// === Case Details Modal Logic ===
function showCaseDetailModal(caseObj) {
  const modalBackdrop = document.getElementById('case-detail-modal-backdrop');
  const modal = document.getElementById('case-detail-modal');
  // Prevent page shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

  // Calculate value summary fields
  const totalValue = caseObj.value || "£0";
  const itemCount = caseObj.items || (caseObj.itemsList ? caseObj.itemsList.length : 0);
  let avgPerItem = 0;
  if (itemCount && totalValue.replace) {
    avgPerItem = Number(totalValue.replace(/[^\d.]/g,'')) / itemCount;
  }

  modal.innerHTML = `
    <button class="case-detail-close-btn" id="case-detail-close-btn">&times;</button>
    <div class="case-detail-title">Case Details</div>
    <div class="case-detail-main-row">
      <div class="case-detail-main">
        <div class="case-detail-section-title">Case Information</div>
        <div class="case-detail-label-row">
          <div>
            <span class="case-detail-label">Case Number</span>
            <span class="case-detail-value">${caseObj.id}</span>
          </div>
          <div>
            <span class="case-detail-label">Status</span>
            <span class="case-detail-status-badge ${caseObj.status ? caseObj.status.toLowerCase() : ""}">${caseObj.status || ""}</span>
          </div>
        </div>
        <div class="case-detail-label-row">
          <div>
            <span class="case-detail-label">Title</span>
            <span class="case-detail-value">${caseObj.title}</span>
          </div>
          <div>
            <span class="case-detail-label">Total Items</span>
            <span class="case-detail-value">${caseObj.items || (caseObj.itemsList ? caseObj.itemsList.length : 0)}</span>
          </div>
        </div>
        <div class="case-detail-section-title">Client Information</div>
        <div class="case-detail-label-row">
          <div>
            <span class="case-detail-label">Client Name</span>
            <span class="case-detail-value">${caseObj.client || ""}</span>
          </div>
          <div>
            <span class="case-detail-label">Contact</span>
            <span class="case-detail-value">${caseObj.contact || ""}</span>
          </div>
        </div>
        <div class="case-detail-section-title">Important Dates</div>
        <div class="case-detail-label-row">
          <div>
            <span class="case-detail-label">Received Date</span>
            <span class="case-detail-value">${caseObj.received || ""}</span>
          </div>
          <div>
            <span class="case-detail-label">Expected Auction Date</span>
            <span class="case-detail-value">${caseObj.auction || ""}</span>
          </div>
        </div>
        <div class="case-detail-section-title">Description</div>
        <div class="case-detail-description-box">${caseObj.description || ""}</div>
        <div class="case-detail-section-title">Notes</div>
        <div class="case-detail-notes-box">${caseObj.notes || ""}</div>
        <div class="case-detail-section-title">Items in This Case</div>
        <div class="case-detail-items-list">
          ${caseObj.itemsList && caseObj.itemsList.length
            ? caseObj.itemsList.map(item => `
                <div class="case-detail-item-row">
                  <div>
                    <div class="item-title">${item.name}</div>
                    <div class="item-meta">${item.meta || ""}</div>
                  </div>
                  <div class="item-value">${item.value || ""}</div>
                  <div class="item-status">${item.status || ""}</div>
                </div>
              `).join("")
            : `<div class="case-detail-item-row"><div class="item-title muted">No items found for this case.</div></div>`
          }
        </div>
        <div class="case-detail-modal-actions">
          <button class="primary-btn" title="Edit Case" id="case-detail-edit-btn">Edit Case</button>
          <button class="detail-modal-secondary-btn" id="case-detail-close-btn2" title="Close">Close</button>
        </div>
      </div>
      <div class="case-detail-side">
        <div class="case-detail-summary-card">
          <div class="case-detail-summary-label">Value Summary</div>
          <div class="case-detail-summary-row">
            <span>Estimated Total:</span>
            <span class="case-detail-summary-val">${totalValue}</span>
          </div>
          <div class="case-detail-summary-row">
            <span>Items Count:</span>
            <span class="case-detail-summary-val">${itemCount}</span>
          </div>
          <div class="case-detail-summary-row">
            <span>Avg. per Item:</span>
            <span class="case-detail-summary-val">£${avgPerItem ? Math.round(avgPerItem) : "0"}</span>
          </div>
        </div>
        <div>
          <div class="case-detail-section-title" style="margin-top:0;">Quick Actions</div>
          <div class="case-detail-quick-actions">
            <button class="case-detail-quick-btn edit" title="Edit Case" id="case-detail-edit-btn-2">Edit Case</button>
            <button class="case-detail-quick-btn lot" title="Create Lots">Create Lots</button>
            <button class="case-detail-quick-btn report" title="Generate Report">Generate Report</button>
            <button class="case-detail-quick-btn print" title="Print Labels">Print Labels</button>
          </div>
        </div>
      </div>
    </div>
  `;
  modalBackdrop.style.display = "flex";

  // Close modal logic
  document.getElementById('case-detail-close-btn').onclick =
  document.getElementById('case-detail-close-btn2').onclick = function () {
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
  };

  // Edit modal logic (main and sidebar button)
  document.getElementById('case-detail-edit-btn').onclick =
  document.getElementById('case-detail-edit-btn-2').onclick = function () {
    modalBackdrop.style.display = "none";
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    // Find index of the case to edit
    const idx = mockCases.findIndex(c => c.id === caseObj.id);
    openCaseEditModal(caseObj, idx);
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  populateStatusFilter();
  renderCases(mockCases);
  setupCaseListeners();
  setupCaseModal();
});
