// Analytics Tab JS

// === Mock Data (Replace with API/backend calls as needed) ===
const mockKPIs = [
  { title: "Total Items", value: 348, desc: "+12 this week" },
  { title: "Active Cases", value: 5, desc: "2 new cases" },
  { title: "Items Sold", value: 41, desc: "7 this month" },
  { title: "Storage Utilisation", value: "74%", desc: "Stable" }
];

const mockCharts = [
  {
    title: "Items Added Over Time",
    desc: "Monthly additions for past year",
    type: "bar",
    data: [22, 29, 18, 35, 27, 31, 24, 36, 28, 33, 41, 38],
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
  },
  {
    title: "Sales Breakdown",
    desc: "Sold items by category",
    type: "pie",
    data: [15, 12, 7, 4, 3],
    labels: ["Art", "Jewellery", "Electronics", "Silverware", "Collectibles"]
  },
  {
    title: "Case Status Distribution",
    desc: "Current case statuses",
    type: "donut",
    data: [5, 2, 1, 1],
    labels: ["Active", "Ready", "Processing", "Completed"]
  }
];

// === Render KPI Cards ===
function renderKPICards() {
  const grid = document.getElementById("kpi-cards");
  grid.innerHTML = "";
  mockKPIs.forEach(kpi => {
    const card = document.createElement("div");
    card.className = "kpi-card";
    card.innerHTML = `
      <div class="kpi-card-title">${kpi.title}</div>
      <div class="kpi-card-value">${kpi.value}</div>
      <div class="kpi-card-desc">${kpi.desc}</div>
    `;
    grid.appendChild(card);
  });
}

// === Render Charts (Simple SVG Demo) ===
function renderCharts() {
  const section = document.getElementById("charts-section");
  section.innerHTML = "";

  mockCharts.forEach(chart => {
    const card = document.createElement("div");
    card.className = "analytics-chart-card";
    card.innerHTML = `
      <div class="analytics-chart-title">${chart.title}</div>
      <div class="analytics-chart-desc">${chart.desc}</div>
      <div class="analytics-chart-visual">${createChartSVG(chart)}</div>
    `;
    section.appendChild(card);
  });
}

// === Chart SVG Generator (Basic Bar/Pie/Donut) ===
function createChartSVG(chart) {
  if (chart.type === "bar") {
    // Simple Bar Chart
    const max = Math.max(...chart.data);
    let bars = chart.data.map((v, i) => `
      <rect x="${i*30+10}" y="${120-v/max*100}" width="22" height="${v/max*100}" rx="5" fill="#2563eb"/>
      <text x="${i*30+21}" y="140" font-size="11" text-anchor="middle" fill="#6584b9">${chart.labels[i]}</text>
    `).join('');
    return `<svg width="${chart.data.length*30+20}" height="150">${bars}</svg>`;
  }
  if (chart.type === "pie" || chart.type === "donut") {
    // Simple Pie/Donut Chart
    const sum = chart.data.reduce((a,b)=>a+b,0);
    let angle = 0;
    let segments = '';
    chart.data.forEach((v,i) => {
      const a1 = angle;
      const a2 = angle + (v/sum)*360;
      const large = a2 - a1 > 180 ? 1 : 0;
      const r = chart.type === "donut" ? 35 : 48;
      const x1 = 60 + r * Math.cos(Math.PI*a1/180);
      const y1 = 60 + r * Math.sin(Math.PI*a1/180);
      const x2 = 60 + r * Math.cos(Math.PI*a2/180);
      const y2 = 60 + r * Math.sin(Math.PI*a2/180);
      segments += `
        <path d="M60,60 L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${getColor(i)}"/>
      `;
      angle = a2;
    });
    let donutHole = chart.type === "donut" ? `<circle cx="60" cy="60" r="24" fill="#f7f9fc"/>` : '';
    let labels = chart.labels.map((lbl,i) =>
      `<text x="120" y="${25+i*18}" font-size="12" fill="${getColor(i)}">${lbl} (${chart.data[i]})</text>`
    ).join('');
    return `<svg width="180" height="120">${segments}${donutHole}${labels}</svg>`;
  }
  return "";
}

function getColor(i) {
  const palette = ["#2563eb","#43a047","#fbc02d","#7c3aed","#e43e3e","#6584b9","#174ca2","#00bcd4"];
  return palette[i % palette.length];
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  renderKPICards();
  renderCharts();
});
