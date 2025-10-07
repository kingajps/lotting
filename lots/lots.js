// === Persistent storage key ===
const LOTS_KEY = "aw_lots_data";

// === Mock Data for Lots ===
const mockLots = [
  {
    number: "LOT-001",
    title: "Sample Lot",
    auction: "February Auction",
    auctionDate: "2025-02-15",
    auctionTime: "12:00",
    auctionType: "Timed",
    status: "Pending",
    hammerTarget: "0",
    reservePrice: "0",
    listed: false,
    published: false,
    allowAbsentee: false,
    privateLot: false,
    description: "Antique vase in good condition.",
    importantInfo: "",
    paymentInfo: "",
    collectionInfo: "",
    auctionLocation: "Manchester",
    contactInfo: "01234 567890, auctions@example.com",
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
        <div class="lots-card-title">${l.number || "(no number)"}</div>
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
        <button class="primary-btn lots-card-view-btn" data-index="${idx}" title="View">View</button>
        <button class="lots-card-actions-btn lots-card-edit-btn" data-index="${idx}" title="Edit">&#9998;</button>
        <button class="lots-card-actions-btn lots-card-delete-btn" data-index="${idx}" title="Delete">&#128465;</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Wire up buttons
  document.querySelectorAll('.lots-card-view-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openLotViewModal(idx);
    };
  });
  document.querySelectorAll('.lots-card-edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      openEditLotModal(idx);
    };
  });
  document.querySelectorAll('.lots-card-delete-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = Number(btn.getAttribute('data-index'));
      if (confirm("Are you sure you want to delete this lot?")) {
        const lots = loadLots();
        lots.splice(idx, 1);
        saveLots(lots);
        renderLots(loadLots());
      }
    };
  });
}

// === Modal Open/Close Logic for Add New Lot + Inventory Lot Modal (with selected items) ===
function openLotsModal(selectedItems = [], editIndex = null) {
  const modalBackdrop = document.getElementById('lots-modal-backdrop');
  const modal = document.querySelector('.lots-modal');
  modal.querySelector('.lots-modal-title').textContent = editIndex == null ? "Add New Lot" : "Edit Lot";

  // Compute scrollbar width BEFORE hiding overflow to prevent layout shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Clear or prefill form fields
  const lots = loadLots();
  const data = editIndex == null ? {} : (lots[editIndex] || {});
  document.getElementById('lot-number').value = data.number || "";
  document.getElementById('lot-title').value = data.title || "";
  document.getElementById('lot-auction').value = data.auction || "";
  document.getElementById('auction-date').value = data.auctionDate || "";
  document.getElementById('auction-time').value = data.auctionTime || "";
  document.getElementById('auction-type').value = data.auctionType || "";
  document.getElementById('lot-status').value = data.status || "";
  document.getElementById('hammer-target').value = data.hammerTarget || "";
  document.getElementById('reserve-price').value = data.reservePrice || "";
  document.getElementById('listed-toggle').checked = !!data.listed;
  document.getElementById('published-toggle').checked = !!data.published;
  document.getElementById('lot-desc').value = data.description || "";
  document.getElementById('important-info').value = data.importantInfo || "";
  document.getElementById('payment-info').value = data.paymentInfo || "";
  document.getElementById('collection-info').value = data.collectionInfo || "";
  document.getElementById('auction-location').value = data.auctionLocation || "";
  document.getElementById('contact-info').value = data.contactInfo || "";

  // Populate available items select
  const availableItems = getUnlottedInventoryItems(editIndex);
  const select = document.getElementById('available-items-select');
  select.innerHTML = "";
  availableItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item.barcode;
    option.textContent = `${item.name} (${item.barcode})`;
    select.appendChild(option);
  });

  // When selection changes, update selected items list
  select.onchange = function() {
    const selectedBarcodes = Array.from(select.selectedOptions).map(opt => opt.value);
    const selectedObjs = availableItems.filter(item => selectedBarcodes.includes(item.barcode));
    renderSelectedItemsList(selectedObjs);
  };

  // Render with initial selectedItems if any (e.g. from inventory tab or editing)
  const initialSelected = editIndex == null
    ? selectedItems
    : (lots[editIndex].selectedItems || []);
  renderSelectedItemsList(initialSelected);

  // Submit handler
  const form = document.getElementById("lots-modal-form");
  form.onsubmit = function(e) {
    e.preventDefault();
    let lots = loadLots();

    // Compose selected items with quantities
    const selectedBarcodes = Array.from(select.selectedOptions).map(opt => opt.value);
    const allSelectedObjs = availableItems.filter(item => selectedBarcodes.includes(item.barcode));
    let finalSelected = allSelectedObjs;
    if (initialSelected && initialSelected.length > 0) {
      const extra = initialSelected.filter(si => !finalSelected.some(ai => ai.barcode === si.barcode));
      finalSelected = finalSelected.concat(extra);
    }
    const lotItemsWithQty = finalSelected.map((item, idx) => ({
      ...item,
      quantity: parseInt(document.getElementById(`item-qty-${idx}`).value, 10) || 1
    }));

    const payload = {
      number: document.getElementById('lot-number').value.trim(),
      title: document.getElementById('lot-title').value.trim(),
      auction: document.getElementById('lot-auction').value.trim(),
      auctionDate: document.getElementById('auction-date').value.trim(),
      auctionTime: document.getElementById('auction-time').value.trim(),
      auctionType: document.getElementById('auction-type').value.trim(),
      status: document.getElementById('lot-status').value.trim(),
      hammerTarget: document.getElementById('hammer-target').value,
      reservePrice: document.getElementById('reserve-price').value,
      listed: document.getElementById('listed-toggle').checked,
      published: document.getElementById('published-toggle').checked,
      description: document.getElementById('lot-desc').value.trim(),
      importantInfo: document.getElementById('important-info').value.trim(),
      paymentInfo: document.getElementById('payment-info').value.trim(),
      collectionInfo: document.getElementById('collection-info').value.trim(),
      auctionLocation: document.getElementById('auction-location').value.trim(),
      contactInfo: document.getElementById('contact-info').value.trim(),
      allowAbsentee: false,
      privateLot: false,
      notes: document.getElementById('lot-notes')?.value?.trim?.() || "",
      selectedItems: lotItemsWithQty
    };

    if (editIndex == null) {
      lots.push(payload);
    } else {
      lots[editIndex] = payload;
    }

    saveLots(lots);
    renderLots(lots);
    closeLotsModal();
    alert(editIndex == null ? "Lot added!" : "Lot updated!");
    sessionStorage.removeItem("selectedLotItems");
  };
}

