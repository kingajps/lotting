// Barcode Scanner Tab JS (Enhanced with Inventory Modal & LocalStorage Integration)

// === Utility Functions ===
function getCurrentUser() {
  // Replace with real user logic if/when available
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
function randomDemoItem(barcode) {
  const brands = ["Kodak", "Apple", "Omega", "Ming", "Canon", "Sony", "Dell", "Heritage Furniture"];
  const models = ["Classic", "Pro X", "Model S", "Air (4th gen)", "Vintage", "Elite", "Inspire", "Alpha"];
  const categories = ["Electronics", "Jewellery", "Art", "Furniture", "Silverware"];
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
    category: randomFrom(categories),
    barcode: barcode,
    desc: randomFrom(descs),
    details: "Randomly generated demo details.",
    estimatedValue: randomInt(20, 1000),
    value: "£" + randomInt(20, 1000),
    loggedBy: getCurrentUser(),
    loggedAt: getCurrentDateTime(),
    dims: randomFrom(dims),
    // These fields are for manual input
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
  // Modal HTML structure (to be added to scan/scan.html as well!)
  const modal = document.createElement("div");
  modal.className = "inventory-detail-modal modal-open";
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h2 class="modal-title">Add New Inventory Item</h2>
      <form id="item-modal-form">
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
          <input type="text" name="category" value="${itemData.category || ""}">
        </div>
        <div class="modal-form-row">
          <label>Barcode</label>
          <input type="text" name="barcode" value="${itemData.barcode || ""}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Description</label>
          <textarea name="desc">${itemData.desc || ""}</textarea>
        </div>
        <div class="modal-form-row">
          <label>Estimated Value</label>
          <input type="text" name="value" value="${itemData.value || ""}">
        </div>
        <div class="modal-form-row">
          <label>Logged By</label>
          <input type="text" name="loggedBy" value="${itemData.loggedBy || ""}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Logged At</label>
          <input type="text" name="loggedAt" value="${itemData.loggedAt || ""}" readonly>
        </div>
        <div class="modal-form-row">
          <label>Dimensions (L×W×H, Weight)</label>
          <input type="text" name="dims" value="${itemData.dims ? `${itemData.dims.length} × ${itemData.dims.width} × ${itemData.dims.height}, ${itemData.dims.weight}` : ""}">
        </div>
        <div class="modal-form-row">
          <label>Condition</label>
          <input type="text" name="condition" value="${itemData.condition || ""}">
        </div>
        <div class="modal-form-row">
          <label>Status</label>
          <input type="text" name="status" value="${itemData.status || ""}">
        </div>
        <div class="modal-form-row">
          <label>Location</label>
          <input type="text" name="location" value="${itemData.location || ""}">
        </div>
        <div class="modal-form-row">
          <label>Case</label>
          <input type="text" name="case" value="${itemData.case || ""}">
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

  // Save
  modal.querySelector("#item-modal-form").onsubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    // Parse dims
    let dimsObj = {};
    if (form.dims.value) {
      const dimMatch = form.dims.value.match(/([\d\.]+cm)\s*×\s*([\d\.]+cm)\s*×\s*([\d\.]+cm),\s*([\d\.]+kg)/);
      if (dimMatch) {
        dimsObj = {
          length: dimMatch[1],
          width: dimMatch[2],
          height: dimMatch[3],
          weight: dimMatch[4]
        };
      } else {
        dimsObj = { length: "", width: "", height: "", weight: "" };
      }
    }
    // Build item
    const item = {
      name: form.name.value,
      brand: form.brand.value,
      model: form.model.value,
      year: Number(form.year.value) || "",
      category: form.category.value,
      barcode: form.barcode.value,
      desc: form.desc.value,
      details: "", // Optionally extend
      estimatedValue: Number((form.value.value||"").toString().replace("£","")) || "",
      value: form.value.value,
      loggedBy: form.loggedBy.value,
      loggedAt: form.loggedAt.value,
      dims: dimsObj,
      condition: form.condition.value,
      status: form.status.value,
      location: form.location.value,
      case: form.case.value,
      notes: form.notes.value
    };
    saveCallback(item);
    removeOldModal();
  };
}
function removeOldModal() {
  const old = document.querySelector(".inventory-detail-modal");
  if (old) old.parentNode.removeChild(old);
}

// === LocalStorage Inventory Helper ===
function getInventory() {
  try {
    return JSON.parse(localStorage.getItem("inventory")) || [];
  } catch {
    return [];
  }
}
function saveInventory(arr) {
  localStorage.setItem("inventory", JSON.stringify(arr));
}

// === Barcode Manual Entry ===
document.addEventListener("DOMContentLoaded", function () {
  function handleManualBarcodeEntry() {
    const barcode = document.getElementById("barcode-manual-input").value.trim();
    if (!barcode) {
      alert("Please enter a barcode.");
      return;
    }
    // Show modal with random info (except logged by and logged at)
    const demoItem = randomDemoItem(barcode);
    showItemModal(demoItem, function(newItem) {
      // Add to inventory and persist
      const inventory = getInventory();
      inventory.push(newItem);
      saveInventory(inventory);
      // Optionally: show confirmation, refresh inventory tab, etc.
      alert("Item added to inventory!");
    });
  }

  document.getElementById("barcode-lookup-btn").onclick = handleManualBarcodeEntry;
  document.getElementById("barcode-manual-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") handleManualBarcodeEntry();
  });

  // Camera scan demo: just pick a random barcode and show result (no modal for scan demo)
  document.getElementById("barcode-start-camera-btn").onclick = function () {
    const demoBarcodes = ["A123", "B456", "C789", "D234"];
    const scannedBarcode = randomFrom(demoBarcodes);
    const demoItem = randomDemoItem(scannedBarcode);
    // For demo: show modal with random info as well
    showItemModal(demoItem, function(newItem) {
      const inventory = getInventory();
      inventory.push(newItem);
      saveInventory(inventory);
      alert("Item added to inventory (from camera scan)!");
    });
  };
});

// Optionally, remove popup on navigation away
window.addEventListener("hashchange", removeOldModal);
window.addEventListener("popstate", removeOldModal);
