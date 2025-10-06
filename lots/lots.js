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
        <button class="lots-card-edit-btn" data-index="${idx}" title="Edit">&#9998; Edit</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.lots-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openEditLotModal(lotsData[idx], idx);
    };
  });
}

// === Edit Modal Logic ===
function openEditLotModal(lotObj, idx) {
  const modalBackdrop = document.getElementById('lots-modal-backdrop');
  const modal = document.querySelector('.lots-modal');
  modal.querySelector('.lots-modal-title').textContent = "Edit Lot";
  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = (window.innerWidth - document.documentElement.clientWidth) > 0 ? `${window.innerWidth - document.documentElement.clientWidth}px` : "";

  // Pre-fill form
  document.getElementById('lot-number').value = lotObj.number || "";
  document.getElementById('lot-auction').value = lotObj.auction || "";
  document.getElementById('lot-status').value = lotObj.status || "";
  document.getElementById('lot-desc').value = lotObj.description || "";
  document.getElementById('lot-notes').value = lotObj.notes || "";

  // Remove previous submit
  const form = document.getElementById("lots-modal-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    // Update existing lot
    lotsData[idx] = {
      number: document.getElementById('lot-number').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      description: document.getElementById('lot-desc').value.trim(),
      notes: document.getElementById('lot-notes').value.trim()
    };
    saveLots();
    renderLots(lotsData);
    closeLotsModal();
    alert("Lot updated!");
  };
}

// === Modal Open/Close Logic for Add New Lot + Inventory Lot Modal (with selected items) ===
function openLotsModal(selectedItems) {
  const modalBackdrop = document.getElementById('lots-modal-backdrop');
  const modal = document.querySelector('.lots-modal');
  modal.querySelector('.lots-modal-title').textContent = "Add New Lot";
  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = (window.innerWidth - document.documentElement.clientWidth) > 0 ? `${window.innerWidth - document.documentElement.clientWidth}px` : "";

  // Clear form fields
  document.getElementById('lot-number').value = "";
  document.getElementById('lot-auction').value = "";
  document.getElementById('lot-status').value = "";
  document.getElementById('lot-desc').value = "";
  document.getElementById('lot-notes').value = "";

  // If items were passed in, populate #selected-items-list
  const itemsListDiv = document.getElementById("selected-items-list");
  if (selectedItems && itemsListDiv) {
    itemsListDiv.innerHTML = selectedItems.map((item, idx) => `
      <div style="margin-bottom:6px;">
        <span>${item.name || 'Unnamed Item'} (${item.barcode || 'no barcode'})</span>
        <input type="number" min="1" value="1" id="item-qty-${idx}" style="width:50px; margin-left:10px;" required>
      </div>
    `).join('');
    itemsListDiv.style.display = "";
  } else if (itemsListDiv) {
    itemsListDiv.innerHTML = "";
    itemsListDiv.style.display = "none";
  }

  // Remove previous submit
  const form = document.getElementById("lots-modal-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    let newLot = {
      number: document.getElementById('lot-number').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      description: document.getElementById('lot-desc').value.trim(),
      notes: document.getElementById('lot-notes').value.trim()
    };
    // Add item quantities if items were passed in
    if (selectedItems && Array.isArray(selectedItems)) {
      newLot.selectedItems = selectedItems.map((item, idx) => ({
        ...item,
        quantity: parseInt(document.getElementById(`item-qty-${idx}`).value, 10) || 1
      }));
    }
    lotsData.push(newLot);
    saveLots();
    renderLots(lotsData);
    closeLotsModal();
    alert("Lot added!");
    // Remove from sessionStorage (so modal doesn't reappear on reload)
    sessionStorage.removeItem("selectedLotItems");
  };
}

function closeLotsModal() {
  document.body.style.overflow = "";
  document.body.style.marginRight = "";
  document.getElementById('lots-modal-backdrop').style.display = "none";
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  loadLots();
  renderLots(lotsData);

  document.getElementById("lots-new-btn").onclick = function() {
    openLotsModal();
  };
  document.getElementById("lots-modal-close-btn").onclick =
    document.getElementById("lots-modal-cancel-btn").onclick = closeLotsModal;

  // Default modal submit for Add New (will be replaced by Edit or custom lots modal)
  document.getElementById("lots-modal-form").onsubmit = function(e) {
    e.preventDefault();
    const newLot = {
      number: document.getElementById('lot-number').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      description: document.getElementById('lot-desc').value.trim(),
      notes: document.getElementById('lot-notes').value.trim()
    };
    lotsData.push(newLot);
    saveLots();
    renderLots(lotsData);
    closeLotsModal();
    alert("Lot added!");
  };

  // === LOTS: Show modal with selected inventory items if coming from Inventory tab ===
  const selected = sessionStorage.getItem("selectedLotItems");
  if (selected) {
    const selectedItems = JSON.parse(selected);
    openLotsModal(selectedItems);
    // Do not remove sessionStorage here - it is removed after successful lot creation
  }
});
