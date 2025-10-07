// Storage keys
const FIN_INVOICES_KEY = "aw_finance_invoices";
const FIN_INV_PAYMENTS_KEY = "aw_finance_invoice_payments";
const FIN_SETTLEMENTS_KEY = "aw_finance_settlements";
const FIN_SETL_PAYMENTS_KEY = "aw_finance_settlement_payments";
const FIN_SHIPPING_KEY = "aw_finance_shipping";

// Utils
const GBP = () => (localStorage.getItem("aw_currency_symbol") || "£");
function fmt(n) {
  return GBP() + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function num(v) {
  return Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;
}
function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function exportCSV(filename, headers, rows) {
  const lines = [];
  lines.push(headers.map(csvEscape).join(","));
  rows.forEach(r => lines.push(headers.map(h => csvEscape(r[h])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
function parseISOorDMY(s) {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d,m,y] = s.split("/");
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }
  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

// Seed sample data for payments/settlements/shipping (safe; only if empty)
(function seed() {
  if (!localStorage.getItem(FIN_INV_PAYMENTS_KEY)) {
    save(FIN_INV_PAYMENTS_KEY, [
      { invoice:"INV-2025-09-0001", invoiceType:"Auction", sale:5, buyer:"Isaacs, Mark", buyerNo:"00000001", paymentType:"Payment", amount:2832, method:"Cash", date:"2025-09-04", reconciled:false },
      { invoice:"INV-2025-09-0002", invoiceType:"Auction", sale:3, buyer:"Sale, Bidder", buyerNo:"00000002", paymentType:"Payment", amount:722.4, method:"Cash", date:"2025-09-04", reconciled:false },
      { invoice:"INV-2025-09-0003", invoiceType:"Auction", sale:3, buyer:"Sale, Bidder", buyerNo:"00000002", paymentType:"Refund", amount:-9560, method:"Auto", date:"2025-09-04", reconciled:true },
    ]);
  }
  if (!localStorage.getItem(FIN_SETTLEMENTS_KEY)) {
    save(FIN_SETTLEMENTS_KEY, [
      { no:"0000005", type:"Manual", sale:2, client:"Holdaway, Mark", clientVat:0, items:2, total:7400, paid:0, status:"Unpaid", raised:"2025-08-22" },
      { no:"0000004", type:"Auction", sale:3, client:"Holdaway, Mark", clientVat:4, items:1, total:576, paid:576, status:"Paid", raised:"2025-09-04" },
      { no:"0000002", type:"Auction", sale:2, client:"Holdaway, Mark", clientVat:24, items:3, total:2956, paid:0, status:"Unpaid", raised:"2025-08-22" },
    ]);
  }
  if (!localStorage.getItem(FIN_SETL_PAYMENTS_KEY)) {
    save(FIN_SETL_PAYMENTS_KEY, [
      { settlement:"0000004", settlementType:"Auction", sale:3, client:"Holdaway, Mark", clientNo:"00000001", paymentType:"Payment", amount:576, method:"Deposit", date:"2025-09-04", reconciled:false }
    ]);
  }
  if (!localStorage.getItem(FIN_SHIPPING_KEY)) {
    save(FIN_SHIPPING_KEY, [
      { invoice:"INV-2025-09-0002", type:"Auction", sale:3, buyer:"Sale, Bidder", buyerVat:0.4, items:1, status:"Paid", raised:"2025-09-04", shipping:"Paid", dispatched:true },
      { invoice:"INV-2025-08-0001", type:"Manual", sale:1, buyer:"Sale, Bidder", buyerVat:40, items:1, status:"Unpaid", raised:"2025-08-22", shipping:"Unpaid", dispatched:false }
    ]);
  }
})();

// Sub-tab switching
function wireTabs() {
  const btns = Array.from(document.querySelectorAll(".finance-tab-btn"));
  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".finance-tab-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === `tab-${tab}`);
      });
      // Lazy renders
      switch (tab) {
        case "invoices": renderInvoices(); break;
        case "settlements": renderSettlements(); break;
        case "shipping": renderShipping(); break;
        case "invoice-payments": renderInvoicePayments(); break;
        case "settlement-payments": renderSettlementPayments(); break;
      }
    };
  });
}

// -------- Invoices --------
let invSort = { key:"invoiceNo", dir:1 };
let invPage = 1, invPerPage = 50, invSelected = new Set();

function computeInvoiceDerived(invRecord) {
  // Enrich with defaults to match grid columns
  const inv = { ...invRecord };
  inv.invoiceNo = inv.invoiceNo || inv.number || "";
  inv.type = inv.type || "Auction";
  inv.sale = inv.sale || (inv.caseId ? inv.caseId.replace(/\D/g,"").slice(-1) : "");
  inv.buyer = inv.client || "";
  inv.buyerVat = inv.buyerVat ?? 0;
  inv.itemsCount = Array.isArray(inv.items) ? inv.items.length : 0;
  inv.raised = inv.date || "";
  inv.shipping = inv.shipping || "N/A";
  // Status / Paid / Outstanding from invoice payments
  const pays = load(FIN_INV_PAYMENTS_KEY).filter(p => p.invoice === inv.invoiceNo);
  const paid = pays.reduce((s,p) => s + num(p.amount), 0);
  const total = num(inv.grandTotal ?? inv.subtotal ?? 0) + num(inv.vatAmount) + num(inv.taxAmount);
  const outstanding = total - paid;
  inv.total = total; inv.paid = paid; inv.outstanding = outstanding;
  inv.status = outstanding <= 0 ? "Paid" : (inv.status || "Unpaid");
  return inv;
}

