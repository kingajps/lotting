// === Persistent storage key ===
const CASES_KEY = "aw_cases_data";

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

const CASE_STATUSES = ["Processing", "Completed", "InProgress", "Cancelled", "Closed"];

// === LocalStorage load/save logic ===
let casesData = [];
function loadCases() {
  const local = localStorage.getItem(CASES_KEY);
  if (local) {
    try { casesData = JSON.parse(local); }
    catch { casesData = JSON.parse(JSON.stringify(mockCases)); }
  } else {
    casesData = JSON.parse(JSON.stringify(mockCases));
  }
}
function saveCases() {
  localStorage.setItem(CASES_KEY, JSON.stringify(casesData));
}

// === Populate Status Filter ===
function populateStatusFilter() {
  const statuses = Array.from(new Set(casesData.map(c => c.status)));
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
    document.getElementById("cases-results-count").textContent = `Showing 0 of ${casesData.length} cases`;
    return;
  }
  document.getElementById("cases-empty").style.display = "none";
  document.getElementById("cases-results-count").textContent = `Showing ${cases.length} of ${casesData.length} cases`;
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
        <button class="cases-card-actions-btn" title="Delete" data-index="${idx}">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach view button listeners
  document.querySelectorAll('.cases-card-view-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      showCaseDetailModal(casesData[idx]);
    };
  });

  // Attach edit button listeners
  document.querySelectorAll('.cases-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openCaseEditModal(casesData[idx], idx);
    };
  });

  // Attach delete button listeners
  document.querySelectorAll('.cases-card-actions-btn[title="Delete"]').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      if (confirm("Are you sure you want to delete this case?")) {
        casesData.splice(idx, 1);
        saveCases();
        renderCases(casesData);
      }
    };
  });
}

// === Filter/Search Logic ===
function applyCaseFilters() {
  let filtered = [...casesData];
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
    // Add new case to casesData
    const newCase = {
      id: document.getElementById("case-number").value.trim(),
      caseManager: document.getElementById('case-manager').value.trim(),
      title: document.getElementById("case-title").value.trim(),
      companyAddress: document.getElementById('company-address').value.trim(),
      status: "Processing",
      client: document.getElementById("case-client-name").value.trim(),
      contact: document.getElementById("case-client-contact").value.trim(),
      clientAddress: document.getElementById('client-address').value.trim(),
      received: "", // You may want to add this field to your form
      auction: document.getElementById("case-auction-date").value.trim(),
      items: 0,
      value: "",
      description: document.getElementById("case-desc").value.trim(),
      notes: document.getElementById("case-notes").value.trim(),
      closedCase: document.getElementById('case-closed').checked,
      caseReviewed: document.querySelector('input[name="case-reviewed"]:checked')?.value || ""
      itemsList: []
    };
    casesData.push(newCase);
    saveCases();
    renderCases(casesData);
    closeCaseModal();
    alert("Case created!");
  };
}

