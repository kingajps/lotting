// Storage Map Tab JS

// === Mock Data for Storage Locations Grouped by Zone ===
const mockZones = [
  {
    group: "Zone Unit 32",
    locations: [
      {
        id: "U32-ELEC-A1",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 50,
        used: 35,
        items: 2
      },
      {
        id: "U32-FURN-B1",
        type: "Floor",
        icon: "✔️",
        status: "Available",
        capacity: 20,
        used: 12,
        items: 2
      }
    ]
  },
  {
    group: "Zone Unit 30",
    locations: [
      {
        id: "U30-ANT-C1",
        type: "Shelf",
        icon: "✔️",
        status: "Available",
        capacity: 30,
        used: 25,
        items: 0
      }
    ]
  },
  {
    group: "Zone On Site",
    locations: [
      {
        id: "Cases with Company",
        type: "CasesOnSite",
        icon: "🏢",
        status: "On Site",
        company: "Acme Corp.",
        caseCount: 5,
        desc: "Number of cases currently at client company site."
      },
      {
        id: "Awaiting Collection",
        type: "AwaitingCollection",
        icon: "⏳",
        status: "Awaiting",
        assetCount: 3,
        desc: "Items/assets awaiting collection for transfer to warehouse."
      }
    ]
  },
  {
    group: "In Transit",
    locations: [
      {
        id: "JPS Van",
        type: "Van",
        icon: "🚚",
        status: "Available",
        inUse: false,
        booking: {}
      },
      {
        id: "Transit-Van-2",
        type: "Van",
        icon: "🚚",
        status: "In Use",
        inUse: true,
        booking: {
          from: "2025-10-01 09:00",
          to: "2025-10-01 15:00",
          by: "John Doe",
          company: "Greentech Ltd.",
          address: "123 Green St, London"
        }
      },
      {
        id: "Shipped to Customers",
        type: "Shipped",
        icon: "📦",
        status: "Shipped",
        shipmentCount: 4,
        desc: "Items shipped off to customers."
      }
    ]
  }
];

// === Utility: Color by utilization percent ===
function getBarColor(percent) {
  if (percent >= 80) return "#fbc02d"; // yellow for high
  if (percent >= 60) return "#1976d2"; // blue for medium
  return "#43a047"; // green for low
}

// New: get class for card based on percent (for box color)
function getStorageCardClass(percent) {
  if (percent >= 76) return "storage-card-red";
  if (percent >= 50) return "storage-card-amber";
  return "storage-card-green";
}

const STORAGE_KEY = "aw_storage_map_data";
let editableZones = [];

// Only restore missing/empty zones; never overwrite user edits!
function ensureZonesPresent(zones) {
  const required = ["Zone On Site", "In Transit"];
  for (const groupName of required) {
    const idx = zones.findIndex(z => z.group === groupName);
    const mockIdx = mockZones.findIndex(z => z.group === groupName);
    if (mockIdx === -1) continue; // skip if not in mock data

    if (idx === -1) {
      // Zone is completely missing, add from mock
      zones.push(JSON.parse(JSON.stringify(mockZones[mockIdx])));
    } else if (!Array.isArray(zones[idx].locations) || zones[idx].locations.length === 0) {
      // Zone exists but is empty, restore locations from mock
      zones[idx].locations = JSON.parse(JSON.stringify(mockZones[mockIdx].locations));
    }
    // If it exists and has data, leave it as the user has edited it!
  }
}

function loadZones() {
  let zones;
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { zones = JSON.parse(local); }
    catch { zones = JSON.parse(JSON.stringify(mockZones)); }
  } else {
    zones = JSON.parse(JSON.stringify(mockZones));
  }
  ensureZonesPresent(zones);
  editableZones = zones;
  saveZones();
}
function saveZones() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(editableZones));
}