function readInvoicesFiltered() {
  const data = load(FIN_INVOICES_KEY).map(computeInvoiceDerived);
  const q = {
    invoice: document.getElementById("inv-f-invoice").value.trim().toLowerCase(),
    status: document.getElementById("inv-f-status").value,
    dateFrom: document.getElementById("inv-f-date-from").value,
    dateTo: document.getElementById("inv-f-date-to").value,
    customer: document.getElementById("inv-f-customer").value.trim().toLowerCase(),
    sale: document.getElementById("inv-f-sale").value.trim(),
    min: num(document.getElementById("inv-f-min").value),
    max: num(document.getElementById("inv-f-max").value),
    lot: document.getElementById("inv-f-lot").value.trim().toLowerCase(),
    ref: document.getElementById("inv-f-ref").value.trim().toLowerCase(),
    overdue: document.getElementById("inv-f-overdue").checked,
    partial: document.getElementById("inv-f-partial").checked
  };
  return data.filter(r => {
    if (q.invoice && !r.invoiceNo.toLowerCase().includes(q.invoice)) return false;
    if (q.customer && !r.buyer.toLowerCase().includes(q.customer)) return false;
    if (q.sale && String(r.sale) !== q.sale) return false;
    if (q.status && r.status !== q.status) return false;
    if (q.min && r.total < q.min) return false;
    if (q.max && r.total > q.max) return false;
    const d = parseISOorDMY(r.raised);
    const df = q.dateFrom ? parseISOorDMY(q.dateFrom) : null;
    const dt = q.dateTo ? parseISOorDMY(q.dateTo) : null;
    if (df && d && d < df) return false;
    if (dt && d && d > new Date(dt.getTime()+86400000-1)) return false;
    if (q.overdue && r.outstanding <= 0) return false;
    if (q.partial && !(r.outstanding>0 && r.paid>0)) return false;
    return true;
  });
}