// === Case Edit Modal Logic ===
function openCaseEditModal(caseObj, idx) {
  // Open a custom edit modal over the case modal backdrop
  const modalBackdrop = document.getElementById('case-detail-modal-backdrop');
  let modal = document.getElementById('case-detail-modal');
  modalBackdrop.style.display = 'flex';
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = (window.innerWidth - document.documentElement.clientWidth) > 0 ? `${window.innerWidth - document.documentElement.clientWidth}px` : "";

  // Render editable form for all fields including items
  modal.innerHTML = `
    <button class="case-detail-close-btn" id="case-detail-edit-close-btn">&times;</button>
    <div class="case-detail-title">Edit Case</div>
    <form id="case-detail-edit-form" autocomplete="off">
      <div class="case-detail-main-row">
        <div class="case-detail-main">
          <div class="case-detail-section-title">Case Information</div>
          <div class="case-detail-label-row">
            <div>
              <span class="case-detail-label">Case Number</span>
              <input type="text" id="edit-case-id" value="${caseObj.id}" required style="width:180px;" />
            </div>
            <div>
              <span class="case-detail-label">Status</span>
              <select id="edit-case-status" required>
                ${CASE_STATUSES.map(st => `<option${caseObj.status===st?' selected':''}>${st}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="case-detail-label-row">
            <div>
              <span class="case-detail-label">Title</span>
              <input type="text" id="edit-case-title" value="${caseObj.title}" required style="width:180px;" />
            </div>
            <div>
              <span class="case-detail-label">Total Items</span>
              <input type="number" id="edit-case-items" value="${caseObj.items||''}" min="0" style="width:80px;" />
            </div>
          </div>
          <div class="case-detail-section-title">Client Information</div>
          <div class="case-detail-label-row">
            <div>
              <span class="case-detail-label">Client Name</span>
              <input type="text" id="edit-case-client" value="${caseObj.client}" required style="width:180px;" />
            </div>
            <div>
              <span class="case-detail-label">Contact</span>
              <input type="text" id="edit-case-contact" value="${caseObj.contact||''}" style="width:180px;" />
            </div>
          </div>
          <div class="case-detail-section-title">Important Dates</div>
          <div class="case-detail-label-row">
            <div>
              <span class="case-detail-label">Received Date</span>
              <input type="date" id="edit-case-received" value="${toISODate(caseObj.received)}" style="width:140px;" />
            </div>
            <div>
              <span class="case-detail-label">Expected Auction Date</span>
              <input type="date" id="edit-case-auction" value="${toISODate(caseObj.auction)}" style="width:140px;" />
            </div>
          </div>
          <div class="case-detail-section-title">Description</div>
          <textarea id="edit-case-description" rows="2" style="width:100%;">${caseObj.description||''}</textarea>
          <div class="case-detail-section-title">Notes</div>
          <textarea id="edit-case-notes" rows="2" style="width:100%;">${caseObj.notes||''}</textarea>
          <div class="case-detail-section-title">Items in This Case</div>
          <div id="edit-case-items-list">
            ${(caseObj.itemsList||[]).map((item,idx) => `
              <div class="case-detail-item-row" data-itemidx="${idx}">
                <input type="text" class="edit-item-name" value="${item.name||''}" placeholder="Item Name" style="width:130px;" />
                <input type="text" class="edit-item-meta" value="${item.meta||''}" placeholder="Meta" style="width:120px;" />
                <input type="text" class="edit-item-value" value="${item.value||''}" placeholder="Value" style="width:70px;" />
                <input type="text" class="edit-item-status" value="${item.status||''}" placeholder="Status" style="width:90px;" />
                <button type="button" class="edit-item-remove-btn" title="Remove" style="color:#c00;">&#128465;</button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="edit-item-add-btn" style="margin-top:8px;">+ Add Item</button>
          <div class="case-detail-modal-actions" style="margin-top:20px;">
            <button class="primary-btn" type="submit">Save</button>
            <button class="detail-modal-secondary-btn" type="button" id="case-detail-edit-close-btn2">Cancel</button>
          </div>
        </div>
        <div class="case-detail-side">
          <div class="case-detail-summary-card">
            <div class="case-detail-summary-label">Value Summary</div>
            <div class="case-detail-summary-row">
              <span>Estimated Total:</span>
              <input type="text" id="edit-case-value" value="${caseObj.value||''}" style="width:70px;"/>
            </div>
            <div class="case-detail-summary-row">
              <span>Items Count:</span>
              <span id="edit-case-side-items-count">${caseObj.items || (caseObj.itemsList ? caseObj.itemsList.length : 0)}</span>
            </div>
            <div class="case-detail-summary-row">
              <span>Avg. per Item:</span>
              <span id="edit-case-side-avg-value">
                £${getAvgPerItem(caseObj.value, caseObj.items || (caseObj.itemsList ? caseObj.itemsList.length : 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  `;

  // Remove item handler
  modal.querySelectorAll('.edit-item-remove-btn').forEach(btn => {
    btn.onclick = function() {
      btn.parentElement.remove();
      updateItemsSummary();
    };
  });

  // Add item handler
  modal.querySelector('#edit-item-add-btn').onclick = function() {
    const itemsDiv = modal.querySelector('#edit-case-items-list');
    const idx = itemsDiv.children.length;
    const div = document.createElement('div');
    div.className = "case-detail-item-row";
    div.innerHTML = `
      <input type="text" class="edit-item-name" placeholder="Item Name" style="width:130px;" />
      <input type="text" class="edit-item-meta" placeholder="Meta" style="width:120px;" />
      <input type="text" class="edit-item-value" placeholder="Value" style="width:70px;" />
      <input type="text" class="edit-item-status" placeholder="Status" style="width:90px;" />
      <button type="button" class="edit-item-remove-btn" title="Remove" style="color:#c00;">&#128465;</button>
    `;
    itemsDiv.appendChild(div);
    div.querySelector('.edit-item-remove-btn').onclick = function() {
      div.remove();
      updateItemsSummary();
    };
    updateItemsSummary();
  };

  // Live update items count and avg per item in summary
  function updateItemsSummary() {
    const itemsDiv = modal.querySelector('#edit-case-items-list');
    const itemCount = itemsDiv.querySelectorAll('.case-detail-item-row').length;
    modal.querySelector('#edit-case-side-items-count').textContent = itemCount;
    const value = modal.querySelector('#edit-case-value').value.replace(/[^\d.]/g, "");
    modal.querySelector('#edit-case-side-avg-value').textContent =
      "£" + getAvgPerItem(value, itemCount);
  }

  // On value or items change, update summary
  modal.querySelector('#edit-case-value').oninput = updateItemsSummary;
  modal.querySelector('#edit-case-items-list').oninput = updateItemsSummary;

  // Close modal logic
  modal.querySelector('#case-detail-edit-close-btn').onclick =
  modal.querySelector('#case-detail-edit-close-btn2').onclick = function () {
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
  };

  // Form submission logic
  modal.querySelector('#case-detail-edit-form').onsubmit = function(e) {
    e.preventDefault();
    // Validate and update case
    const newCaseNumber = modal.querySelector('#edit-case-id').value.trim();
    if (!newCaseNumber) return alert("Case Number required");
    const newTitle = modal.querySelector('#edit-case-title').value.trim();
    if (!newTitle) return alert("Title required");
    const newClient = modal.querySelector('#edit-case-client').value.trim();
    if (!newClient) return alert("Client Name required");
    const newValue = modal.querySelector('#edit-case-value').value.trim();

    // Collect items
    const itemsDiv = modal.querySelector('#edit-case-items-list');
    const itemsList = [];
    itemsDiv.querySelectorAll('.case-detail-item-row').forEach(row => {
      const name = row.querySelector('.edit-item-name').value.trim();
      const meta = row.querySelector('.edit-item-meta').value.trim();
      const value = row.querySelector('.edit-item-value').value.trim();
      const status = row.querySelector('.edit-item-status').value.trim();
      if (name) itemsList.push({ name, meta, value, status });
    });

    // Update in casesData
    casesData[idx] = {
      id: newCaseNumber,
      title: newTitle,
      status: modal.querySelector('#edit-case-status').value,
      client: newClient,
      contact: modal.querySelector('#edit-case-contact').value.trim(),
      received: fromISODate(modal.querySelector('#edit-case-received').value),
      auction: fromISODate(modal.querySelector('#edit-case-auction').value),
      items: parseInt(modal.querySelector('#edit-case-items').value) || itemsList.length,
      value: newValue,
      description: modal.querySelector('#edit-case-description').value.trim(),
      notes: modal.querySelector('#edit-case-notes').value.trim(),
      itemsList
    };
    saveCases();
    alert("Case updated!");
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
    renderCases(casesData);
  };
}

// Helpers for date
function toISODate(str) {
  if (!str) return "";
  if (str.includes("-")) return str;
  if (str.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [d, m, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}
function fromISODate(str) {
  if (!str) return "";
  if (str.includes("/")) return str;
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }
  return str;
}
function getAvgPerItem(value, count) {
  value = value ? Number(String(value).replace(/[^\d.]/g,'')) : 0;
  count = parseInt(count) || 0;
  return count ? Math.round(value/count) : 0;
}

// === Case Details Modal Logic (read-only view) ===
function showCaseDetailModal(caseObj) {
  const modalBackdrop = document.getElementById('case-detail-modal-backdrop');
  const modal = document.getElementById('case-detail-modal');
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

  const totalValue = caseObj.value || "£0";
  const itemCount = caseObj.items || (caseObj.itemsList ? caseObj.itemsList.length : 0);
  let avgPerItem = getAvgPerItem(totalValue, itemCount);

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
            <span class="case-detail-summary-val">£${avgPerItem}</span>
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
    const idx = casesData.findIndex(c => c.id === caseObj.id);
    openCaseEditModal(caseObj, idx);
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  loadCases();
  populateStatusFilter();
  renderCases(casesData);
  setupCaseListeners();
  setupCaseModal();
});