function renderSelectedItemsList(selectedObjs) {
  const itemsListDiv = document.getElementById("selected-items-list");
  if (selectedObjs && selectedObjs.length > 0) {
    itemsListDiv.innerHTML = selectedObjs.map((item, idx) => `
      <div style="margin-bottom:6px;">
        <span>${item.name || 'Unnamed Item'} (${item.barcode || 'no barcode'})</span>
        <input type="number" min="1" value="${item.quantity || 1}" id="item-qty-${idx}" style="width:50px; margin-left:10px;" required>
      </div>
    `).join('');
    itemsListDiv.style.display = "";
  } else {
    itemsListDiv.innerHTML = "<span style='color:#888'>No items selected for this lot.</span>";
    itemsListDiv.style.display = "";
  }
}

function closeLotsModal() {
  document.body.style.overflow = "";
  document.body.style.marginRight = "";
  document.getElementById('lots-modal-backdrop').style.display = "none";
  sessionStorage.removeItem("selectedLotItems");
}

function getUnlottedInventoryItems(editIndex = null) {
  // Load all items from inventory
  const inventory = JSON.parse(localStorage.getItem("aw_inventory_data") || "[]");
  // Get all item barcodes/IDs already in any lot
  const lots = loadLots();
  const lottedBarcodes = new Set();
  lots.forEach((lot, i) => {
    if (editIndex !== null && i === editIndex) return; // allow items already in this lot when editing
    (lot.selectedItems || []).forEach(item => lottedBarcodes.add(item.barcode));
  });
  // Return only items whose barcode is not in a different lot
  return inventory.filter(item => !lottedBarcodes.has(item.barcode));
}