// === Populate Filters ===
function populateFilters() {
  // Zones
  const zoneSet = Array.from(new Set(editableZones.map(z => z.group)));
  const zoneSelect = document.getElementById("map-zone-filter");
  zoneSelect.innerHTML = '<option value="">All Zones</option>';
  zoneSet.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    zoneSelect.appendChild(opt);
  });

  // Statuses
  const statuses = ["Available", "Full", "Maintenance", "On Site", "OnSite", "Awaiting", "Shipped", "In Use"];
  const statusSelect = document.getElementById("map-status-filter");
  statusSelect.innerHTML = '<option value="">All Statuses</option>';
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusSelect.appendChild(opt);
  });
}

// === Render All Zones (standard & edit mode) ===
function renderZones(zones, editable = false) {
  const container = document.getElementById("zone-groups");
  container.innerHTML = "";
  let count = 0;
  zones.forEach((zone, zoneIdx) => {
    if (!zone.locations.length) return;
    const groupDiv = document.createElement("div");
    groupDiv.className = "zone-group";
    // Add "Add Area/Location" button per zone in edit mode
    let addAreaBtn = "";
    if (editable) {
      addAreaBtn = `<button class="add-area-btn" onclick="window.addAreaToZone(${zoneIdx})">+ Add Area</button>`;
    }
    groupDiv.innerHTML = `<div class="zone-group-title">${zone.group} ${addAreaBtn}</div>`;
    const cardsDiv = document.createElement("div");
    cardsDiv.className = "zone-group-cards";
    zone.locations.forEach((loc, locIdx) => {
      count++;
      let cardClass = "storage-card";
      let percent = 0;
      if (
        zone.group !== "Zone On Site" &&
        zone.group !== "In Transit" &&
        typeof loc.capacity === "number" &&
        typeof loc.used === "number" &&
        loc.capacity > 0
      ) {
        percent = Math.round((loc.used / loc.capacity) * 100);
        cardClass += " " + getStorageCardClass(percent);
      }
      const card = document.createElement("div");
      card.className = cardClass;
      // Render different layouts for special zones
      if (zone.group === "Zone On Site") {
        // On Site special display
        if (editable) {
          card.innerHTML = `
            <div class="storage-card-header">
              <input type="text" value="${loc.id}" style="width:140px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
              <span style="margin-left:8px;font-size:1.3em">${loc.icon}</span>
            </div>
            <div class="storage-card-desc"><input type="text" value="${loc.desc||''}" style="width:95%;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'desc')" /></div>
            ${loc.type === "CasesOnSite" ? `
              <label>Company: <input type="text" value="${loc.company || ''}" style="width:120px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'company')" /></label>
              <label>Cases: <input type="number" min="0" value="${loc.caseCount || 0}" style="width:55px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'caseCount')" /></label>
            ` : `
              <label>Assets waiting collection: <input type="number" min="0" value="${loc.assetCount || 0}" style="width:55px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'assetCount')" /></label>
            `}
            <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
          `;
        } else {
          card.innerHTML = `
            <div class="storage-card-header">
              <span style="font-size:1.3em">${loc.icon}</span>
              <span class="storage-card-id">${loc.id}</span>
            </div>
            <div class="storage-card-desc">${loc.desc || ""}</div>
            ${loc.type === "CasesOnSite"
              ? `<div class="storage-card-items"><b>Company:</b> ${loc.company||""} | <b>Cases:</b> ${loc.caseCount||0}</div>`
              : `<div class="storage-card-items"><b>Assets awaiting collection:</b> ${loc.assetCount||0}</div>`
            }
          `;
        }
      } else if (zone.group === "In Transit") {
        // In Transit special display
        if (editable) {
          if (loc.type === "Van") {
            card.innerHTML = `
              <div class="storage-card-header">
                <input type="text" value="${loc.id}" style="width:125px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
                <span style="margin-left:8px;font-size:1.3em">${loc.icon}</span>
              </div>
              <div>
                <select onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'status')">
                  <option value="Available"${loc.status === "Available" ? " selected" : ""}>Available</option>
                  <option value="In Use"${loc.status === "In Use" ? " selected" : ""}>In Use</option>
                </select>
              </div>
              ${loc.status === "In Use" ? `
                <div>
                  <label>From: <input type="datetime-local" value="${loc.booking && loc.booking.from ? toDatetimeLocal(loc.booking.from) : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'from')" /></label>
                  <label>To: <input type="datetime-local" value="${loc.booking && loc.booking.to ? toDatetimeLocal(loc.booking.to) : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'to')" /></label>
                  <label>By: <input type="text" value="${loc.booking && loc.booking.by ? loc.booking.by : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'by')" /></label>
                  <label>Company: <input type="text" value="${loc.booking && loc.booking.company ? loc.booking.company : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'company')" /></label>
                  <label>Address: <input type="text" value="${loc.booking && loc.booking.address ? loc.booking.address : ""}" onchange="window.handleVanBookingEdit(event,${zoneIdx},${locIdx},'address')" /></label>
                </div>
              ` : ""}
              <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
            `;
          } else if (loc.type === "Shipped") {
            card.innerHTML = `
              <div class="storage-card-header">
                <input type="text" value="${loc.id}" style="width:150px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
                <span style="margin-left:8px;font-size:1.3em">${loc.icon}</span>
              </div>
              <div class="storage-card-desc"><input type="text" value="${loc.desc||''}" style="width:95%;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'desc')" /></div>
              <label>Shipments: <input type="number" min="0" value="${loc.shipmentCount||0}" style="width:55px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'shipmentCount')" /></label>
              <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
            `;
          }
        } else {
          if (loc.type === "Van") {
            card.innerHTML = `
              <div class="storage-card-header">
                <span style="font-size:1.3em">${loc.icon}</span>
                <span class="storage-card-id">${loc.id}</span>
                <span class="storage-card-type">Van</span>
              </div>
              <div><b>Status:</b> ${loc.status}</div>
              ${loc.status === "In Use" && loc.booking
                ? `<div>
                    <b>From:</b> ${loc.booking.from} <b>To:</b> ${loc.booking.to}<br>
                    <b>By:</b> ${loc.booking.by} <b>Company:</b> ${loc.booking.company}<br>
                    <b>Address:</b> ${loc.booking.address}
                  </div>`
                : ""}
            `;

            // === Make JPS Van card clickable for calendar modal (ONLY non-edit mode) ===
            if (loc.id === "JPS Van") {
              card.style.cursor = "pointer";
              card.onclick = function() {
                openVanCalendarModal();
              };
            }

          } else if (loc.type === "Shipped") {
            card.innerHTML = `
              <div class="storage-card-header">
                <span style="font-size:1.3em">${loc.icon}</span>
                <span class="storage-card-id">${loc.id}</span>
              </div>
              <div class="storage-card-desc">${loc.desc || ""}</div>
              <div class="storage-card-items"><b>Shipments:</b> ${loc.shipmentCount||0}</div>
            `;
          }
        }
      } else { // Standard shelf/floor/unit areas
        const barColor = getBarColor(percent);
        if (editable) {
          card.innerHTML = `
            <div class="storage-card-header">
              <input type="text" value="${loc.id}" style="width:110px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'id')" />
              <select onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'type')">
                <option value="Shelf"${loc.type === "Shelf" ? " selected" : ""}>Shelf</option>
                <option value="Floor"${loc.type === "Floor" ? " selected" : ""}>Floor</option>
              </select>
            </div>
            <div class="storage-card-capacity-row">
              <label>Used: <input type="number" min="0" max="${loc.capacity}" value="${loc.used}" style="width:40px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'used')" /></label>
              <label>Capacity: <input type="number" min="1" value="${loc.capacity}" style="width:50px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'capacity')" /></label>
            </div>
            <div class="storage-card-bar-bg">
              <div class="storage-card-bar-fill" style="background:${barColor};width:${percent}%"></div>
            </div>
            <div class="storage-card-items">
              <label>Items: <input type="number" min="0" value="${loc.items}" style="width:40px;" onchange="window.handleZoneEdit(event,${zoneIdx},${locIdx},'items')" /></label>
            </div>
            <button class="remove-area-btn" onclick="window.removeAreaFromZone(${zoneIdx},${locIdx})">Remove</button>
          `;
        } else {
          card.innerHTML = `
            <div class="storage-card-header">
              <span class="storage-card-icon">✔️</span>
              <span class="storage-card-id">${loc.id}</span>
              <span class="storage-card-type">${loc.type}</span>
              <span class="storage-card-dot" style="background:#43a047"></span>
            </div>
            <div class="storage-card-capacity-row">
              <span class="storage-card-capacity-label">Capacity</span>
              <span class="storage-card-capacity-value">${loc.used}/${loc.capacity}</span>
            </div>
            <div class="storage-card-bar-bg">
              <div class="storage-card-bar-fill" style="background:${barColor};width:${percent}%"></div>
            </div>
            <div class="storage-card-util">${percent}% utilized</div>
            <div class="storage-card-avail">Available: ${loc.capacity - loc.used}</div>
            <div class="storage-card-items">${loc.items} items stored</div>
          `;
        }
      }
      cardsDiv.appendChild(card);
    });
    groupDiv.appendChild(cardsDiv);
    container.appendChild(groupDiv);
  });
  document.getElementById("map-locations-count").textContent = `${count} locations`;
}