function renderInvoices() {
  const rows = readInvoicesFiltered();
  // Sort
  rows.sort((a,b) => {
    const k = invSort.key;
    const av = (k==="totals") ? a.total : (k==="items" ? a.itemsCount : a[k]);
    const bv = (k==="totals") ? b.total : (k==="items" ? b.itemsCount : b[k]);
    if (typeof av === "number" && typeof bv === "number") return (av-bv)*invSort.dir;
    return String(av ?? "").localeCompare(String(bv ?? ""))*invSort.dir;
  });

  // Stats
  const total = rows.reduce((s,r)=>s+num(r.total),0);
  const paid = rows.reduce((s,r)=>s+num(r.paid),0);
  const outstanding = total - paid;
  document.getElementById("inv-stat-total").textContent = fmt(total);
  document.getElementById("inv-stat-paid").textContent = fmt(paid);
  document.getElementById("inv-stat-outstanding").textContent = fmt(outstanding);

  // Pagination
  const per = invPerPage;
  const pages = Math.max(1, Math.ceil(rows.length / per));
  if (invPage > pages) invPage = pages;
  const start = (invPage-1)*per, end = start+per;
  const pageRows = rows.slice(start, end);

  // Table
  const tbody = document.getElementById("invoices-tbody");
  const empty = document.getElementById("invoices-empty");
  const count = document.getElementById("invoices-results-count");
  tbody.innerHTML = "";
  if (!rows.length) {
    empty.style.display = "";
    count.textContent = "Showing 0 of 0 invoices";
  } else {
    empty.style.display = "none";
    count.textContent = `Showing ${pageRows.length} of ${rows.length} invoices`;
    pageRows.forEach(r => {
      const tr = document.createElement("tr");
      const statusBadge = r.status==="Paid" ? "ok" : (r.status==="Unpaid" ? "warn" : r.status==="Cancelled" ? "danger" : "neutral");
      const shipBadge = r.shipping==="Paid" ? "ok" : r.shipping==="Unpaid" ? "warn" : r.shipping==="Credited" ? "neutral" : "neutral";
      tr.innerHTML = `
        <td><input type="checkbox" data-id="${r.invoiceNo}" ${invSelected.has(r.invoiceNo)?"checked":""} /></td>
        <td><a href="javascript:void(0)" class="lnk" data-view="${r.invoiceNo}">${r.invoiceNo}</a></td>
        <td><span class="badge neutral">${r.type}</span></td>
        <td>${r.sale ?? ""}</td>
        <td>${r.buyer ?? ""}</td>
        <td>${r.buyerVat ? "£"+r.buyerVat : "£0"}</td>
        <td>${fmt(r.total)} / ${fmt(r.paid)} / ${fmt(r.outstanding)}</td>
        <td>${r.itemsCount}</td>
        <td><span class="badge ${statusBadge}">${r.status}</span></td>
        <td>${r.raised || ""}</td>
        <td><span class="badge ${shipBadge}">${r.shipping}</span></td>
        <td><button class="btn light" data-dl="${r.invoiceNo}">⋮</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("inv-pager-info").textContent = `Showing ${rows.length ? (start+1) : 0}–${Math.min(end, rows.length)} of ${rows.length} entries`;

  // Events
  document.getElementById("invoices-table").querySelectorAll('thead th[data-sort]').forEach(th=>{
    th.onclick = () => {
      const k = th.getAttribute("data-sort");
      invSort = invSort.key===k ? { key:k, dir: -invSort.dir } : { key:k, dir:1 };
      renderInvoices();
    };
  });
  document.querySelectorAll('#invoices-tbody input[type="checkbox"]').forEach(cb=>{
    cb.onchange = () => {
      const id = cb.getAttribute("data-id");
      cb.checked ? invSelected.add(id) : invSelected.delete(id);
      document.getElementById("inv-selected-info").textContent = `Selected ${invSelected.size}`;
    };
  });
  document.querySelectorAll('#invoices-tbody a[data-view]').forEach(a=>{
    a.onclick = () => {
      const id = a.getAttribute("data-view");
      // If jsPDF present: regenerate; else no-op
      if (window.jspdf) {
        const inv = load(FIN_INVOICES_KEY).find(x => (x.invoiceNo || x.number) === id);
        if (!inv) return;
        try {
          // Minimal quick viewer via CSV export if needed; for now reuse finances viewer in another pass
          alert(`Invoice ${id}\nClient: ${inv.client}\nTotal: ${fmt(num(inv.grandTotal))}`);
        } catch(e) { console.warn(e); }
      }
    };
  });
  document.querySelectorAll('#invoices-tbody button[data-dl]').forEach(btn=>{
    btn.onclick = () => {
      const id = btn.getAttribute("data-dl");
      if (!window.jspdf) return alert("PDF generation not available here.");
      alert(`Row actions for ${id} (extend to: Download PDF, Email, etc.)`);
    };
  });
}

// Toolbar wiring for Invoices
function wireInvoiceToolbar() {
  const ddBtn = document.getElementById("inv-actions-btn");
  const menu = document.getElementById("inv-actions-menu");
  ddBtn.onclick = () => menu.hidden = !menu.hidden;
  menu.onclick = (e) => {
    const act = e.target?.dataset?.action;
    if (!act) return;
    menu.hidden = true;
    if (act==="export") {
      const rows = readInvoicesFiltered().map(r=>({
        Invoice:r.invoiceNo, Type:r.type, Sale:r.sale, Buyer:r.buyer,
        BuyerVAT:r.buyerVat, Total:r.total, Paid:r.paid, Outstanding:r.outstanding,
        Items:r.itemsCount, Status:r.status, Raised:r.raised, Shipping:r.shipping
      }));
      exportCSV("invoices.csv",
        ["Invoice","Type","Sale","Buyer","BuyerVAT","Total","Paid","Outstanding","Items","Status","Raised","Shipping"],
        rows);
    }
    if (act==="reset") {
      document.querySelectorAll('#inv-filters .fi').forEach(el=> {
        if (el.type==="checkbox") el.checked=false;
        else el.value="";
      });
      renderInvoices();
    }
  };
  document.getElementById("inv-select-all").onchange = (e) => {
    const rows = readInvoicesFiltered();
    if (e.target.checked) rows.forEach(r=>invSelected.add(r.invoiceNo));
    else invSelected.clear();
    document.getElementById("inv-selected-info").textContent = `Selected ${invSelected.size}`;
    renderInvoices();
  };
  document.getElementById("inv-search").onclick = renderInvoices;
  document.getElementById("inv-reset").onclick = () => {
    document.querySelectorAll('#inv-filters .fi').forEach(el=> {
      if (el.type==="checkbox") el.checked=false; else el.value="";
    });
    renderInvoices();
  };
  document.getElementById("inv-rows").onchange = (e) => {
    invPerPage = parseInt(e.target.value,10) || 50;
    invPage = 1;
    renderInvoices();
  };
}

// -------- Invoice Payments --------
let invPaySort = { key:"date", dir:-1 };
let invPayPage = 1, invPayPerPage = 50, invPaySelected = new Set();

function readInvoicePaymentsFiltered() {
  const data = load(FIN_INV_PAYMENTS_KEY);
  const q = {
    invoice: document.getElementById("invpay-f-invoice").value.trim().toLowerCase(),
    customer: document.getElementById("invpay-f-customer").value.trim().toLowerCase(),
    min: num(document.getElementById("invpay-f-min").value),
    max: num(document.getElementById("invpay-f-max").value),
    batch: document.getElementById("invpay-f-batch").value.trim().toLowerCase(),
    df: document.getElementById("invpay-f-date-from").value,
    dt: document.getElementById("invpay-f-date-to").value,
    method: document.getElementById("invpay-f-method").value,
    type: document.getElementById("invpay-f-type").value,
    reconciled: document.getElementById("invpay-f-reconciled").checked
  };
  return data.filter(r=>{
    if (q.invoice && !String(r.invoice||"").toLowerCase().includes(q.invoice)) return false;
    if (q.customer && !String(r.buyer||"").toLowerCase().includes(q.customer)) return false;
    if (q.method && r.method !== q.method) return false;
    if (q.type && r.paymentType !== q.type) return false;
    if (q.min && num(r.amount) < q.min) return false;
    if (q.max && num(r.amount) > q.max) return false;
    if (q.reconciled && !r.reconciled) return false;
    const d = parseISOorDMY(r.date);
    const df = q.df ? parseISOorDMY(q.df) : null;
    const dt = q.dt ? parseISOorDMY(q.dt) : null;
    if (df && d && d < df) return false;
    if (dt && d && d > new Date(dt.getTime()+86400000-1)) return false;
    return true;
  });
}

function renderInvoicePayments() {
  const rows = readInvoicePaymentsFiltered().sort((a,b)=>{
    const ak = a[invPaySort.key], bk = b[invPaySort.key];
    if (invPaySort.key==="amount") return (num(ak)-num(bk))*invPaySort.dir;
    return String(ak||"").localeCompare(String(bk||""))*invPaySort.dir;
  });
  const total = rows.reduce((s,r)=>s+num(r.amount),0);
  document.getElementById("invpay-stat-total").textContent = fmt(total);

  const per = invPayPerPage, pages = Math.max(1, Math.ceil(rows.length/per));
  if (invPayPage>pages) invPayPage=pages;
  const start=(invPayPage-1)*per,end=start+per,pageRows=rows.slice(start,end);

  const tbody = document.getElementById("invpay-tbody");
  const empty = document.getElementById("invpay-empty");
  const count = document.getElementById("invpay-results-count");
  tbody.innerHTML = "";
  if (!rows.length) {
    empty.style.display="";
    count.textContent = "Showing 0 of 0 payments";
  } else {
    empty.style.display="none";
    count.textContent = `Showing ${pageRows.length} of ${rows.length} payments`;
    pageRows.forEach(r=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" data-id="${r.invoice}-${r.date}-${r.amount}" ${invPaySelected.has(`${r.invoice}-${r.date}-${r.amount}`)?"checked":""} /></td>
        <td><a href="javascript:void(0)">${r.invoice}</a></td>
        <td><span class="badge neutral">${r.invoiceType||"Auction"}</span></td>
        <td>${r.sale||""}</td>
        <td>${r.buyer||""}</td>
        <td>${r.buyerNo||""}</td>
        <td><span class="badge ${r.paymentType==="Payment"?"neutral":"danger"}">${r.paymentType}</span></td>
        <td>${fmt(r.amount)}</td>
        <td>${r.method||""}</td>
        <td>${r.date||""}</td>
        <td><button class="btn light">⋮</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("invpay-pager-info").textContent = `Showing ${rows.length ? (start+1):0}–${Math.min(end,rows.length)} of ${rows.length} entries`;

  document.getElementById("invpay-table").querySelectorAll('thead th[data-sort]').forEach(th=>{
    th.onclick=()=>{
      const k=th.getAttribute("data-sort");
      invPaySort = invPaySort.key===k ? { key:k, dir:-invPaySort.dir } : { key:k, dir:1 };
      renderInvoicePayments();
    };
  });
  document.querySelectorAll('#invpay-tbody input[type="checkbox"]').forEach(cb=>{
    cb.onchange=()=>{
      const id=cb.getAttribute("data-id");
      cb.checked?invPaySelected.add(id):invPaySelected.delete(id);
      document.getElementById("invpay-selected-info").textContent=`Selected ${invPaySelected.size}`;
    };
  });
}

function wireInvoicePaymentsToolbar() {
  const ddBtn=document.getElementById("invpay-actions-btn");
  const menu=document.getElementById("invpay-actions-menu");
  ddBtn.onclick=()=>menu.hidden=!menu.hidden;
  menu.onclick=(e)=>{
    const act=e.target?.dataset?.action; if(!act) return; menu.hidden=true;
    if (act==="export") {
      const rows = readInvoicePaymentsFiltered().map(r=>({
        Invoice:r.invoice, InvoiceType:r.invoiceType||"Auction", Sale:r.sale, Buyer:r.buyer, BuyerNo:r.buyerNo,
        PaymentType:r.paymentType, Amount:r.amount, Method:r.method, Date:r.date
      }));
      exportCSV("invoice-payments.csv", ["Invoice","InvoiceType","Sale","Buyer","BuyerNo","PaymentType","Amount","Method","Date"], rows);
    }
    if (act==="reset") {
      document.querySelectorAll('#invpay-filters .fi').forEach(el=> {
        if (el.type==="checkbox") el.checked=false; else el.value="";
      });
      renderInvoicePayments();
    }
  };
  document.getElementById("invpay-select-all").onchange = (e)=>{
    const rows = readInvoicePaymentsFiltered();
    if (e.target.checked) rows.forEach(r=>invPaySelected.add(`${r.invoice}-${r.date}-${r.amount}`));
    else invPaySelected.clear();
    document.getElementById("invpay-selected-info").textContent=`Selected ${invPaySelected.size}`;
    renderInvoicePayments();
  };
  document.getElementById("invpay-search").onclick = renderInvoicePayments;
  document.getElementById("invpay-reset").onclick = ()=>{
    document.querySelectorAll('#invpay-filters .fi').forEach(el=> { if(el.type==="checkbox") el.checked=false; else el.value="";});
    renderInvoicePayments();
  };
  document.getElementById("invpay-rows").onchange = (e)=>{ invPayPerPage=parseInt(e.target.value,10)||50; invPayPage=1; renderInvoicePayments(); };
}

// -------- Settlements --------
let setSort = { key:"no", dir:1 };
let setPage = 1, setPerPage = 50, setSelected = new Set();

function readSettlementsFiltered() {
  const data = load(FIN_SETTLEMENTS_KEY);
  const q = {
    no: document.getElementById("set-f-no").value.trim().toLowerCase(),
    sale: document.getElementById("set-f-sale").value.trim(),
    company: document.getElementById("set-f-company").value.trim().toLowerCase(),
    df: document.getElementById("set-f-date-from").value,
    dt: document.getElementById("set-f-date-to").value,
    customer: document.getElementById("set-f-customer").value.trim().toLowerCase(),
    status: document.getElementById("set-f-status").value
  };
  return data.filter(r=>{
    if (q.no && !String(r.no).toLowerCase().includes(q.no)) return false;
    if (q.sale && String(r.sale)!==q.sale) return false;
    if (q.company && !String(r.client).toLowerCase().includes(q.company)) return false;
    if (q.status && r.status!==q.status) return false;
    const d=parseISOorDMY(r.raised);
    const df=q.df?parseISOorDMY(q.df):null, dt=q.dt?parseISOorDMY(q.dt):null;
    if (df && d && d<df) return false;
    if (dt && d && d>new Date(dt.getTime()+86400000-1)) return false;
    return true;
  });
}
function renderSettlements() {
  const rows=readSettlementsFiltered().sort((a,b)=>{
    const ak=a[setSort.key], bk=b[setSort.key];
    if (["total","paid","items"].includes(setSort.key)) return (num(ak)-num(bk))*setSort.dir;
    return String(ak||"").localeCompare(String(bk||""))*setSort.dir;
  });
  const total=rows.reduce((s,r)=>s+num(r.total),0);
  const paid=rows.reduce((s,r)=>s+num(r.paid),0);
  document.getElementById("set-stat-total").textContent=fmt(total);
  document.getElementById("set-stat-paid").textContent=fmt(paid);
  document.getElementById("set-stat-outstanding").textContent=fmt(total-paid);

  const per=setPerPage, pages=Math.max(1,Math.ceil(rows.length/per));
  if (setPage>pages) setPage=pages;
  const start=(setPage-1)*per,end=start+per,pageRows=rows.slice(start,end);

  const tbody=document.getElementById("settlements-tbody");
  const empty=document.getElementById("settlements-empty");
  const count=document.getElementById("settlements-results-count");
  tbody.innerHTML="";
  if(!rows.length){ empty.style.display=""; count.textContent="Showing 0 of 0 settlements"; }
  else {
    empty.style.display="none";
    count.textContent=`Showing ${pageRows.length} of ${rows.length} settlements`;
    pageRows.forEach(r=>{
      const statusBadge = r.status==="Paid"?"ok":r.status==="Unpaid"?"warn":r.status==="Cancelled"?"danger":"neutral";
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" data-id="${r.no}" ${setSelected.has(r.no)?"checked":""} /></td>
        <td><a href="javascript:void(0)">${r.no}</a></td>
        <td><span class="badge neutral">${r.type||"Auction"}</span></td>
        <td>${r.sale||""}</td>
        <td>${r.client||""}</td>
        <td>${r.clientVat? "£"+r.clientVat : "£0"}</td>
        <td>${fmt(r.total)} / ${fmt(r.paid)} / ${fmt(num(r.total)-num(r.paid))}</td>
        <td>${r.items||0}</td>
        <td><span class="badge ${statusBadge}">${r.status||"N/A"}</span></td>
        <td>${r.raised||""}</td>
        <td><button class="btn light">⋮</button></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("set-pager-info").textContent=`Showing ${rows.length?(start+1):0}–${Math.min(end,rows.length)} of ${rows.length} entries`;

  document.getElementById("settlements-table").querySelectorAll('thead th[data-sort]').forEach(th=>{
    th.onclick=()=>{ const k=th.getAttribute("data-sort"); setSort=setSort.key===k?{key:k,dir:-setSort.dir}:{key:k,dir:1}; renderSettlements(); };
  });
  document.querySelectorAll('#settlements-tbody input[type="checkbox"]').forEach(cb=>{
    cb.onchange=()=>{ const id=cb.getAttribute("data-id"); cb.checked?setSelected.add(id):setSelected.delete(id); document.getElementById("set-selected-info").textContent=`Selected ${setSelected.size}`; };
  });
}
function wireSettlementsToolbar() {
  const ddBtn=document.getElementById("set-actions-btn");
  const menu=document.getElementById("set-actions-menu");
  ddBtn.onclick=()=>menu.hidden=!menu.hidden;
  menu.onclick=(e)=>{
    const a=e.target?.dataset?.action; if(!a) return; menu.hidden=true;
    if(a==="export"){
      const rows=readSettlementsFiltered().map(r=>({No:r.no,Type:r.type,Sale:r.sale,client:r.client,clientVAT:r.clientVat,Total:r.total,Paid:r.paid,Outstanding:num(r.total)-num(r.paid),Items:r.items,Status:r.status,Raised:r.raised}));
      exportCSV("settlements.csv",["No","Type","Sale","client","clientVAT","Total","Paid","Outstanding","Items","Status","Raised"],rows);
    }
    if(a==="reset"){ document.querySelectorAll('#set-filters .fi').forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value="";}); renderSettlements(); }
  };
  document.getElementById("set-select-all").onchange=(e)=>{ const rows=readSettlementsFiltered(); if(e.target.checked) rows.forEach(r=>setSelected.add(r.no)); else setSelected.clear(); document.getElementById("set-selected-info").textContent=`Selected ${setSelected.size}`; renderSettlements(); };
  document.getElementById("set-search").onclick=renderSettlements;
  document.getElementById("set-reset").onclick=()=>{ document.querySelectorAll('#set-filters .fi').forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value="";}); renderSettlements(); };
  document.getElementById("set-rows").onchange=(e)=>{ setPerPage=parseInt(e.target.value,10)||50; setPage=1; renderSettlements(); };
}

// -------- Shipping --------
let shipSort = { key:"invoice", dir:1 };
let shipPage=1, shipPerPage=50, shipSelected=new Set();

function readShippingFiltered(){
  const data=load(FIN_SHIPPING_KEY);
  const q={
    invoice:document.getElementById("ship-f-invoice").value.trim().toLowerCase(),
    status:document.getElementById("ship-f-status").value,
    df:document.getElementById("ship-f-date-from").value,
    dt:document.getElementById("ship-f-date-to").value,
    customer:document.getElementById("ship-f-customer").value.trim().toLowerCase(),
    sale:document.getElementById("ship-f-sale").value.trim(),
    shipstatus:document.getElementById("ship-f-shipstatus").value
  };
  return data.filter(r=>{
    if(q.invoice && !String(r.invoice||"").toLowerCase().includes(q.invoice)) return false;
    if(q.status && r.status!==q.status) return false;
    if(q.customer && !String(r.buyer||"").toLowerCase().includes(q.customer)) return false;
    if(q.sale && String(r.sale)!==q.sale) return false;
    if(q.shipstatus && r.shipping!==q.shipstatus) return false;
    const d=parseISOorDMY(r.raised), df=q.df?parseISOorDMY(q.df):null, dt=q.dt?parseISOorDMY(q.dt):null;
    if(df && d && d<df) return false;
    if(dt && d && d>new Date(dt.getTime()+86400000-1)) return false;
    return true;
  });
}
function renderShipping(){
  const rows=readShippingFiltered().sort((a,b)=>String(a[shipSort.key]||"").localeCompare(String(b[shipSort.key]||""))*shipSort.dir);
  const per=shipPerPage, pages=Math.max(1,Math.ceil(rows.length/per)); if(shipPage>pages) shipPage=pages;
  const start=(shipPage-1)*per, end=start+per, pageRows=rows.slice(start,end);

  const tbody=document.getElementById("shipping-tbody");
  const empty=document.getElementById("shipping-empty");
  const count=document.getElementById("shipping-results-count");
  tbody.innerHTML="";
  if(!rows.length){ empty.style.display=""; count.textContent="Showing 0 of 0 records"; }
  else{
    empty.style.display="none";
    count.textContent=`Showing ${pageRows.length} of ${rows.length} records`;
    pageRows.forEach(r=>{
      const statusBadge=r.status==="Paid"?"ok":r.status==="Unpaid"?"warn":"neutral";
      const shipBadge=r.shipping==="Paid"?"ok":r.shipping==="Unpaid"?"warn":r.shipping==="Credited"?"neutral":"neutral";
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" data-id="${r.invoice}" ${shipSelected.has(r.invoice)?"checked":""} /></td>
        <td><a href="javascript:void(0)">${r.invoice}</a></td>
        <td><span class="badge neutral">${r.type||"Auction"}</span></td>
        <td>${r.sale||""}</td>
        <td>${r.buyer||""}</td>
        <td>${r.buyerVat? "£"+r.buyerVat : "£0"}</td>
        <td>${r.items||0}</td>
        <td><span class="badge ${statusBadge}">${r.status||"N/A"}</span></td>
        <td>${r.raised||""}</td>
        <td><span class="badge ${shipBadge}">${r.shipping||"N/A"}</span></td>
        <td><button class="btn light">⋮</button></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("ship-pager-info").textContent=`Showing ${rows.length?(start+1):0}–${Math.min(end,rows.length)} of ${rows.length} entries`;

  document.getElementById("shipping-table").querySelectorAll('thead th[data-sort]').forEach(th=>{
    th.onclick=()=>{ const k=th.getAttribute("data-sort"); shipSort=shipSort.key===k?{key:k,dir:-shipSort.dir}:{key:k,dir:1}; renderShipping(); };
  });
  document.querySelectorAll('#shipping-tbody input[type="checkbox"]').forEach(cb=>{
    cb.onchange=()=>{ const id=cb.getAttribute("data-id"); cb.checked?shipSelected.add(id):shipSelected.delete(id); document.getElementById("ship-selected-info").textContent=`Selected ${shipSelected.size}`; };
  });
}
function wireShippingToolbar(){
  document.getElementById("ship-mark").onclick=()=>{ const all=load(FIN_SHIPPING_KEY); shipSelected.forEach(id=>{ const r=all.find(x=>x.invoice===id); if(r){ r.dispatched=true; r.shipping="Paid"; }}); save(FIN_SHIPPING_KEY,all); renderShipping(); };
  document.getElementById("ship-unmark").onclick=()=>{ const all=load(FIN_SHIPPING_KEY); shipSelected.forEach(id=>{ const r=all.find(x=>x.invoice===id); if(r){ r.dispatched=false; r.shipping="Unpaid"; }}); save(FIN_SHIPPING_KEY,all); renderShipping(); };
  document.getElementById("ship-select-all").onchange=(e)=>{ const rows=readShippingFiltered(); if(e.target.checked) rows.forEach(r=>shipSelected.add(r.invoice)); else shipSelected.clear(); document.getElementById("ship-selected-info").textContent=`Selected ${shipSelected.size}`; renderShipping(); };
  document.getElementById("ship-search").onclick=renderShipping;
  document.getElementById("ship-reset").onclick=()=>{ document.querySelectorAll('#ship-filters .fi').forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value="";}); renderShipping(); };
  document.getElementById("ship-rows").onchange=(e)=>{ shipPerPage=parseInt(e.target.value,10)||50; shipPage=1; renderShipping(); };
}

// -------- Settlement Payments --------
let setlPaySort={ key:"date", dir:-1 };
let setlPayPage=1, setlPayPerPage=50, setlPaySelected=new Set();

function readSettlementPaymentsFiltered(){
  const data=load(FIN_SETL_PAYMENTS_KEY);
  const q={
    settlement:document.getElementById("setlpay-f-settlement").value.trim().toLowerCase(),
    customer:document.getElementById("setlpay-f-customer").value.trim().toLowerCase(),
    min:num(document.getElementById("setlpay-f-min").value),
    max:num(document.getElementById("setlpay-f-max").value),
    batch:document.getElementById("setlpay-f-batch").value.trim().toLowerCase(),
    df:document.getElementById("setlpay-f-date-from").value,
    dt:document.getElementById("setlpay-f-date-to").value,
    method:document.getElementById("setlpay-f-method").value,
    reconciled:document.getElementById("setlpay-f-reconciled").checked
  };
  return data.filter(r=>{
    if(q.settlement && !String(r.settlement||"").toLowerCase().includes(q.settlement)) return false;
    if(q.customer && !String(r.client||"").toLowerCase().includes(q.customer)) return false;
    if(q.method && r.method!==q.method) return false;
    if(q.min && num(r.amount)<q.min) return false;
    if(q.max && num(r.amount)>q.max) return false;
    if(q.reconciled && !r.reconciled) return false;
    const d=parseISOorDMY(r.date), df=q.df?parseISOorDMY(q.df):null, dt=q.dt?parseISOorDMY(q.dt):null;
    if(df && d && d<df) return false;
    if(dt && d && d>new Date(dt.getTime()+86400000-1)) return false;
    return true;
  });
}
function renderSettlementPayments(){
  const rows=readSettlementPaymentsFiltered().sort((a,b)=>{
    const ak=a[setlPaySort.key], bk=b[setlPaySort.key];
    if(setlPaySort.key==="amount") return (num(ak)-num(bk))*setlPaySort.dir;
    return String(ak||"").localeCompare(String(bk||""))*setlPaySort.dir;
  });
  const total=rows.reduce((s,r)=>s+num(r.amount),0);
  document.getElementById("setlpay-stat-total").textContent=fmt(total);

  const per=setlPayPerPage, pages=Math.max(1,Math.ceil(rows.length/per)); if(setlPayPage>pages)setlPayPage=pages;
  const start=(setlPayPage-1)*per, end=start+per, pageRows=rows.slice(start,end);

  const tbody=document.getElementById("setlpay-tbody");
  const empty=document.getElementById("setlpay-empty");
  const count=document.getElementById("setlpay-results-count");
  tbody.innerHTML="";
  if(!rows.length){ empty.style.display=""; count.textContent="Showing 0 of 0 payments"; }
  else{
    empty.style.display="none";
    count.textContent=`Showing ${pageRows.length} of ${rows.length} payments`;
    pageRows.forEach(r=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" data-id="${r.settlement}-${r.date}-${r.amount}" ${setlPaySelected.has(`${r.settlement}-${r.date}-${r.amount}`)?"checked":""} /></td>
        <td><a href="javascript:void(0)">${r.settlement}</a></td>
        <td><span class="badge neutral">${r.settlementType||"Auction"}</span></td>
        <td>${r.sale||""}</td>
        <td>${r.client||""}</td>
        <td>${r.clientNo||""}</td>
        <td><span class="badge neutral">${r.paymentType||"Payment"}</span></td>
        <td>${fmt(r.amount)}</td>
        <td>${r.method||""}</td>
        <td>${r.date||""}</td>
        <td><button class="btn light">⋮</button></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById("setlpay-pager-info").textContent=`Showing ${rows.length?(start+1):0}–${Math.min(end,rows.length)} of ${rows.length} entries`;

  document.getElementById("setlpay-table").querySelectorAll('thead th[data-sort]').forEach(th=>{
    th.onclick=()=>{ const k=th.getAttribute("data-sort"); setlPaySort=setlPaySort.key===k?{key:k,dir:-setlPaySort.dir}:{key:k,dir:1}; renderSettlementPayments(); };
  });
  document.querySelectorAll('#setlpay-tbody input[type="checkbox"]').forEach(cb=>{
    cb.onchange=()=>{ const id=cb.getAttribute("data-id"); cb.checked?setlPaySelected.add(id):setlPaySelected.delete(id); document.getElementById("setlpay-selected-info").textContent=`Selected ${setlPaySelected.size}`; };
  });
}
function wireSettlementPaymentsToolbar(){
  const ddBtn=document.getElementById("setlpay-actions-btn");
  const menu=document.getElementById("setlpay-actions-menu");
  ddBtn.onclick=()=>menu.hidden=!menu.hidden;
  menu.onclick=(e)=>{
    const a=e.target?.dataset?.action; if(!a) return; menu.hidden=true;
    if(a==="export"){
      const rows=readSettlementPaymentsFiltered().map(r=>({Settlement:r.settlement,Type:r.settlementType||"Auction",Sale:r.sale,client:r.client,clientNo:r.clientNo,PaymentType:r.paymentType,Amount:r.amount,Method:r.method,Date:r.date}));
      exportCSV("settlement-payments.csv",["Settlement","Type","Sale","client","clientNo","PaymentType","Amount","Method","Date"],rows);
    }
    if(a==="reset"){ document.querySelectorAll('#setlpay-filters .fi').forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value="";}); renderSettlementPayments(); }
  };
  document.getElementById("setlpay-select-all").onchange=(e)=>{ const rows=readSettlementPaymentsFiltered(); if(e.target.checked) rows.forEach(r=>setlPaySelected.add(`${r.settlement}-${r.date}-${r.amount}`)); else setlPaySelected.clear(); document.getElementById("setlpay-selected-info").textContent=`Selected ${setlPaySelected.size}`; renderSettlementPayments(); };
  document.getElementById("setlpay-search").onclick=renderSettlementPayments;
  document.getElementById("setlpay-reset").onclick=()=>{ document.querySelectorAll('#setlpay-filters .fi').forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value="";}); renderSettlementPayments(); };
  document.getElementById("setlpay-rows").onchange=(e)=>{ setlPayPerPage=parseInt(e.target.value,10)||50; setlPayPage=1; renderSettlementPayments(); };
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  wireTabs();

  // Invoices
  wireInvoiceToolbar();
  renderInvoices();

  // Invoice Payments
  wireInvoicePaymentsToolbar();

  // Settlements
  wireSettlementsToolbar();

  // Shipping
  wireShippingToolbar();

  // Settlement Payments
  wireSettlementPaymentsToolbar();

  // Live refresh when other tabs change invoices/payments
  window.addEventListener("storage", (e) => {
    if ([FIN_INVOICES_KEY, FIN_INV_PAYMENTS_KEY, FIN_SETTLEMENTS_KEY, FIN_SETL_PAYMENTS_KEY, FIN_SHIPPING_KEY].includes(e.key)) {
      const active = document.querySelector(".finance-tab-btn.active")?.dataset?.tab;
      switch (active) {
        case "invoices": renderInvoices(); break;
        case "invoice-payments": renderInvoicePayments(); break;
        case "settlements": renderSettlements(); break;
        case "shipping": renderShipping(); break;
        case "settlement-payments": renderSettlementPayments(); break;
      }
    }
  });
});
