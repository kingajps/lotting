// === Persistent storage key ===
const ITEMS_KEY = "aw_inventory_data";
const ITEMS_KEY = "inventoryItems";

// === Allowed dropdown lists ===
const CATEGORY_LIST = [
  "Vehicles",
  "Food & Bev",
  "Industrial",
  "Farm Equipment",
  "Metalworking",
  "Construction",
  "Woodworking",
  "Electronics",
  "Other"
];
const CONDITION_LIST = [
  "Good",
  "Like New",
  "Fair",
  "Poor"
];
const STATUS_LIST = [
  "Received",
  "Catalogued",
  "Photographed",
  "Listed",
  "Sold",
  "Awaiting Lotting"
];

// === Case list from cases tab ===
function getCaseList() {
  try {
    const cases = JSON.parse(localStorage.getItem("aw_cases_data")) || [];
    return Array.isArray(cases) ? cases : [];
  } catch {
    return [];
  }
}

// === Mock Data for Items ===
const mockInventory = [
  {
    name: "Dell Laptop",
    brand: "Dell",
    model: "Inspiron 15 3000",
    year: 2020,
    desc: "Dell Inspiron 15 3000, Intel i5, 8GB RAM, 256GB SSD, Windows 11 Home.",
    details: "A reliable laptop for work or study.",
    barcode: "987654321098",
    status: "Photographed",
    condition: "Like New",
    value: "£320",
    estimatedValue: 320,
    category: "Electronics",
    location: "U32-ELEC-A1",
    unit: "Unit 32",
    case: "CASE-2024-002",
    loggedBy: "Sarah Johnson",
    loggedAt: "15/01/2024, 10:05:00",
    dims: { length: "35.8cm", width: "24.9cm", height: "2.0cm", weight: "1.9kg" },
    notes: "General good condition, some scuffs on the lid."
  },
  {
    name: "iPad Air",
    brand: "Apple",
    model: "iPad Air (4th generation)",
    year: 2021,
    desc: "Apple iPad Air with 64GB storage, Wi-Fi model in Space Grey",
    details: "Apple iPad Air with 64GB storage, Wi-Fi model in Space Grey",
    barcode: "456789123456",
    status: "Listed",
    condition: "Good",
    value: "£160",
    estimatedValue: 160,
    category: "Electronics",
    location: "U32-ELEC-A1",
    unit: "Unit 32",
    case: "CASE-2024-002",
    loggedBy: "Sarah Johnson",
    loggedAt: "18/01/2024, 11:30:00",
    dims: { length: "24.8cm", width: "17.8cm", height: "0.6cm", weight: "0.46kg" },
    notes: "Screen protector applied, minor wear on corners."
  },
  {
    name: "Oak Dining Chairs (Set of 6)",
    brand: "Heritage Furniture",
    model: "Classic Oak",
    year: 2017,
    desc: "Set of 6 oak dining chairs, classic design.",
    details: "Beautiful set of 6 Heritage oak dining chairs in excellent condition.",
    barcode: "123456789012",
    status: "Catalogued",
    condition: "Good",
    value: "£230",
    estimatedValue: 230,
    category: "Furniture",
    location: "U32-FURN-B1",
    unit: "Unit 32",
    case: "CASE-2024-001",
    loggedBy: "Tom Baker",
    loggedAt: "10/01/2024, 15:20:00",
    dims: { length: "104cm", width: "44cm", height: "48cm", weight: "15kg" },
    notes: "No major marks or scratches."
  },
  {
    name: "Oak Dining Table",
    brand: "Heritage Furniture",
    model: "Classic Oak",
    year: 2017,
    desc: "Heritage Furniture Classic Oak dining table.",
    details: "Solid oak dining table with minor cosmetic marks.",
    barcode: "123456789012",
    status: "Catalogued",
    condition: "Good",
    value: "£420",
    estimatedValue: 420,
    category: "Furniture",
    location: "U32-FURN-B1",
    unit: "Unit 32",
    case: "CASE-2024-001",
    loggedBy: "Tom Baker",
    loggedAt: "10/01/2024, 15:22:00",
    dims: { length: "180cm", width: "90cm", height: "75cm", weight: "38kg" },
    notes: "Some scratches and small dents on tabletop."
  }
];