// Calendar state
let vanCalMonth = null;
let vanCalYear = null;
let vanSelectedStartDate = null;

function openVanCalendarModal() {
  const today = new Date();
  vanCalYear = today.getFullYear();
  vanCalMonth = today.getMonth();
  vanSelectedStartDate = null;
  document.getElementById("van-modal-backdrop").style.display = "flex";
  renderVanCalendar();
  document.getElementById("van-user").value = sessionStorage.getItem("aw_logged_in_username") || "";
  document.getElementById("van-booking-form").reset();
  document.getElementById("van-book-btn").disabled = true;
  document.getElementById("van-date-range-row").style.display = "none";
  document.getElementById("van-one-day").checked = true;
}

function closeVanCalendarModal() {
  document.getElementById("van-modal-backdrop").style.display = "none";
}

document.getElementById("van-modal-cancel-btn").onclick = closeVanCalendarModal;
document.getElementById("van-prev-month-btn").onclick = function() {
  if (vanCalMonth === 0) {
    vanCalMonth = 11;
    vanCalYear--;
  } else {
    vanCalMonth--;
  }
  vanSelectedStartDate = null;
  renderVanCalendar();
  document.getElementById("van-booking-form").reset();
  document.getElementById("van-book-btn").disabled = true;
};
document.getElementById("van-next-month-btn").onclick = function() {
  if (vanCalMonth === 11) {
    vanCalMonth = 0;
    vanCalYear++;
  } else {
    vanCalMonth++;
  }
  vanSelectedStartDate = null;
  renderVanCalendar();
  document.getElementById("van-booking-form").reset();
  document.getElementById("van-book-btn").disabled = true;
};

