// Barcode Scanner Tab JS

// === Mock Data / Sample Lookup (replace with API/backend as needed) ===
const mockBarcodes = {
  "A123": { name: "Vintage Camera", brand: "Kodak", category: "Electronics", value: "£120" },
  "B456": { name: "Antique Vase", brand: "Ming", category: "Art", value: "£340" },
  "C789": { name: "Gold Watch", brand: "Omega", category: "Jewellery", value: "£850" },
  "D234": { name: "Silver Spoon", brand: "Georg Jensen", category: "Silverware", value: "£50" }
};

function displayBarcodeResult(data) {
  const resultCard = document.createElement("div");
  resultCard.className = "barcode-result-card";
  if (data) {
    resultCard.innerHTML = `
      <h4>Item Found</h4>
      <div><strong>Name:</strong> ${data.name}</div>
      <div><strong>Brand:</strong> ${data.brand}</div>
      <div><strong>Category:</strong> ${data.category}</div>
      <div><strong>Estimated Value:</strong> ${data.value}</div>
    `;
  } else {
    resultCard.innerHTML = `<h4 style="color:#f43f5e;">No item found for barcode</h4>`;
  }
  removeOldResult();
  document.getElementById("tab-scan").appendChild(resultCard);
}

function removeOldResult() {
  const old = document.querySelector(".barcode-result-card");
  if (old) old.parentNode.removeChild(old);
}

// === Manual Barcode Lookup ===
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("barcode-lookup-btn").onclick = function () {
    const barcode = document.getElementById("barcode-manual-input").value.trim();
    if (!barcode) {
      displayBarcodeResult(null);
      return;
    }
    const result = mockBarcodes[barcode] || null;
    displayBarcodeResult(result);
  };

  // === Camera Scanner Button (demo only) ===
  document.getElementById("barcode-start-camera-btn").onclick = function () {
    removeOldResult();
    const demoBarcodes = Object.keys(mockBarcodes);
    // Simulate scanning by picking a random barcode
    const scannedBarcode = demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];
    const result = mockBarcodes[scannedBarcode] || null;
    displayBarcodeResult(result);
  };
});
