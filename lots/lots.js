// === Persistent storage key ===
const LOTS_KEY = "aw_lots_data";

// === Mock Data for Lots ===
const mockLots = [
  {
    number: "LOT-001",
    auction: "February Auction",
    auctionDate: "2025-02-15",
    auctionTime: "12:00",
    auctionType: "Timed",
    status: "Pending",
    reservePrice: "0",
    startingBid: "0",
    allowAbsentee: false,
    privateLot: false,
    description: "Antique vase in good condition.",
    notes: "Needs authentication.",
    selectedItems: []
  }
];

// === LocalStorage load/save logic ===
function loadLots() {
  let lots = [];
  const local = localStorage.getItem(LOTS_KEY);
  if (local) {
    try { lots = JSON.parse(local); }
    catch { lots = JSON.parse(JSON.stringify(mockLots)); }
  } else {
    lots = JSON.parse(JSON.stringify(mockLots));
  }
  return lots;
}
function saveLots(lots) {
  localStorage.setItem(LOTS_KEY, JSON.stringify(lots));
}

// === Render Lots Grid ===
function renderLots(lots) {
  const grid = document.getElementById("lots-grid");
  grid.innerHTML = "";
  if (!lots || lots.length === 0) {
    document.getElementById("lots-empty").style.display = "";
    document.getElementById("lots-results-count").textContent = `Showing 0 of 0 lots`;
    return;
  }
  document.getElementById("lots-empty").style.display = "none";
  document.getElementById("lots-results-count").textContent = `Showing ${lots.length} of ${lots.length} lots`;
  lots.forEach((l, idx) => {
    const card = document.createElement("div");
    card.className = "lots-card";
    card.innerHTML = `
      <div class="lots-card-title-row">
        <div class="lots-card-title">${l.number}</div>
        <span class="lots-card-status-badge ${l.status ? l.status.toLowerCase() : ''}">${l.status || ""}</span>
      </div>
      <div class="lots-card-meta">
        <div class="lots-card-meta-row">
          <span class="lots-card-meta-label">Auction:</span>
          <span class="lots-card-meta-val bold">${l.auction || ""}</span>
        </div>
        <div class="lots-card-meta-row">
          <span class="lots-card-meta-label">Date:</span>
          <span class="lots-card-meta-val">${l.auctionDate || ""} ${l.auctionTime || ""}</span>
        </div>
        <div class="lots-card-meta-row">
          <span class="lots-card-meta-label">Type:</span>
          <span class="lots-card-meta-val">${l.auctionType || ""}</span>
        </div>
      </div>
      <div class="lots-card-desc">${l.description || ""}</div>
      <div class="lots-card-actions">
        <button class="lots-card-edit-btn" data-index="${idx}" title="Edit">&#9998; Edit</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.lots-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openEditLotModal(idx);
    };
  });
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
  document.getElementById('auction-date').value = "";
  document.getElementById('auction-time').value = "";
  document.getElementById('auction-type').value = "";
  document.getElementById('lot-status').value = "";
  document.getElementById('reserve-price').value = "";
  document.getElementById('starting-bid').value = "";
  document.getElementById('allow-absentee').checked = false;
  document.getElementById('private-lot').checked = false;
  document.getElementById('lot-desc').value = "";
  document.getElementById('lot-notes').value = "";

  // Populate selected items with quantity fields
  const itemsListDiv = document.getElementById("selected-items-list");
  if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
    itemsListDiv.innerHTML = selectedItems.map((item, idx) => `
      <div style="margin-bottom:6px;">
        <span>${item.name || 'Unnamed Item'} (${item.barcode || 'no barcode'})</span>
        <input type="number" min="1" value="1" id="item-qty-${idx}" style="width:50px; margin-left:10px;" required>
      </div>
    `).join('');
    itemsListDiv.style.display = "";
  } else {
    itemsListDiv.innerHTML = "";
    itemsListDiv.style.display = "none";
  }

  // Remove previous submit
  const form = document.getElementById("lots-modal-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    let lots = loadLots();

    let newLot = {
      number: document.getElementById('lot-number').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      auctionDate: document.getElementById('auction-date').value.trim(),
      auctionTime: document.getElementById('auction-time').value.trim(),
      auctionType: document.getElementById('auction-type').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      reservePrice: document.getElementById('reserve-price').value,
      startingBid: document.getElementById('starting-bid').value,
      allowAbsentee: document.getElementById('allow-absentee').checked,
      privateLot: document.getElementById('private-lot').checked,
      description: document.getElementById('lot-desc').value.trim(),
      notes: document.getElementById('lot-notes').value.trim(),
      selectedItems: []
    };

    if (selectedItems && Array.isArray(selectedItems)) {
      newLot.selectedItems = selectedItems.map((item, idx) => ({
        ...item,
        quantity: parseInt(document.getElementById(`item-qty-${idx}`).value, 10) || 1
      }));
    }

    lots.push(newLot);
    saveLots(lots);
    renderLots(lots);
    closeLotsModal();
    alert("Lot added!");
    sessionStorage.removeItem("selectedLotItems");
  };
}

function closeLotsModal() {
  document.body.style.overflow = "";
  document.body.style.marginRight = "";
  document.getElementById('lots-modal-backdrop').style.display = "none";
  sessionStorage.removeItem("selectedLotItems");
}

// === Edit Modal Logic (for completeness, edit in-place and save all lots) ===
function openEditLotModal(idx) {
  let lots = loadLots();
  const lotObj = lots[idx];
  if (!lotObj) return;
  const modalBackdrop = document.getElementById('lots-modal-backdrop');
  const modal = document.querySelector('.lots-modal');
  modal.querySelector('.lots-modal-title').textContent = "Edit Lot";
  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.body.style.marginRight = (window.innerWidth - document.documentElement.clientWidth) > 0 ? `${window.innerWidth - document.documentElement.clientWidth}px` : "";

  // Pre-fill form fields
  document.getElementById('lot-number').value = lotObj.number || "";
  document.getElementById('lot-auction').value = lotObj.auction || "";
  document.getElementById('auction-date').value = lotObj.auctionDate || "";
  document.getElementById('auction-time').value = lotObj.auctionTime || "";
  document.getElementById('auction-type').value = lotObj.auctionType || "";
  document.getElementById('lot-status').value = lotObj.status || "";
  document.getElementById('reserve-price').value = lotObj.reservePrice || "";
  document.getElementById('starting-bid').value = lotObj.startingBid || "";
  document.getElementById('allow-absentee').checked = !!lotObj.allowAbsentee;
  document.getElementById('private-lot').checked = !!lotObj.privateLot;
  document.getElementById('lot-desc').value = lotObj.description || "";
  document.getElementById('lot-notes').value = lotObj.notes || "";

  // Prepopulate selected items & quantities if present
  const itemsListDiv = document.getElementById("selected-items-list");
  if (lotObj.selectedItems && lotObj.selectedItems.length > 0) {
    itemsListDiv.innerHTML = lotObj.selectedItems.map((item, idx) => `
      <div style="margin-bottom:6px;">
        <span>${item.name || 'Unnamed Item'} (${item.barcode || 'no barcode'})</span>
        <input type="number" min="1" value="${item.quantity || 1}" id="item-qty-${idx}" style="width:50px; margin-left:10px;" required>
      </div>
    `).join('');
    itemsListDiv.style.display = "";
  } else {
    itemsListDiv.innerHTML = "";
    itemsListDiv.style.display = "none";
  }

  // Remove previous submit
  const form = document.getElementById("lots-modal-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    let lots = loadLots();

    lots[idx] = {
      number: document.getElementById('lot-number').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      auctionDate: document.getElementById('auction-date').value.trim(),
      auctionTime: document.getElementById('auction-time').value.trim(),
      auctionType: document.getElementById('auction-type').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      reservePrice: document.getElementById('reserve-price').value,
      startingBid: document.getElementById('starting-bid').value,
      allowAbsentee: document.getElementById('allow-absentee').checked,
      privateLot: document.getElementById('private-lot').checked,
      description: document.getElementById('lot-desc').value.trim(),
      notes: document.getElementById('lot-notes').value.trim(),
      selectedItems: []
    };

    if (lotObj.selectedItems && Array.isArray(lotObj.selectedItems)) {
      lots[idx].selectedItems = lotObj.selectedItems.map((item, iidx) => ({
        ...item,
        quantity: parseInt(document.getElementById(`item-qty-${iidx}`).value, 10) || 1
      }));
    }

    saveLots(lots);
    renderLots(lots);
    closeLotsModal();
    alert("Lot updated!");
  };
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  const lots = loadLots();
  renderLots(lots);

  document.getElementById("lots-new-btn").onclick = function() {
    openLotsModal();
  };
  document.getElementById("lots-modal-close-btn").onclick =
    document.getElementById("lots-modal-cancel-btn").onclick = closeLotsModal;

  // Default modal submit for Add New (called by openLotsModal, not needed here)
  document.getElementById("lots-modal-form").onsubmit = function(e) {
    e.preventDefault();
  };

  // Show modal if coming from Inventory tab with selection
  const selected = sessionStorage.getItem("selectedLotItems");
  if (selected && selected !== "[]" && selected !== "") {
    try {
      const selectedItems = JSON.parse(selected);
      if (Array.isArray(selectedItems) && selectedItems.length > 0) {
        openLotsModal(selectedItems);
      }
    } catch (e) {
      sessionStorage.removeItem("selectedLotItems");
    }
  }
});