// Toggle one-day vs range booking
document.getElementById("van-one-day").onchange = function() {
  if (this.checked) {
    document.getElementById("van-date-range-row").style.display = "none";
  } else {
    document.getElementById("van-date-range-row").style.display = "";
  }
};

// Render calendar and highlight bookings
function renderVanCalendar() {
  const bookings = JSON.parse(localStorage.getItem("vanBookings") || "[]");
  const container = document.getElementById("van-calendar-container");
  const monthLabel = document.getElementById("van-calendar-month-label");
  const year = vanCalYear, month = vanCalMonth;

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get all bookings for this month, with their range
  let dayBookings = {}; // date => booking object(s)
  bookings.forEach(b => {
    let from = new Date(b.date);
    let to = b.endDate ? new Date(b.endDate) : from;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0,10);
      if (!dayBookings[dateStr]) dayBookings[dateStr] = [];
      dayBookings[dateStr].push(b);
    }
  });

  let html = `<table style="width:100%;text-align:center;"><tr>`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  for(let i=0; i<firstDay.getDay(); i++) html += "<td></td>";

  for(let d=1; d<=lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const bookingsForDay = dayBookings[dateStr] || [];
    const isBooked = bookingsForDay.length > 0;
    const isSelected = vanSelectedStartDate === dateStr;

    if (isBooked) {
      // Show all bookers' names (first only if multiple)
      const bookers = bookingsForDay.map(b => b.user || "Booked");
      html += `<td style="background:#ffcccc;cursor:pointer;position:relative;" onclick="window.showVanBookingInfo('${dateStr}')">
        ${d}<br>
        <span style="color:#c00;font-size:0.9em;">${bookers.join(", ")}</span>
      </td>`;
    } else {
      html += `<td style="background:${isSelected ? "#93e4c1" : "#eaffef"};cursor:pointer;border:${isSelected?"2px solid #2563eb":"1px solid #e3eaf2"};" 
        onclick="window.selectVanBookingDate('${dateStr}')">
        ${d}
      </td>`;
    }
    if((firstDay.getDay() + d)%7 === 0) html += "</tr><tr>";
  }
  html += "</tr></table>";
  html += `<div style="margin-top:15px;color:#888;">Select the first day you want to book the van. Click any <span style="color:#2563eb; font-weight:bold;">free</span> date to begin. Booked days are clickable for details.</div>`;
  container.innerHTML = html;
}

