// Barcode Scanner Tab JS (Enhanced with Inventory Modal & LocalStorage Integration, with dropdowns and unit auto-formatting)

const ITEMS_KEY = "aw_inventory_data"; // Match the inventory tab!

// === Utility Functions ===
function getCurrentUser() {
  return sessionStorage.getItem("aw_logged_in_username") || "kingajps";
}
function getCurrentDateTime() {
  return new Date().toLocaleString();
}
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const CATEGORY_LIST = [
  "Vehicles", "Food & Bev", "Industrial", "Farm Equipment", "Metalworking",
  "Construction", "Woodworking", "Electronics", "Other"
];
const CONDITION_LIST = ["Good", "Like New", "Fair", "Poor"];
const STATUS_LIST = [
  "Received", "Catalogued", "Photographed", "Listed", "Sold", "Awaiting Lotting"
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

// === Inventory LocalStorage Helper ===
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

// === Demo item generator ===
function randomDemoItem(barcode) {
  const brands = ["Kodak", "Apple", "Omega", "Ming", "Canon", "Sony", "Dell", "Heritage Furniture"];
  const models = ["Classic", "Pro X", "Model S", "Air (4th gen)", "Vintage", "Elite", "Inspire", "Alpha"];
  const names = ["Vintage Camera", "Gold Watch", "Antique Vase", "iPad Air", "Oak Dining Table", "Silver Spoon"];
  const descs = [
    "A valuable collectible item.",
    "Premium quality and well preserved.",
    "Antique, rare and highly sought after.",
    "Modern, sleek and functional.",
    "Solid wood, classic design."
  ];
  const dims = [
    { length: "25cm", width: "16cm", height: "10cm", weight: "1.5kg" },
    { length: "30cm", width: "20cm", height: "15cm", weight: "2.0kg" },
    { length: "44cm", width: "28cm", height: "12cm", weight: "3.2kg" }
  ];
  return {
    name: randomFrom(names),
    brand: randomFrom(brands),
    model: randomFrom(models),
    year: randomInt(1990, 2024),
    category: randomFrom(CATEGORY_LIST),
    barcode: barcode,
    desc: randomFrom(descs),
    details: "Randomly generated demo details.",
    estimatedValue: randomInt(20, 1000),
    value: "£" + randomInt(20, 1000),
    loggedBy: getCurrentUser(),
    loggedAt: getCurrentDateTime(),
    dims: randomFrom(dims),
    condition: "",
    status: "",
    location: "",
    case: "",
    notes: ""
  };
}

// === Modal Logic ===
function showItemModal(itemData, saveCallback) {
  removeOldModal();

  // Build dropdowns and case list
  const casesList = getCaseList();

  const modal = document.createElement("div");
  modal.className = "inventory-detail-modal modal-open";
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h2 class="modal-title">Add New Inventory Item</h2>
      <form id="item-modal-form" autocomplete="off">
        <div class="modal-form-row">
          <label>Name</label>
          <input type="text" name="name" value="${itemData.name || ""}" required>
        </div>
        <div class="modal-form-row">
          <label>Brand</label>
          <input type="text" name="brand" value="${itemData.brand || ""}">
        </div>
        <div class="modal-form-row">
          <label>Model</label>
          <input type="text" name="model" value="${itemData.model || ""}">
        </div>
        <div class="modal-form-row">
          <label>Year</label>
          <input type="number" name="year" value="${itemData.year || ""}">
        </div>
        <div class="modal-form-row">
          <label>Category</label>
          <select name="category" required>
            <option value="">Select Category</option>
            ${CATEGORY_LIST.map(
              c => `<option value="${c}"${itemData.category === c ? " selected" : ""}>${c}</option>`
            ).join("")}
          </select>
        </div>
        <div class="modal-form-row">
          <label>Condition</label>
          <select name="condition" required>
            <option value="">Select Condition</option>
            ${CONDITION_LIST.map(
              c => `<option value="${c}"${itemData.condition === c ? " selected" : ""}>${c}</option>`
            ).join("")}
          </select>
        </div>
        <div class="modal-form-row">
          <label>Status</label>
          <select name="status" required>
            <option value="">Select Status</option>
            ${STATUS_LIST.map(
              s => `<option value="${s}"${itemData.status === s ? " selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </div>
        <div class="modal-form-row">
          <label>Case</label>
          <select name="case">
            <option value="">Select Case</option>
            ${casesList.map(cs =>
              `<option value="${cs.id}"${itemData.case === cs.id ? " selected" : ""}>${cs.id} - ${cs.title}</option>`
            ).join("")}
          </select>
        </div>
        <div class="modal-form-row">
          <label>Estimated Value (£)</label>
          <input type="text" name="value" id="modal-value" value="${itemData.value ? itemData.value.replace(/^£/, "") : ""}" pattern="^\\d+(\\.\\d{1,2})?$" required>
        </div>
        <div class="modal-form-row">
          <label>Value (string)</label>
          <input type="text" name="valueStr" id="modal-valueStr" value="${itemData.value ? itemData.value : ""}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Dimensions</label>
          <div style="display:flex;gap:5px;align-items:center;">
            <input type="text" name="length" id="modal-length" placeholder="Length" value="${itemData.dims?.length ? itemData.dims.length.replace(/cm$/,"") : ""}" style="width:60px;">cm
            <input type="text" name="width" id="modal-width" placeholder="Width" value="${itemData.dims?.width ? itemData.dims.width.replace(/cm$/,"") : ""}" style="width:60px;">cm
            <input type="text" name="height" id="modal-height" placeholder="Height" value="${itemData.dims?.height ? itemData.dims.height.replace(/cm$/,"") : ""}" style="width:60px;">cm
            <input type="text" name="weight" id="modal-weight" placeholder="Weight" value="${itemData.dims?.weight ? itemData.dims.weight.replace(/kg$/,"") : ""}" style="width:60px;">kg
          </div>
        </div>
        <div class="modal-form-row">
          <label>Description</label>
          <textarea name="desc">${itemData.desc || ""}</textarea>
        </div>
        <div class="modal-form-row">
          <label>Barcode</label>
          <input type="text" name="barcode" value="${itemData.barcode || ""}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Location</label>
          <input type="text" name="location" value="${itemData.location || ""}">
        </div>
        <div class="modal-form-row">
          <label>Logged By</label>
          <input type="text" name="loggedBy" value="${itemData.loggedBy || getCurrentUser()}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Logged At</label>
          <input type="text" name="loggedAt" value="${itemData.loggedAt || getCurrentDateTime()}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Notes</label>
          <textarea name="notes">${itemData.notes || ""}</textarea>
        </div>
        <div class="detail-modal-actions">
          <button type="button" class="detail-modal-secondary-btn" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="primary-btn">Save Item</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Cancel closes and clears modal
  modal.querySelector("#modal-cancel-btn").onclick = function() {
    removeOldModal();
  };

  // Auto-add £ and set valueStr
  const valueInput = modal.querySelector('#modal-value');
  const valueStrInput = modal.querySelector('#modal-valueStr');
  valueInput.addEventListener("input", function() {
    let val = valueInput.value.replace(/[^0-9.]/g, "");
    valueInput.value = val;
    valueStrInput.value = "£" + val;
  });

  // Auto-add units to dimensions fields
  ["length", "width", "height"].forEach(dim => {
    const el = modal.querySelector(`#modal-${dim}`);
    el.addEventListener("blur", function() {
      if (el.value && !el.value.endsWith("cm")) el.value = el.value.replace(/cm$/,"") + "cm";
    });
  });
  const weightEl = modal.querySelector(`#modal-weight`);
  weightEl.addEventListener("blur", function() {
    if (weightEl.value && !weightEl.value.endsWith("kg")) weightEl.value = weightEl.value.replace(/kg$/,"") + "kg";
  });

  // Save
  modal.querySelector("#item-modal-form").onsubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const dims = {
      length: form.length.value ? form.length.value.replace(/cm$/,"") + "cm" : "",
      width: form.width.value ? form.width.value.replace(/cm$/,"") + "cm" : "",
      height: form.height.value ? form.height.value.replace(/cm$/,"") + "cm" : "",
      weight: form.weight.value ? form.weight.value.replace(/kg$/,"") + "kg" : "",
    };
    const item = {
      name: form.name.value,
      brand: form.brand.value,
      model: form.model.value,
      year: Number(form.year.value) || "",
      category: form.category.value,
      condition: form.condition.value,
      status: form.status.value,
      case: form.case.value,
      value: "£" + (parseFloat(form.value.value.replace(/^£/, "")) || 0),
      estimatedValue: parseFloat(form.value.value.replace(/^£/, "")) || 0,
      valueStr: valueStrInput.value,
      dims,
      desc: form.desc.value,
      details: form.desc.value,
      barcode: form.barcode.value,
      notes: form.notes.value,
      location: form.location.value,
      unit: "",
      loggedBy: getCurrentUser(),
      loggedAt: getCurrentDateTime()
    };
    // Save to inventory!
    const inventory = getInventory();
    inventory.push(item);
    saveInventory(inventory);
    window.dispatchEvent(new Event("inventory-updated")); // <-- notify inventory tab to refresh
    if (typeof saveCallback === "function") saveCallback(item);
    removeOldModal();
    alert("Item added to inventory!");
  };
}
function removeOldModal() {
  const old = document.querySelector(".inventory-detail-modal");
  if (old) old.parentNode.removeChild(old);
}