// === LocalStorage load/save logic ===

function getInventory() {
  let items = [];
  let localA = localStorage.getItem(ITEMS_KEY);
  let localB = localStorage.getItem("inventory");
  if (localA) {
    try { items = JSON.parse(localA); }
    catch { items = []; }
  }
  if ((!items || items.length === 0) && localB) {
    try { items = JSON.parse(localB); }
    catch { items = []; }
  }
  if (!items || items.length === 0) {
    items = [];
  }
  return items;
}
function saveInventory(arr) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(arr));
  localStorage.setItem("inventory", JSON.stringify(arr));
}

// === Multi-select State ===
let selectedItems = []; // store array of item IDs (or fallback index if no id)

// === Listen for external inventory changes (e.g., from barcode tab) ===
window.addEventListener("storage", function(event) {
  if (event.key === ITEMS_KEY || event.key === "inventory") {
    populateFilters();
    renderItems();
  }
});

// === Render Items Grid ===
function renderItems(filteredItems = null) {
  const allItems = getInventory();
  const items = Array.isArray(filteredItems) ? filteredItems : allItems;
  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";
  if (items.length === 0) {
    document.getElementById("inventory-empty").style.display = "";
    document.getElementById("inventory-results-count").textContent = `Showing 0 of ${allItems.length} items`;
    updateNewLotBtn();
    return;
  }
  document.getElementById("inventory-empty").style.display = "none";
  document.getElementById("inventory-results-count").textContent = `Showing ${items.length} of ${allItems.length} items`;
  items.forEach((i, idx) => {
    // Ensure unique ID
    if (!i.id) {
      i.id = "inv-" + (i.barcode || idx + "-" + Date.now());
      saveInventory(allItems);
    }

    const card = document.createElement("div");
    card.className = "inventory-card";
    card.innerHTML = `
      <input type="checkbox" class="inventory-select-checkbox" data-id="${i.id}" style="position:absolute;left:10px;top:10px;z-index:2;">
      <div class="inventory-card-header">
        <span class="inventory-card-icon">🗃️</span>
      </div>
      <div class="inventory-card-main">
        <div class="inventory-card-title">${i.name}</div>
        <div class="inventory-card-desc">${i.model || i.desc}</div>
        <div class="inventory-card-barcode">${i.barcode}</div>
        <div class="inventory-card-row">
          <span class="inventory-card-status ${i.status?.toLowerCase()}">${i.status}</span>
          <span class="inventory-card-condition">${i.condition}</span>
        </div>
        <div class="inventory-card-row">
          <span class="inventory-card-value">${i.value}</span>
          <span class="inventory-card-category">${i.category}</span>
        </div>
        <div class="inventory-card-row">
          <span class="inventory-card-location">📍 ${i.location}</span>
          <span class="inventory-card-case">#${i.case}</span>
        </div>
      </div>
      <div class="inventory-card-actions">
        <button class="inventory-card-view-btn" title="View" data-index="${idx}">View</button>
        <button class="inventory-card-actions-btn inventory-card-edit-btn" title="Edit" data-index="${idx}">&#9998;</button>
        <button class="inventory-card-actions-btn" title="Delete" data-index="${idx}">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach select-checkbox listeners
  document.querySelectorAll('.inventory-select-checkbox').forEach(checkbox => {
    const id = checkbox.getAttribute("data-id");
    checkbox.checked = selectedItems.includes(id);
    checkbox.onchange = function() {
      if (checkbox.checked) {
        if (!selectedItems.includes(id)) selectedItems.push(id);
      } else {
        selectedItems = selectedItems.filter(selId => selId !== id);
      }
      updateNewLotBtn();
    };
  });

  // Attach view button listeners
  document.querySelectorAll('.inventory-card-view-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      const allItems = getInventory();
      showDetailModal(allItems[idx]);
    };
  });

  // Attach edit button listeners
  document.querySelectorAll('.inventory-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      const allItems = getInventory();
      openInventoryEditModal(allItems[idx], idx);
    };
  });

  // Attach delete button listeners
  document.querySelectorAll('.inventory-card-actions-btn[title="Delete"]').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      if (confirm("Are you sure you want to delete this item?")) {
        let allItems = getInventory();
        allItems.splice(idx, 1);
        saveInventory(allItems);
        renderItems();
      }
    };
  });

  updateNewLotBtn();
}

// === New Lot button logic ===
const newLotBtn = document.getElementById("inventory-new-lot-btn");
function updateNewLotBtn() {
  if (!newLotBtn) return;
  newLotBtn.disabled = selectedItems.length === 0;
}

// === On "+ New Lot" Click: Store selection and redirect ===
if (newLotBtn) {
  newLotBtn.addEventListener("click", function () {
    if (selectedItems.length === 0) return;
    const allItems = getInventory();
    const selectedInventory = allItems.filter(item => selectedItems.includes(item.id));
    sessionStorage.setItem("selectedLotItems", JSON.stringify(selectedInventory));
    // Redirect to lots tab
    window.location.href = "/lotting/lots/lots.html";
  });
}

// === Initialization ===
document.addEventListener("DOMContentLoaded", function () {
  renderItems();

  // Listen for custom inventory updates (from barcode tab etc.)
  window.addEventListener("inventory-updated", renderItems);

  // Listen for storage changes from other tabs
  window.addEventListener("storage", function (event) {
    if (event.key === "inventory" || event.key === ITEMS_KEY) renderItems();
  });
}); // <--- Don't forget this!

// === Populate Filters ===
function populateFilters() {
  const allItems = getInventory();
  // Categories
  const catSet = Array.from(new Set(allItems.map(i => i.category)));
  const catSelect = document.getElementById("inventory-category-filter");
  catSelect.innerHTML = `<option value="">All Categories</option>`;
  catSet.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });
  // Statuses
  const statusSet = Array.from(new Set(allItems.map(i => i.status)));
  const statSelect = document.getElementById("inventory-status-filter");
  statSelect.innerHTML = `<option value="">All Statuses</option>`;
  statusSet.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statSelect.appendChild(opt);
  });
  // Cases
  const caseSet = Array.from(new Set(allItems.map(i => i.case)));
  const caseSelect = document.getElementById("inventory-case-filter");
  caseSelect.innerHTML = `<option value="">All Cases</option>`;
  caseSet.forEach(cs => {
    const opt = document.createElement("option");
    opt.value = cs;
    opt.textContent = cs;
    caseSelect.appendChild(opt);
  });
}

// === Filter/Search/Sort Logic ===
function applyFilters() {
  const allItems = getInventory(); // Always work from fresh data
  let filtered = [...allItems];
  const search = document.getElementById("inventory-search").value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(i =>
      (i.name && i.name.toLowerCase().includes(search)) ||
      (i.model && i.model.toLowerCase().includes(search)) ||
      (i.desc && i.desc.toLowerCase().includes(search)) ||
      (i.barcode && i.barcode.toLowerCase().includes(search))
    );
  }
  const cat = document.getElementById("inventory-category-filter").value;
  if (cat) filtered = filtered.filter(i => i.category === cat);
  const stat = document.getElementById("inventory-status-filter").value;
  if (stat) filtered = filtered.filter(i => i.status === stat);
  const cs = document.getElementById("inventory-case-filter").value;
  if (cs) filtered = filtered.filter(i => i.case === cs);
  const sort = document.getElementById("inventory-sort-filter").value;
  if (sort === "name-az") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-za") filtered.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "value-high") filtered.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
  if (sort === "value-low") filtered.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
  renderItems(filtered);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("inventory-search").addEventListener("input", applyFilters);
  document.getElementById("inventory-category-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-status-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-case-filter").addEventListener("change", applyFilters);
  document.getElementById("inventory-sort-filter").addEventListener("change", applyFilters);
}

// === Modal logic for + Add New Item ===
function openInventoryModal() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

  // Populate dropdowns with fixed lists (category, condition, status, cases)
  const catSel = document.getElementById("item-category");
  catSel.innerHTML = `<option value="">Select Category</option>`;
  CATEGORY_LIST.forEach(c => { catSel.innerHTML += `<option value="${c}">${c}</option>`; });

  const condSel = document.getElementById("item-condition");
  condSel.innerHTML = `<option value="">Select Condition</option>`;
  CONDITION_LIST.forEach(c => { condSel.innerHTML += `<option value="${c}">${c}</option>`; });

  let statusSel = document.getElementById("item-status");
  if (!statusSel) {
    // Add status dropdown if not present (for compatibility)
    const row = document.querySelector("#inventory-modal-form .inventory-modal-row:last-of-type");
    statusSel = document.createElement("select");
    statusSel.id = "item-status";
    statusSel.required = true;
    row.appendChild(statusSel);
  }
  statusSel.innerHTML = `<option value="">Select Status</option>`;
  STATUS_LIST.forEach(s => { statusSel.innerHTML += `<option value="${s}">${s}</option>`; });

  // Cases dropdown (live list from cases)
  const caseSel = document.getElementById("item-case");
  caseSel.innerHTML = `<option value="">Select Case</option>`;
  getCaseList().forEach(cs => {
    caseSel.innerHTML += `<option value="${cs.id}">${cs.id} - ${cs.title}</option>`;
  });

  // Location dropdown (always use fresh inventory)
  const allItems = getInventory();
  const locs = Array.from(new Set(allItems.map(i => i.location).filter(lc => lc && lc.trim())));
  const locSel = document.getElementById("item-location");
  locSel.innerHTML = `<option value="">Select Location</option>`;
  locs.forEach(lc => { locSel.innerHTML += `<option value="${lc}">${lc}</option>`; });

  // Value field: auto-add £ and update value string
  const valField = document.getElementById("item-value");
  const valueStrField = document.getElementById("item-value-str");
  if (valField && valueStrField) {
    valField.addEventListener("input", function() {
      let val = valField.value.replace(/[^0-9.]/g, "");
      valField.value = val;
      valueStrField.value = "£" + val;
    });
  }

  // Dimensions fields: force cm/kg
  ["item-length","item-width","item-height","item-weight"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", function() {
        if (id !== "item-weight") {
          if (el.value && !el.value.endsWith("cm")) el.value = el.value.replace(/cm$/,"") + "cm";
        } else {
          if (el.value && !el.value.endsWith("kg")) el.value = el.value.replace(/kg$/,"") + "kg";
        }
      });
    }
  });

  // Prefill loggedBy and loggedAt fields with current user and date/time
  const loggedByField = document.getElementById("item-loggedby");
  if (loggedByField) {
    loggedByField.value = sessionStorage.getItem("aw_logged_in_username") || "kingajps";
  }
  const loggedAtField = document.getElementById("item-loggedat");
  if (loggedAtField) {
    loggedAtField.value = (new Date()).toLocaleString();
  }

  document.getElementById("inventory-modal-backdrop").style.display = "flex";
  document.getElementById("inventory-modal").scrollTop = 0; // Scroll to top when opened
}

function closeInventoryModal() {
  document.body.style.overflow = "";
  document.body.style.marginRight = "";
  document.getElementById("inventory-modal-backdrop").style.display = "none";
}

// === Inventory Edit Modal Logic ===
function openInventoryEditModal(itemObj, idx) {
  const modalBackdrop = document.getElementById('inventory-detail-modal-backdrop');
  let modal = document.getElementById('inventory-detail-modal');
  modalBackdrop.style.display = 'flex';
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = (window.innerWidth - document.documentElement.clientWidth) > 0 ? `${window.innerWidth - document.documentElement.clientWidth}px` : "";
  
  modal.innerHTML = `
    <button class="detail-modal-close-btn" id="inventory-edit-close-btn">&times;</button>
    <div class="detail-modal-title">Edit Item</div>
    <form id="inventory-edit-form" autocomplete="off">
      <div class="detail-modal-section-title">Basic Information</div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Name</div>
          <input type="text" id="edit-item-name" value="${itemObj.name||''}" required style="width:170px;">
        </div>
        <div>
          <div class="detail-modal-label">Brand</div>
          <input type="text" id="edit-item-brand" value="${itemObj.brand||''}" style="width:120px;">
        </div>
      </div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Model</div>
          <input type="text" id="edit-item-model" value="${itemObj.model||''}" style="width:170px;">
        </div>
        <div>
          <div class="detail-modal-label">Year</div>
          <input type="number" id="edit-item-year" value="${itemObj.year||''}" style="width:70px;">
        </div>
      </div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Category</div>
          <select id="edit-item-category" style="width:120px;">
            <option value="">Select Category</option>
            ${CATEGORY_LIST.map(c => `<option value="${c}"${itemObj.category===c?" selected":""}>${c}</option>`).join("")}
          </select>
        </div>
        <div>
          <div class="detail-modal-label">Condition</div>
          <select id="edit-item-condition" style="width:120px;">
            <option value="">Select Condition</option>
            ${CONDITION_LIST.map(c => `<option value="${c}"${itemObj.condition===c?" selected":""}>${c}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Status</div>
          <select id="edit-item-status" style="width:120px;">
            <option value="">Select Status</option>
            ${STATUS_LIST.map(s => `<option value="${s}"${itemObj.status===s?" selected":""}>${s}</option>`).join("")}
          </select>
        </div>
        <div>
          <div class="detail-modal-label">Barcode</div>
          <input type="text" id="edit-item-barcode" value="${itemObj.barcode||''}" style="width:130px;">
        </div>
      </div>
      <div class="detail-modal-section-title">Description</div>
      <textarea id="edit-item-details" rows="2" style="width:100%;">${itemObj.details||itemObj.desc||''}</textarea>
      <div class="detail-modal-section-title">Value</div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Estimated Value (£)</div>
          <input type="number" id="edit-item-value" value="${itemObj.estimatedValue||''}" style="width:90px;">
        </div>
        <div>
          <div class="detail-modal-label">Value (string)</div>
          <input type="text" id="edit-item-value-str" value="${itemObj.value||''}" style="width:90px;">
        </div>
      </div>
      <div class="detail-modal-section-title">Location & Case</div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Storage Location</div>
          <input type="text" id="edit-item-location" value="${itemObj.location||''}" style="width:120px;">
          <div class="detail-modal-label" style="font-size: 0.98em;">Unit</div>
          <input type="text" id="edit-item-unit" value="${itemObj.unit||''}" style="width:110px;">
        </div>
        <div>
          <div class="detail-modal-label">Case</div>
          <select id="edit-item-case" style="width:120px;">
            <option value="">Select Case</option>
            ${getCaseList().map(cs => `<option value="${cs.id}"${itemObj.case===cs.id?" selected":""}>${cs.id} - ${cs.title}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="detail-modal-section-title">Tracking Information</div>
      <div class="detail-modal-row">
        <div>
          <div class="detail-modal-label">Logged By</div>
          <input type="text" id="edit-item-loggedby" value="${itemObj.loggedBy||''}" style="width:120px;">
        </div>
        <div>
          <div class="detail-modal-label">Logged At</div>
          <input type="text" id="edit-item-loggedat" value="${itemObj.loggedAt||''}" style="width:150px;">
        </div>
      </div>
      <div class="detail-modal-section-title">Dimensions</div>
      <div class="detail-modal-dims-row">
        <div>
          <div class="detail-modal-dims-label">Length</div>
          <input type="text" id="edit-item-length" value="${itemObj.dims?.length||''}" style="width:60px;">
        </div>
        <div>
          <div class="detail-modal-dims-label">Width</div>
          <input type="text" id="edit-item-width" value="${itemObj.dims?.width||''}" style="width:60px;">
        </div>
        <div>
          <div class="detail-modal-dims-label">Height</div>
          <input type="text" id="edit-item-height" value="${itemObj.dims?.height||''}" style="width:60px;">
        </div>
        <div>
          <div class="detail-modal-dims-label">Weight</div>
          <input type="text" id="edit-item-weight" value="${itemObj.dims?.weight||''}" style="width:60px;">
        </div>
      </div>
      <div class="detail-modal-section-title">Notes</div>
      <textarea id="edit-item-notes" rows="2" style="width:100%;">${itemObj.notes||''}</textarea>
      <div class="detail-modal-actions" style="margin-top:18px;">
        <button class="primary-btn" type="submit">Save</button>
        <button class="detail-modal-secondary-btn" type="button" id="inventory-edit-close-btn2">Cancel</button>
      </div>
    </form>
  `;

  modal.querySelector('#inventory-edit-close-btn').onclick =
  modal.querySelector('#inventory-edit-close-btn2').onclick = function () {
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
  };

  // Value field: auto-add £ and update value string
  modal.querySelector('#edit-item-value').addEventListener("input", function() {
    let val = modal.querySelector('#edit-item-value').value.replace(/[^0-9.]/g, "");
    modal.querySelector('#edit-item-value').value = val;
    modal.querySelector('#edit-item-value-str').value = "£" + val;
  });
  // Dimensions: force cm/kg
  ["edit-item-length","edit-item-width","edit-item-height","edit-item-weight"].forEach(id => {
    const el = modal.querySelector(`#${id}`);
    if (el) {
      el.addEventListener("blur", function() {
        if (id !== "edit-item-weight") {
          if (el.value && !el.value.endsWith("cm")) el.value = el.value.replace(/cm$/,"") + "cm";
        } else {
          if (el.value && !el.value.endsWith("kg")) el.value = el.value.replace(/kg$/,"") + "kg";
        }
      });
    }
  });

modal.querySelector('#inventory-edit-form').onsubmit = function(e) {
  e.preventDefault();

  // Get the latest inventory from storage
  let allItems = getInventory();

  // Update the item at idx
  allItems[idx] = {
    name: modal.querySelector('#edit-item-name').value.trim(),
    brand: modal.querySelector('#edit-item-brand').value.trim(),
    model: modal.querySelector('#edit-item-model').value.trim(),
    year: modal.querySelector('#edit-item-year').value.trim(),
    category: modal.querySelector('#edit-item-category').value.trim(),
    condition: modal.querySelector('#edit-item-condition').value.trim(),
    status: modal.querySelector('#edit-item-status').value.trim(),
    barcode: modal.querySelector('#edit-item-barcode').value.trim(),
    desc: modal.querySelector('#edit-item-desc').value.trim(),
    details: modal.querySelector('#edit-item-details').value.trim(),
    estimatedValue: parseFloat(modal.querySelector('#edit-item-value').value) || 0,
    value: modal.querySelector('#edit-item-value-str').value.trim(),
    location: modal.querySelector('#edit-item-location').value.trim(),
    unit: modal.querySelector('#edit-item-unit').value.trim(),
    case: modal.querySelector('#edit-item-case').value.trim(),
    loggedBy: modal.querySelector('#edit-item-loggedby').value.trim(),
    loggedAt: modal.querySelector('#edit-item-loggedat').value.trim(),
    dims: {
      length: modal.querySelector('#edit-item-length').value.trim(),
      width: modal.querySelector('#edit-item-width').value.trim(),
      height: modal.querySelector('#edit-item-height').value.trim(),
      weight: modal.querySelector('#edit-item-weight').value.trim()
    },
    notes: modal.querySelector('#edit-item-notes').value.trim()
  };

    // Save the updated inventory back to storage
    saveInventory(allItems);

    alert("Item updated!");
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
    renderItems();
  };

} // <--- This is the missing bracket! Now your function is closed properly.
  
// === Item Details Modal Logic ===
function showDetailModal(item) {
  const modalBackdrop = document.getElementById('inventory-detail-modal-backdrop');
  const modal = document.getElementById('inventory-detail-modal');
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

  modal.innerHTML = `
    <button class="detail-modal-close-btn" id="detail-modal-close-btn">&times;</button>
    <div class="detail-modal-title">Item Details</div>
    <div class="detail-modal-section-title">Basic Information</div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Name</div>
        <div class="detail-modal-value">${item.name || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Brand</div>
        <div class="detail-modal-value">${item.brand || ""}</div>
      </div>
    </div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Model</div>
        <div class="detail-modal-value">${item.model || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Year</div>
        <div class="detail-modal-value">${item.year || ""}</div>
      </div>
    </div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Category</div>
        <div class="detail-modal-value">${item.category || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Condition</div>
        <div class="detail-modal-value condition">${item.condition || ""}</div>
      </div>
    </div>
    <div class="detail-modal-section-title">Description</div>
    <div class="detail-modal-value" style="margin-bottom:10px;">${item.details || item.desc || ""}</div>
    <div class="detail-modal-section-title">Status & Value</div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Status</div>
        <div class="detail-modal-badge ${item.status ? item.status.toLowerCase() : ""}">${item.status || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Estimated Value</div>
        <div class="detail-modal-value estimated-value">£${item.estimatedValue || (item.value ? item.value.replace(/[^\d]/g,'') : "0")}</div>
      </div>
    </div>
    <div class="detail-modal-section-title">Location & Case</div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Storage Location</div>
        <div class="detail-modal-value">${item.location || ""}</div>
        <div class="detail-modal-label" style="font-size: 0.98em;">Unit</div>
        <div class="detail-modal-value">${item.unit || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Case</div>
        <div class="detail-modal-value">${item.case || ""}</div>
      </div>
    </div>
    <div class="detail-modal-section-title">Tracking Information</div>
    <div class="detail-modal-row">
      <div>
        <div class="detail-modal-label">Logged By</div>
        <div class="detail-modal-value">${item.loggedBy || ""}</div>
      </div>
      <div>
        <div class="detail-modal-label">Logged At</div>
        <div class="detail-modal-value">${item.loggedAt || ""}</div>
      </div>
    </div>
    <div class="detail-modal-section-title">Dimensions</div>
    <div class="detail-modal-dims-row">
      <div>
        <div class="detail-modal-dims-label">Length</div>
        <div class="detail-modal-value">${item.dims && item.dims.length ? item.dims.length : ""}</div>
      </div>
      <div>
        <div class="detail-modal-dims-label">Width</div>
        <div class="detail-modal-value">${item.dims && item.dims.width ? item.dims.width : ""}</div>
      </div>
      <div>
        <div class="detail-modal-dims-label">Height</div>
        <div class="detail-modal-value">${item.dims && item.dims.height ? item.dims.height : ""}</div>
      </div>
      <div>
        <div class="detail-modal-dims-label">Weight</div>
        <div class="detail-modal-value">${item.dims && item.dims.weight ? item.dims.weight : ""}</div>
      </div>
    </div>
    <div class="detail-modal-section-title">Notes</div>
    <div class="detail-modal-notes">${item.notes || ""}</div>
    <div class="detail-modal-section-title">Barcode</div>
    <div class="detail-modal-barcode">${item.barcode || ""}</div>
    <div class="detail-modal-actions">
      <button class="primary-btn" title="Edit Item" id="inventory-detail-edit-btn">Edit Item</button>
      <button class="detail-modal-secondary-btn" title="Print Label" id="detail-modal-print-btn">Print Label</button>
      <button class="detail-modal-secondary-btn" id="detail-modal-close-btn2" title="Close">Close</button>
    </div>
  `;
  modalBackdrop.style.display = "flex";

  document.getElementById('detail-modal-close-btn').onclick =
  document.getElementById('detail-modal-close-btn2').onclick = function () {
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
  };

  document.getElementById('inventory-detail-edit-btn').onclick = function () {
    modalBackdrop.style.display = "none";
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    const allItems = getInventory();
    const idx = allItems.findIndex(i => i.name === item.name && i.barcode === item.barcode);
    openInventoryEditModal(item, idx);
  };

  // Print label handler (must be inside this function!)
  document.getElementById('detail-modal-print-btn').onclick = function () {
    generateItemLabelPDF(item);
  };
} // <--- This bracket was missing!


function generateItemLabelPDF(item) {
  // Generate a random string for the QR code (demo)
  const qrValue = "DEMO-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Generate QR code as data URL
  const qr = new QRious({ value: qrValue, size: 128 });
  const qrDataUrl = qr.toDataURL();

  // Create PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [60, 40]
  });

  doc.setFontSize(12);
  doc.text(item.name || "No Name", 5, 10);
  doc.setFontSize(9);
  doc.text("Barcode: " + (item.barcode || ""), 5, 16);
  doc.text("QR: " + qrValue, 5, 22);

  // Add QR image
  doc.addImage(qrDataUrl, "PNG", 30, 5, 25, 25);

  // Draw border
  doc.setLineWidth(0.5);
  doc.rect(2, 2, 56, 36);

  // Download PDF
  doc.save("Label_" + (item.name || "item") + ".pdf");
}
  
// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  populateFilters();
  renderItems();
  setupListeners();

  document.getElementById("inventory-new-btn").onclick = openInventoryModal;
  document.getElementById("inventory-modal-close-btn").onclick = closeInventoryModal;
  document.getElementById("inventory-modal-cancel-btn").onclick = closeInventoryModal;
  document.getElementById("inventory-modal-form").onsubmit = function(e) {
    e.preventDefault();
    const newItem = {
      name: document.getElementById("item-name").value.trim(),
      brand: document.getElementById("item-brand").value.trim(),
      model: document.getElementById("item-model")?.value.trim() || "",
      year: document.getElementById("item-year")?.value.trim() || "",
      desc: document.getElementById("item-desc").value.trim(),
      details: document.getElementById("item-details").value.trim(),
      barcode: "",
      status: document.getElementById("item-status") ? document.getElementById("item-status").value.trim() : "",
      condition: document.getElementById("item-condition").value.trim(),
      value: "£" + (parseFloat(document.getElementById("item-value").value.replace(/^£/, "")) || 0),
      estimatedValue: parseFloat(document.getElementById("item-value").value.replace(/^£/, "")) || 0,
      category: document.getElementById("item-category").value.trim(),
      location: document.getElementById("item-location").value.trim(),
      unit: "",
      case: document.getElementById("item-case").value.trim(),
      loggedBy: document.getElementById("item-loggedby")?.value.trim() || (sessionStorage.getItem("aw_logged_in_username") || "kingajps"),
      loggedAt: document.getElementById("item-loggedat")?.value.trim() || (new Date()).toLocaleString(),
      dims: {
        length: document.getElementById("item-length")?.value ? document.getElementById("item-length").value.replace(/cm$/,"") + "cm" : "",
        width: document.getElementById("item-width")?.value ? document.getElementById("item-width").value.replace(/cm$/,"") + "cm" : "",
        height: document.getElementById("item-height")?.value ? document.getElementById("item-height").value.replace(/cm$/,"") + "cm" : "",
        weight: document.getElementById("item-weight")?.value ? document.getElementById("item-weight").value.replace(/kg$/,"") + "kg" : ""
      },
      notes: document.getElementById("item-notes")?.value.trim() || ""
    };
    let allItems = getInventory();          // Always get fresh array
    allItems.push(newItem);                 // Add new item
    saveInventory(allItems);                // Save back to storage
    renderItems();                          // Refresh grid
    closeInventoryModal();
    alert("Item added!");
  };
});

// Listen for updates from *this tab* (custom event, e.g., from barcode scanner)
window.addEventListener("inventory-updated", function() {
  populateFilters();
  renderItems();
});