window.selectVanBookingDate = function(dateStr) {
  vanSelectedStartDate = dateStr;
  document.getElementById("van-booking-date").value = dateStr;
  renderVanCalendar();
  document.getElementById("van-book-btn").disabled = false;
  // Autofill from/to date for one-day booking
  document.getElementById("van-to-date").value = dateStr;
};

window.showVanBookingInfo = function(dateStr) {
  const bookings = JSON.parse(localStorage.getItem("vanBookings") || "[]");
  const bookingList = bookings.filter(b => {
    const from = new Date(b.date);
    const to = b.endDate ? new Date(b.endDate) : from;
    const d = new Date(dateStr);
    return d >= from && d <= to;
  });
  let html = "";
  if (bookingList.length === 0) {
    html = "<b>No booking info found.</b>";
  } else {
    bookingList.forEach((b, i) => {
      html += `<div style="margin-bottom:12px;">
        <b>Booked by:</b> ${b.user || ""}<br>
        <b>From:</b> ${b.date} ${b.fromTime || ""}<br>
        <b>To:</b> ${b.endDate ? b.endDate : b.date} ${b.toTime || ""}<br>
        <b>Companies:</b> ${b.companies || ""}<br>
        <b>Addresses:</b> ${b.addresses || ""}<br>
        <b>Cases:</b> ${b.cases || ""}<br>
      </div>`;
    });
  }
  document.getElementById("van-booking-info-content").innerHTML = html;
  document.getElementById("van-booking-info-backdrop").style.display = "flex";
};
document.getElementById("van-booking-info-close-btn").onclick = function() {
  document.getElementById("van-booking-info-backdrop").style.display = "none";
};

// --- Booking form logic ---
document.getElementById("van-booking-form").onsubmit = function(e) {
  e.preventDefault();
  if (!vanSelectedStartDate) {
    alert("Please select a date from the calendar.");
    return;
  }
  const user = document.getElementById("van-user").value.trim();
  const fromTime = document.getElementById("van-from-time").value;
  const toTime = document.getElementById("van-to-time").value;
  const companies = document.getElementById("van-companies").value.trim();
  const addresses = document.getElementById("van-addresses").value.trim();
  const casesText = document.getElementById("van-cases").value.trim();
  const isOneDay = document.getElementById("van-one-day").checked;
  let endDate = null;
  if (!isOneDay) {
    endDate = document.getElementById("van-to-date").value;
    if (!endDate) {
      alert("Please select an end date.");
      return;
    }
    // Check that endDate is >= startDate
    if (new Date(endDate) < new Date(vanSelectedStartDate)) {
      alert("End date must be after start date.");
      return;
    }
  }

  // Check for overlap
  const bookings = JSON.parse(localStorage.getItem("vanBookings") || "[]");
  let overlap = false;
  const from = new Date(vanSelectedStartDate);
  const to = endDate ? new Date(endDate) : from;
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0,10);
    if (bookings.some(b => {
      let bFrom = new Date(b.date);
      let bTo = b.endDate ? new Date(b.endDate) : bFrom;
      // If any overlap, reject
      return d >= bFrom && d <= bTo;
    })) {
      overlap = true;
      break;
    }
  }
  if (overlap) {
    alert("One or more selected dates are already booked.");
    return;
  }

  bookings.push({
    date: vanSelectedStartDate,
    endDate: endDate || null,
    fromTime,
    toTime,
    user,
    companies,
    addresses,
    cases: casesText
  });
  localStorage.setItem("vanBookings", JSON.stringify(bookings));
  alert("Van booked!");
  closeVanCalendarModal();
};