// === Barcode Manual Entry ===
document.addEventListener("DOMContentLoaded", function () {
  function handleManualBarcodeEntry() {
    const barcode = document.getElementById("barcode-manual-input").value.trim();
    if (!barcode) {
      alert("Please enter a barcode.");
      return;
    }
    const demoItem = randomDemoItem(barcode);
    showItemModal(demoItem, function(newItem) {
      // Save to inventory and persist
      const inventory = getInventory();
      inventory.push(newItem);
      saveInventory(inventory);
      window.dispatchEvent(new Event("inventory-updated"));
      alert("Item added to inventory!");
    });
  }

  document.getElementById("barcode-lookup-btn").onclick = handleManualBarcodeEntry;
  document.getElementById("barcode-manual-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") handleManualBarcodeEntry();
  });

  // Camera scan demo: just pick a random barcode and show result (modal, add to inventory)
  document.getElementById("barcode-start-camera-btn").onclick = function () {
    const demoBarcodes = ["A123", "B456", "C789", "D234"];
    const scannedBarcode = randomFrom(demoBarcodes);
    const demoItem = randomDemoItem(scannedBarcode);
    showItemModal(demoItem, function(newItem) {
      const inventory = getInventory();
      inventory.push(newItem);
      saveInventory(inventory);
      window.dispatchEvent(new Event("inventory-updated"));
      alert("Item added to inventory (from camera scan)!");
    });
  };
});

window.addEventListener("hashchange", removeOldModal);
window.addEventListener("popstate", removeOldModal);