// === View Modal Logic ===
function openLotViewModal(idx) {
  const lots = loadLots();
  const lotObj = lots[idx];
  if (!lotObj) return;

  const modalBackdrop = document.getElementById('lots-detail-modal-backdrop');
  const modal = document.getElementById('lots-detail-modal');

  // Compute scrollbar width BEFORE hiding overflow to prevent layout shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.marginRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";

  const listedBadge = lotObj.listed ? `<span class="lots-detail-badge">Listed</span>` : `<span class="lots-detail-badge" style="background:#f1f1f1;color:#888;">Not Listed</span>`;
  const publishedBadge = lotObj.published ? `<span class="lots-detail-badge" style="background:#c6f5d9;color:#259e4e;">Published</span>` : `<span class="lots-detail-badge" style="background:#f1f1f1;color:#888;">Not Published</span>`;

  modal.innerHTML = `
    <button class="detail-close-btn" id="lots-detail-close-btn">&times;</button>
    <div class="lots-detail-title">Lot Details</div>

    <div class="lots-detail-section-title">Basic Information</div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Lot Number</div>
      <div class="lots-detail-value">${lotObj.number || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Title</div>
      <div class="lots-detail-value">${lotObj.title || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Description</div>
      <div class="lots-detail-value">${lotObj.description || ""}</div>
    </div>

    <div class="lots-detail-section-title">Auction</div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Type</div>
      <div class="lots-detail-value">${lotObj.auctionType || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Auction</div>
      <div class="lots-detail-value">${lotObj.auction || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Date/Time</div>
      <div class="lots-detail-value">${(lotObj.auctionDate || "")} ${(lotObj.auctionTime || "")}</div>
    </div>

    <div class="lots-detail-section-title">Pricing</div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Hammer Target</div>
      <div class="lots-detail-value">£${lotObj.hammerTarget || "0"}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Reserve Price</div>
      <div class="lots-detail-value">£${lotObj.reservePrice || "0"}</div>
    </div>

    <div class="lots-detail-section-title">Listing</div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Listed</div>
      <div class="lots-detail-value">${listedBadge}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Published</div>
      <div class="lots-detail-value">${publishedBadge}</div>
    </div>

    <div class="lots-detail-section-title">Information</div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Important Info</div>
      <div class="lots-detail-value">${lotObj.importantInfo || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Payment Info</div>
      <div class="lots-detail-value">${lotObj.paymentInfo || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Collection Info</div>
      <div class="lots-detail-value">${lotObj.collectionInfo || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Auction Location</div>
      <div class="lots-detail-value">${lotObj.auctionLocation || ""}</div>
    </div>
    <div class="lots-detail-row">
      <div class="lots-detail-label">Contact Information</div>
      <div class="lots-detail-value">${lotObj.contactInfo || ""}</div>
    </div>

    <div class="lots-detail-actions">
      <button class="primary-btn" id="lot-view-edit-btn">Edit Lot</button>
      <button class="lots-card-actions-btn" id="lot-toggle-listed-btn" title="Toggle Listed">Toggle Listed</button>
      <button class="lots-card-actions-btn" id="lot-toggle-published-btn" title="Toggle Published">Toggle Published</button>
      <button class="lots-card-actions-btn" id="lots-detail-close-btn2">Close</button>
    </div>
  `;

  // Close handlers
  const close = () => {
    document.body.style.overflow = "";
    document.body.style.marginRight = "";
    modalBackdrop.style.display = "none";
  };
  document.getElementById('lots-detail-close-btn').onclick =
  document.getElementById('lots-detail-close-btn2').onclick = close;

  // Edit button from view
  document.getElementById('lot-view-edit-btn').onclick = function() {
    close();
    openEditLotModal(idx);
  };

  // Toggle handlers update the lot and re-render in place
  document.getElementById('lot-toggle-listed-btn').onclick = function() {
    const lots = loadLots();
    lots[idx].listed = !lots[idx].listed;
    saveLots(lots);
    openLotViewModal(idx);
  };
  document.getElementById('lot-toggle-published-btn').onclick = function() {
    const lots = loadLots();
    lots[idx].published = !lots[idx].published;
    saveLots(lots);
    openLotViewModal(idx);
  };
}

// === Edit Modal Logic (reuse Add modal) ===
function openEditLotModal(idx) {
  openLotsModal([], idx);
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  const lots = loadLots();
  renderLots(lots);

  // New Lot
  document.getElementById("lots-new-btn").onclick = function() {
    openLotsModal();
  };
  document.getElementById("lots-modal-close-btn").onclick =
    document.getElementById("lots-modal-cancel-btn").onclick = closeLotsModal;

  // Default modal submit is wired in openLotsModal

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