// Expose for HTML inline handlers
window.handleZoneEdit = function(e, zoneIdx, locIdx, field) {
  let val = e.target.value;
  if (["used", "capacity", "items", "caseCount", "assetCount", "shipmentCount"].includes(field)) val = parseInt(val, 10) || 0;
  editableZones[zoneIdx].locations[locIdx][field] = val;
};
window.handleVanBookingEdit = function(e, zoneIdx, locIdx, field) {
  const val = e.target.value;
  if (!editableZones[zoneIdx].locations[locIdx].booking) editableZones[zoneIdx].locations[locIdx].booking = {};
  editableZones[zoneIdx].locations[locIdx].booking[field] = val;
};
window.addAreaToZone = function(zoneIdx) {
  const zone = editableZones[zoneIdx];
  // Default new area based on zone type
  let newArea = {};
  if (zone.group === "Zone On Site") {
    newArea = {
      id: "New Area",
      type: "CasesOnSite",
      icon: "🏢",
      status: "On Site",
      company: "",
      caseCount: 0,
      desc: ""
    };
  } else if (zone.group === "In Transit") {
    newArea = {
      id: "New Van",
      type: "Van",
      icon: "🚚",
      status: "Available",
      inUse: false,
      booking: {}
    };
  } else {
    newArea = {
      id: "New Area",
      type: "Shelf",
      icon: "✔️",
      status: "Available",
      capacity: 10,
      used: 0,
      items: 0
    };
  }
  zone.locations.push(newArea);
  saveZones();
  renderZones(editableZones, true);
};
window.removeAreaFromZone = function(zoneIdx, locIdx) {
  if(confirm("Are you sure you want to remove this area?")) {
    editableZones[zoneIdx].locations.splice(locIdx, 1);
    saveZones();
    renderZones(editableZones, true);
  }
};

function toDatetimeLocal(str) {
  // Converts "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM" to "YYYY-MM-DDTHH:MM"
  if (!str) return "";
  return str.replace(" ", "T");
}

// === Filtering Logic ===
function filterAndRender() {
  const search = document.getElementById("map-search").value.trim().toLowerCase();
  const zone = document.getElementById("map-zone-filter").value;
  const status = document.getElementById("map-status-filter").value;

  // Filter editableZones/groups
  const filtered = editableZones.map(group => {
    let filteredLocs = group.locations;
    if (zone && group.group !== zone) filteredLocs = [];
    if (status) filteredLocs = filteredLocs.filter(loc => loc.status === status);
    if (search) {
      filteredLocs = filteredLocs.filter(loc =>
        (loc.id && loc.id.toLowerCase().includes(search)) ||
        (loc.type && loc.type.toLowerCase().includes(search))
      );
    }
    return { ...group, locations: filteredLocs };
  });
  renderZones(filtered, editMode);
}

// === Event Listeners ===
function setupListeners() {
  document.getElementById("map-search").addEventListener("input", filterAndRender);
  document.getElementById("map-zone-filter").addEventListener("change", filterAndRender);
  document.getElementById("map-status-filter").addEventListener("change", filterAndRender);
}

// --- Edit Mode UI ---
let editMode = false;
function toggleEditMode() {
  editMode = !editMode;
  if (!editMode) saveZones();
  filterAndRender();
  document.getElementById("edit-storage-map-btn").textContent = editMode ? "Save Changes" : "Edit Storage Map";
}

// === Init ===
document.addEventListener("DOMContentLoaded", function () {
  loadZones();
  populateFilters();
  filterAndRender();
  setupListeners();
  const btn = document.getElementById("edit-storage-map-btn");
  if (btn) btn.onclick = toggleEditMode;
});
