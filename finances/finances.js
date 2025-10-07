// Keys for finance data
const FIN_INVOICES_KEY = "aw_finance_invoices";
const FIN_SETTLEMENTS_KEY = "aw_finance_settlements";
const FIN_SHIPPING_KEY = "aw_finance_shipping";
const FIN_INV_PAYMENTS_KEY = "aw_finance_invoice_payments";
const FIN_SETL_PAYMENTS_KEY = "aw_finance_settlement_payments";

// Utils
function loadKey(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function saveKey(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function fmt(n) {
  const sym = localStorage.getItem("aw_currency_symbol") || "£";
  return sym + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Sub-tab switching
function wireFinanceTabs() {
  const buttons = Array.from(document.querySelectorAll(".finance-tab-btn"));
  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".finance-tab-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === `tab-${tab}`);
      });
      // Optional: lazy render per tab
      if (tab === "invoices") renderInvoices();
    };
  });
}

// Invoices
function renderInvoices() {
  const data = loadKey(FIN_INVOICES_KEY);
  const tbody = document.getElementById("invoices-tbody");
  const empty = document.getElementById("invoices-empty");
  const countEl = document.getElementById("invoices-results-count");
  const q = document.getElementById("invoice-search").value.trim().toLowerCase();

  let rows = data;
  if (q) {
    rows = rows.filter(r =>
      (r.invoiceNo || "").toLowerCase().includes(q) ||
      (r.client || "").toLowerCase().includes(q) ||
      (r.caseId || "").toLowerCase().includes(q)
    );
  }

  countEl.textContent = `Showing ${rows.length} of ${data.length} invoices`;
  tbody.innerHTML = "";
  if (!rows.length) {
    empty.style.display = "";
    return;
  }
  empty.style.display = "none";

  rows.forEach((inv, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${inv.invoiceNo || ""}</td>
      <td>${inv.date || ""}</td>
      <td>${inv.client || ""}</td>
      <td>${inv.caseId || ""}</td>
      <td>${fmt(inv.grandTotal || 0)}</td>
      <td>
        <div class="finance-actions-row">
          <button data-idx="${idx}" class="inv-view-btn">View/Download</button>
          <button data-idx="${idx}" class="inv-delete-btn" style="color:#c00;">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".inv-view-btn").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.getAttribute("data-idx"));
      const inv = rows[idx];
      // Re-generate PDF from stored data
      try {
        regenerateInvoicePDF(inv);
      } catch (e) {
        alert("Unable to generate PDF in this context.");
      }
    };
  });
  document.querySelectorAll(".inv-delete-btn").forEach(btn => {
    btn.onclick = () => {
      const confirmDel = confirm("Delete this invoice record? This won't remove downloaded files.");
      if (!confirmDel) return;
      const all = loadKey(FIN_INVOICES_KEY);
      // Find by invoiceNo
      const invNo = btn.closest("tr").children[0].textContent;
      const idx = all.findIndex(x => x.invoiceNo === invNo);
      if (idx >= 0) {
        all.splice(idx, 1);
        saveKey(FIN_INVOICES_KEY, all);
        renderInvoices();
      }
    };
  });
}

// Optional PDF generation (requires jsPDF scripts present)
function regenerateInvoicePDF(inv) {
  if (!window.jspdf) { alert("jsPDF not loaded"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 14, right = 120;
  let y = 16;

  doc.setFontSize(16); doc.setFont(undefined, "bold");
  doc.text("Invoice", left, y); y += 8;
  doc.setFontSize(11); doc.setFont(undefined, "normal");
  doc.text(`Invoice No: ${inv.invoiceNo || ""}`, left, y); y += 6;
  doc.text(`Date: ${inv.date || ""}`, left, y); y += 8;

  doc.setFont(undefined, "bold"); doc.text("Client", left, y);
  doc.setFont(undefined, "normal");
  const clientLines = doc.splitTextToSize(`${inv.client || ""}\n${inv.clientAddress || ""}\n${inv.clientEmail || ""}`, 90);
  doc.text(clientLines, left, y + 5);

  doc.setFont(undefined, "bold"); doc.text("Totals", right, 30);
  doc.setFont(undefined, "normal");
  const totals = [
    ["Subtotal:", fmt(inv.subtotal || 0)],
    ["VAT:", fmt(inv.vatAmount || 0)],
    ["Tax:", fmt(inv.taxAmount || 0)],
    ["Grand Total:", fmt(inv.grandTotal || 0)],
  ];
  let ty = 36;
  totals.forEach(([k,v]) => { doc.text(k, right, ty); doc.text(v, 200, ty, { align:"right" }); ty += 6; });

  // Items
  const rows = (inv.items || []).map(it => ([
    it.name || "", String(it.quantity || 1), fmt(it.estimate || 0), it.reserve != null ? fmt(it.reserve) : "—"
  ]));
  if (rows.length) {
    doc.autoTable({
      startY: y + 20,
      head: [["Item", "Qty", "Estimate", "Reserve"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37,99,235] },
      columnStyles: { 1: {halign:"right"}, 2: {halign:"right"}, 3: {halign:"right"} },
      margin: { left, right: 14 }, theme: "grid"
    });
  }

  doc.save(`Invoice_${inv.invoiceNo || "invoice"}.pdf`);
}

// Wire events
document.addEventListener("DOMContentLoaded", () => {
  wireFinanceTabs();
  document.getElementById("invoice-search").addEventListener("input", renderInvoices);
  renderInvoices();

  // Refresh if other tabs add invoices
  window.addEventListener("storage", (e) => {
    if (e.key === FIN_INVOICES_KEY) renderInvoices();
  });
});
