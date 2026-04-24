// Mock Data for the demonstration

        const locations = [
    { name: 'King Fahd Rd, Riyadh', lat: 24.711, lng: 46.674 },
    { name: 'Olaya St. Intersection', lat: 24.694, lng: 46.683 },
    { name: 'Tahlia Street', lat: 24.696, lng: 46.685 },
    { name: 'Northern Ring Branch', lat: 24.755, lng: 46.638 },
    { name: 'Khaleej Bridge', lat: 24.685, lng: 46.726 },
    { name: 'Dammam Highway', lat: 24.795, lng: 46.812 },
    { name: 'Diplomatic Quarter', lat: 24.681, lng: 46.623 },
    { name: 'King Abdullah Rd', lat: 24.735, lng: 46.702 },
    { name: 'Imam Saud Bin Abdulaziz Rd', lat: 24.746, lng: 46.688 },
    { name: 'Prince Turki Al Awwal Rd', lat: 24.718, lng: 46.650 },
    { name: 'Airport Road', lat: 24.814, lng: 46.732 }
];

const issueTypes = [
    { type: 'Deep Pothole', severity: 'high', icon: 'warning', weight: 10 },
    { type: 'Surface Crack (Longitudinal)', severity: 'medium', icon: 'git-commit', weight: 30 },
    { type: 'Uneven Surface / Bump', severity: 'low', icon: 'analytics', weight: 45 },
    { type: 'Manhole Cover Sunken', severity: 'high', icon: 'alert-circle', weight: 5 },
    { type: 'Asphalt Degradation', severity: 'medium', icon: 'grid', weight: 10 }
];

const reportSources = [
    { name: 'Bus BT-014', type: 'IoT Sensor' },
    { name: 'Taxi Fleet #204', type: 'IoT Sensor' },
    { name: 'Municipal Van #41', type: 'IoT Sensor' },
    { name: 'Citizen App (Balady)', type: 'Citizen Report' },
    { name: '940 Call Center', type: 'Citizen Report' },
    { name: 'Road Service #02', type: 'IoT Sensor' }
];

// State
let map;
let allMarkers = []; // Leaflet marker objects
let heatLayer;
let currentMapLayer = 'markers';
const fleetMarkers = [];
let recentAlerts = [];
let ws = null;
let hwConnected = false;
let routeIndex = 0;
let liveMap = null;
let liveMarkers = [];
let liveDetectionCount = 0;
let pendingReports = [
    { id: 'RS-9402', loc: locations[0].name, type: issueTypes[0], source: reportSources[0], date: '2 Mins ago' },
    { id: 'RS-9401', loc: locations[1].name, type: issueTypes[1], source: reportSources[1], date: '15 Mins ago' },
    { id: 'RS-9400', loc: locations[3].name, type: issueTypes[2], source: reportSources[2], date: '28 Mins ago' },
    { id: 'RS-9397', loc: 'Prince Turki Rd', type: issueTypes[4], source: reportSources[5], date: '45 Mins ago' },
    { id: 'RS-9388', loc: locations[2].name, type: issueTypes[3], source: reportSources[3], date: '1 Hour ago' },
    { id: 'RS-9385', loc: 'Abi Bakr Street', type: issueTypes[1], source: reportSources[4], date: '2 Hours ago' },
    { id: 'RS-9381', loc: 'Dammam Highway', type: issueTypes[0], source: reportSources[1], date: '3 Hours ago' },
    { id: 'RS-9372', loc: 'Khurais Road', type: issueTypes[2], source: reportSources[0], date: '5 Hours ago' }
];
let handledReports = [
    { id: 'RS-9250', loc: 'King Abdullah Rd', type: 'Deep Pothole', source: { name: 'Citizen App (Balady)', type: 'Citizen Report' }, date: 'Oct 12, 2023', contractor: 'Riyadh Infra Co.', status: 'Completed' },
    { id: 'RS-9241', loc: 'Exit 10 Overpass', type: 'Surface Crack', source: { name: 'Municipal Van #14', type: 'IoT Sensor' }, date: 'Oct 10, 2023', contractor: 'City Maintenance', status: 'Completed' },
    { id: 'RS-9220', loc: 'Northern Ring Road', type: 'Uneven Surface', source: { name: '940 Call Center', type: 'Citizen Report' }, date: 'Oct 05, 2023', contractor: 'Riyadh Infra Co.', status: 'Completed' },
    { id: 'RS-9188', loc: 'Imam Saud St.', type: 'Manhole Cover Sunken', source: { name: 'Bus AT-099', type: 'IoT Sensor' }, date: 'Oct 02, 2023', contractor: 'City Maintenance', status: 'Completed' },
    { id: 'RS-9112', loc: 'Olaya St.', type: 'Uneven Surface', source: { name: 'Taxi Fleet #108', type: 'IoT Sensor' }, date: 'Sep 28, 2023', contractor: 'Riyadh Infra Co.', status: 'Completed' },
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomIssue() {
    const totalWeight = issueTypes.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const item of issueTypes) {
        if (randomNum < item.weight) return item;
        randomNum -= item.weight;
    }
    return issueTypes[0];
}

function initMap() {
    // Initialize map centered in Riyadh, Saudi Arabia
    map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([24.7136, 46.6753], 12);

    // Standard OpenStreetMap tiles for clearer, more detailed map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize Heatmap Layer (empty initially)
    heatLayer = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 17, gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'} });

    // Init Fleet Markers
    const fleetIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style=\"background:var(--primary); color:white; width:28px; height:28px; border-radius:50%; display:flex; justify-content:center; align-items:center; border:2px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.4);\"><ion-icon name=\"car-sport\"></ion-icon></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
    for(let i=0; i<4; i++) {
        const loc = getRandomItem(locations);
        const m = L.marker([loc.lat + (Math.random()-0.5)*0.03, loc.lng + (Math.random()-0.5)*0.03], {icon: fleetIcon, zIndexOffset: 1000}).addTo(map);
        fleetMarkers.push(m);
    }
}

// Generate a random alert event
function generateAlert() {
    const loc = getRandomItem(locations);
    const issue = getRandomIssue();
    const source = getRandomItem(reportSources);
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

    // Add slight offset to coordinate so they don't exactly overlap
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    const lat = loc.lat + latOffset;
    const lng = loc.lng + lngOffset;

    const newAlert = { id: `RS-${Math.floor(Math.random() * 9000) + 1000}`, loc, issue, source, time, lat, lng };
    
    // Add to alerts list
    recentAlerts.unshift(newAlert);
    
    if (issue.severity === 'high') {
        showToast('High Severity Detected', `${issue.type} detected at ${loc.name}. Urgent review recommended.`);
    }
    if(recentAlerts.length > 50) recentAlerts.pop();

    // Instead of full dashboard render, just add the new alert to the UI if it matches filter
    const filter = document.getElementById('severity-filter').value;
    if (filter === 'all' || issue.severity === filter) {
        addAlertToUI(newAlert);
    }
    
    // Add Marker to map
    addMarkerToMap(newAlert);
}

function addAlertToUI(alert) {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    const el = document.createElement('div');
    el.className = `alert-item border-${alert.issue.severity}`;
    el.onclick = () => focusOnAlert(alert.lat, alert.lng, alert.loc.name, alert.issue.type, alert.issue.severity);

    el.innerHTML = `
        <div class=\"alert-icon icon-${alert.issue.severity}\">
            <ion-icon name=\"${alert.issue.icon}-outline\"></ion-icon>
        </div>
        <div class=\"alert-content\">
            <div class=\"alert-header\">
                <span class=\"alert-title\">${alert.issue.type}</span>
                <span class=\"alert-time\">${alert.time}</span>
            </div>
            <p class=\"alert-desc\">${alert.loc.name} • ${alert.source.type}: ${alert.source.name}</p>
        </div>
    `;
    
    // Prepend and maintain a limit for maximum elements for better performance
    list.prepend(el);
    if (list.children.length > 50) {
        list.removeChild(list.lastChild);
    }
}

function addMarkerToMap(alert) {
    // Create Custom HTML Marker Icon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class=\"marker-pin ${alert.issue.severity}\"><ion-icon class=\"marker-icon\" name=\"${alert.issue.icon}-outline\"></ion-icon></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
    });

    const popupContent = `<b>${alert.issue.type}</b><br>${alert.loc.name}<br>Severity: ${alert.issue.severity.toUpperCase()}<br>
        <button class=\"action-btn\" style=\"margin-top:0.5rem; padding:0.2rem 0.5rem; font-size:0.75rem;\" 
        onclick=\"openSnapshotModal('${alert.loc.name}', '${alert.issue.type}', '${alert.issue.severity}', ${Math.floor(Math.random()*15 + 80)})\">View Snapshot</button>`;
        
    const marker = L.marker([alert.lat, alert.lng], { icon: customIcon });
    if (currentMapLayer === 'markers') marker.addTo(map);
    marker.bindPopup(popupContent);
    
    marker.severity = alert.issue.severity;
    allMarkers.push(marker);
}

function focusOnAlert(lat, lng, locName, type, sev) {
    if(map) {
        map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
        // Wait for pan then open evidence
        setTimeout(() => { openSnapshotModal(locName, type, sev, Math.floor(Math.random()*15 + 85)); }, 1200);
    }
}

window.updateReportStatus = function(selectEl) {
    const row = selectEl.closest('tr');
    const badge = row.querySelector('.status-badge');
    if (selectEl.value !== 'Unassigned') {
        badge.className = 'status-badge badge badge-warning';
        badge.innerHTML = '<ion-icon name=\"time-outline\"></ion-icon> Assigned';
    } else {
        badge.className = 'status-badge badge';
        badge.innerHTML = 'Pending';
    }
};

// Mobile Sidebar Toggle
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
};

// Modals
window.openReportModal = function() { document.getElementById('report-modal').classList.add('visible'); };
window.closeReportModal = function() { document.getElementById('report-modal').classList.remove('visible'); };
window.submitReport = function() {
    const locName = document.getElementById('report-loc').value || 'Unknown Citizen Location';
    const typeStr = document.getElementById('report-type').value;
    const issue = issueTypes.find(i => i.type === typeStr) || issueTypes[0];
    
    const newReport = {
        id: `RS-${Math.floor(Math.random() * 9000) + 1000}`,
        loc: locName,
        type: issue,
        source: { name: 'Citizen App (Balady)', type: 'Citizen Report' },
        date: 'Just now'
    };
    pendingReports.unshift(newReport);
    renderReports();
    closeReportModal();
    document.getElementById('report-loc').value = '';
};

// Filter Logic
let currentFilter = 'all';
window.filterReports = function(sev) {
    currentFilter = sev;
    renderReports();
};

// Theme Toggle
window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark-theme');
    const icon = document.querySelector('#theme-icon');
    if(document.documentElement.classList.contains('dark-theme')) {
        icon.setAttribute('name', 'sunny-outline');
    } else {
        icon.setAttribute('name', 'moon-outline');
    }
};

// Heatmap Toggle
window.toggleMapLayer = function(layer) {
    currentMapLayer = layer;
    document.getElementById('btn-markers').classList.toggle('active', layer === 'markers');
    document.getElementById('btn-markers').style.background = layer === 'markers' ? 'var(--primary)' : 'var(--bg-color)';
    document.getElementById('btn-markers').style.color = layer === 'markers' ? 'white' : 'var(--text-secondary)';
    
    document.getElementById('btn-heatmap').classList.toggle('active', layer === 'heatmap');
    document.getElementById('btn-heatmap').style.background = layer === 'heatmap' ? 'var(--primary)' : 'var(--bg-color)';
    document.getElementById('btn-heatmap').style.color = layer === 'heatmap' ? 'white' : 'var(--text-secondary)';
    
    renderDashboard();
};

// Toast Notification logic
function showToast(title, message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<ion-icon name=\"warning\" style=\"color:var(--danger); font-size:1.5rem; flex-shrink:0;\"></ion-icon>
                       <div><strong style=\"color:var(--text-primary)\">${title}</strong><br><span style=\"font-size:0.85rem; color:var(--text-secondary);\">${message}</span></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('hide'), 4000);
    setTimeout(() => toast.remove(), 4300);
}

// Snapshot Evidence logic
window.openSnapshotModal = function(loc, type, sev, conf) {
    document.getElementById('snap-loc').innerText = loc;
    document.getElementById('snap-issue').innerText = type;
    document.getElementById('snap-issue').className = `badge badge-${sev === 'high' ? 'danger' : sev === 'medium' ? 'warning' : 'success'}`;
    document.getElementById('snap-conf').innerText = `${conf}%`;
    
    const imageSources = {
        'high': [
            'Potholes%20photos/Big%20pothole.png'
        ],
        'medium': [
            'Potholes%20photos/Mid%20pothole.png'
        ],
        'low': [
            'Potholes%20photos/Small%20pothole.png'
        ]
    };
    const sources = imageSources[sev] || imageSources['low'];
    document.getElementById('snapshot-img').src = sources[Math.floor(Math.random() * sources.length)];
    
    const bbox = document.getElementById('snapshot-bbox');
    bbox.style.top = (25 + Math.random() * 20) + '%';
    bbox.style.left = (30 + Math.random() * 25) + '%';
    bbox.style.width = (20 + Math.random() * 15) + '%';
    bbox.style.height = (25 + Math.random() * 20) + '%';
    
    document.getElementById('snapshot-modal').classList.add('visible');
};
window.closeSnapshotModal = function() { document.getElementById('snapshot-modal').classList.remove('visible'); };

// ═══════════════════════════════════════════════════
//  REAL HARDWARE DATA INTEGRATION (Live Feed Tab)
//  Completely separate from the mock demo dashboard
// ═══════════════════════════════════════════════════

function initLiveMap() {
    if (!document.getElementById('live-map')) return;

    liveMap = L.map('live-map', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([24.7136, 46.6753], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(liveMap);

    // Fix map rendering when section scrolls into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) liveMap.invalidateSize();
        });
    });
    observer.observe(document.getElementById('live-feed'));
}

function connectWebSocket() {
    // Only connect if served from a web server (not file://)
    if (window.location.protocol === 'file:') {
        console.log('[HW] Running from file:// — WebSocket disabled.');
        console.log('[HW] Run the Node.js server: npm start');
        console.log('[HW] Then open: http://localhost:3000');
        return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;

    console.log(`[HW] Connecting to ${wsUrl}...`);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('[HW] ✅ Connected to Road Sense server');
        updateHWStatus(true);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleRealSensorData(data);
        } catch (e) {
            console.error('[HW] Parse error:', e);
        }
    };

    ws.onclose = () => {
        console.log('[HW] Disconnected. Reconnecting in 3s...');
        updateHWStatus(false);
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
        ws.close();
    };
}

function handleRealSensorData(data) {
    // Always update sensor readout panel
    updateSensorDisplay(data);

    if (data.type === 'heartbeat') {
        updateHWStatus(true, data.device_id);
        return;
    }

    if (data.type === 'detection') {
        updateHWStatus(true, data.device_id);

        // Increment counter
        liveDetectionCount++;
        const countEl = document.getElementById('live-detection-count');
        if (countEl) countEl.textContent = `${liveDetectionCount} detection${liveDetectionCount !== 1 ? 's' : ''}`;

        // Pick a Riyadh location (cycling through since no GPS)
        const loc = locations[routeIndex % locations.length];
        routeIndex++;

        const latOffset = (Math.random() - 0.5) * 0.015;
        const lngOffset = (Math.random() - 0.5) * 0.015;
        const lat = loc.lat + latOffset;
        const lng = loc.lng + lngOffset;

        // Map severity to issue types
        const issueMap = {
            'high':   issueTypes[0],  // Deep Pothole
            'medium': issueTypes[1],  // Surface Crack
            'low':    issueTypes[2]   // Uneven Surface / Bump
        };
        const issue = issueMap[data.severity] || issueTypes[2];

        const time = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        // ── Add marker to LIVE map only ──
        if (liveMap) {
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class=\"marker-pin ${issue.severity}\"><ion-icon class=\"marker-icon\" name=\"${issue.icon}-outline\"></ion-icon></div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                popupAnchor: [0, -35]
            });

            const popupContent = `<b>🔧 ${issue.type}</b><br>${loc.name}<br>Severity: ${data.severity.toUpperCase()}<br>Magnitude: ${Number(data.magnitude).toFixed(2)}g<br><small>Source: ${data.device_id}</small>`;

            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(liveMap);
            marker.bindPopup(popupContent);
            liveMarkers.push(marker);

            // Pan to newest detection
            liveMap.flyTo([lat, lng], 14, { animate: true, duration: 1 });
        }

        // ── Add alert to LIVE alerts list only ──
        const list = document.getElementById('live-alerts-list');
        if (list) {
            // Remove the placeholder if it's the first detection
            if (liveDetectionCount === 1) list.innerHTML = '';

            const el = document.createElement('div');
            el.className = `alert-item border-${issue.severity}`;
            el.style.cursor = 'pointer';
            el.onclick = () => {
                if (liveMap) liveMap.flyTo([lat, lng], 16, { animate: true, duration: 1 });
            };

            el.innerHTML = `
                <div class=\"alert-icon icon-${issue.severity}\">
                    <ion-icon name=\"${issue.icon}-outline\"></ion-icon>
                </div>
                <div class=\"alert-content\">
                    <div class=\"alert-header\">
                        <span class=\"alert-title\">${issue.type}</span>
                        <span class=\"alert-time\">${time}</span>
                    </div>
                    <p class=\"alert-desc\">${loc.name} • 🔧 ${data.device_id} • <strong>${Number(data.magnitude).toFixed(2)}g</strong></p>
                </div>
            `;

            list.prepend(el);
            if (list.children.length > 50) list.removeChild(list.lastChild);
        }

        // Show toast
        showToast(
            `🔧 Hardware: ${data.severity.toUpperCase()}`,
            `${issue.type} — ${data.device_id} (${Number(data.magnitude).toFixed(2)}g)`
        );
    }
}

function updateHWStatus(connected, deviceId) {
    hwConnected = connected;
    const badge = document.getElementById('hw-status');
    const dot = document.getElementById('hw-dot');
    const text = document.getElementById('hw-status-text');
    if (!badge || !dot || !text) return;

    if (connected) {
        badge.style.background = 'var(--success-bg)';
        badge.style.color = 'var(--success)';
        dot.style.background = 'var(--success)';
        dot.style.animation = 'pulse 2s infinite';
        text.textContent = deviceId ? `${deviceId} Online` : 'Server Connected';
    } else {
        badge.style.background = 'var(--danger-bg)';
        badge.style.color = 'var(--danger)';
        dot.style.background = 'var(--danger)';
        dot.style.animation = 'none';
        text.textContent = 'Disconnected';
    }
}

function updateSensorDisplay(data) {
    const ax = document.getElementById('sensor-ax');
    const ay = document.getElementById('sensor-ay');
    const az = document.getElementById('sensor-az');
    const mag = document.getElementById('sensor-mag');

    if (ax) ax.textContent = data.accel_x != null ? Number(data.accel_x).toFixed(3) : '--';
    if (ay) ay.textContent = data.accel_y != null ? Number(data.accel_y).toFixed(3) : '--';
    if (az) az.textContent = data.accel_z != null ? Number(data.accel_z).toFixed(3) : '--';
    if (mag) {
        const m = Number(data.magnitude);
        mag.textContent = m ? m.toFixed(3) : '--';
        mag.style.color = m > 3.0 ? 'var(--danger)' : m > 2.0 ? 'var(--warning)' : 'var(--success)';
    }
}

// Export CSV
window.exportCSV = function() {
    let csvContent = \"data:text/csv;charset=utf-8,\";
    csvContent += \"Report ID,Location,Issue Type,Severity,Source,Date\\n\";
    pendingReports.forEach(r => {
        csvContent += `${r.id},\"${r.loc}\",\"${r.type.type}\",${r.type.severity},\"${r.source.name}\",${r.date}\\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement(\"a\");
    link.setAttribute(\"href\", encodedUri);
    link.setAttribute(\"download\", \"road_sense_reports.csv\");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function renderDashboard() {
    // Filter logic for map
    const filter = document.getElementById('severity-filter').value;
    
    if (map && allMarkers.length > 0) {
        if (currentMapLayer === 'heatmap') {
            // Update heatmap data
            const heatPoints = recentAlerts
                .filter(a => filter === 'all' || a.issue.severity === filter)
                .map(a => [a.lat, a.lng, a.issue.weight * 0.1]); // intensity
            heatLayer.setLatLngs(heatPoints);
            if (!map.hasLayer(heatLayer)) map.addLayer(heatLayer);
            allMarkers.forEach(m => map.removeLayer(m));
        } else {
            if (map.hasLayer(heatLayer)) map.removeLayer(heatLayer);
            allMarkers.forEach(marker => {
                if(filter === 'all' || marker.severity === filter) {
                    if(!map.hasLayer(marker)) map.addLayer(marker);
                } else {
                    if(map.hasLayer(marker)) map.removeLayer(marker);
                }\n            });\n        }\n    }\n\n    // Render Alerts List\n    const list = document.getElementById('alerts-list');\n    if (!list) return;\n\n    let listHtml = '';\n    recentAlerts.forEach((a) => {\n        // Only show if it matches filter\n        if (filter !== 'all' && a.issue.severity !== filter) return;\n\n        listHtml += `\n            <div class=\"alert-item border-${a.issue.severity}\" \n                 onclick=\"focusOnAlert(${a.lat}, ${a.lng}, '${a.loc.name.replace(/'/g, \"\\\\'\")}', '${a.issue.type.replace(/'/g, \"\\\\'\")}', '${a.issue.severity}')\">\n                <div class=\"alert-icon icon-${a.issue.severity}\">\n                    <ion-icon name=\"${a.issue.icon}-outline\"></ion-icon>\n                </div>\n                <div class=\"alert-content\">\n                    <div class=\"alert-header\">\n                        <span class=\"alert-title\">${a.issue.type}</span>\n                        <span class=\"alert-time\">${a.time}</span>\n                    </div>\n                    <p class=\"alert-desc\">${a.loc.name} • ${a.source.type}: ${a.source.name}</p>\n                </div>\n            </div>\n        `;\n    });\n    list.innerHTML = listHtml;\n}\n\nfunction renderReports() {\n    // Pending\n    const pendingBody = document.getElementById('pending-tbody');\n    pendingBody.innerHTML = '';\n    \n    const filteredPending = pendingReports.filter(r => currentFilter === 'all' || r.type.severity === currentFilter);\n    \n    if (filteredPending.length === 0) {\n        pendingBody.innerHTML = `<tr><td colspan=\"8\" style=\"text-align:center; color:var(--text-muted);\">No pending reports match the selected filter.</td></tr>`;\n    } else {\n        let htmlContent = '';\n        filteredPending.forEach(r => {\n            htmlContent += `\n                <tr>\n                    <td><strong>${r.id}</strong></td>\n                    <td>${r.loc}</td>\n                    <td><span class=\"badge badge-${r.type.severity === 'high' ? 'danger' : (r.type.severity === 'medium' ? 'warning' : 'success')}\">${r.type.type}</span></td>\n                    <td><span style=\"font-size: 0.8rem; font-weight: 500; color: ${r.source.type === 'IoT Sensor' ? 'var(--primary)' : 'var(--warning)'};\"><ion-icon name=\"${r.source.type === 'IoT Sensor' ? 'hardware-chip-outline' : 'people-outline'}\"></ion-icon> ${r.source.name}</span></td>\n                    <td style=\"color:var(--text-secondary); font-size: 0.9rem;\">${r.date}</td>\n                    <td>\n                        <select class=\"assignee-select\" onchange=\"updateReportStatus(this)\">\n                            <option value=\"Unassigned\">Unassigned</option>\n                            <option value=\"Riyadh Infra Co.\">Riyadh Infra Co.</option>\n                            <option value=\"City Maintenance\">City Maintenance</option>\n                            <option value=\"Fast Paving Ltd\">Fast Paving Ltd</option>\n                        </select>\n                    </td>\n                    <td><span class=\"status-badge badge\" style=\"margin:0;\">Pending</span></td>\n                    <td><button class=\"action-btn\" style=\"background:var(--surface-solid); color:var(--text-secondary); border:1px solid var(--border-color); padding:0.4rem;\" title=\"View Details\" onclick=\"openSnapshotModal('${r.loc}', '${r.type.type}', '${r.type.severity}', ${Math.floor(Math.random()*15 + 80)})\"><ion-icon name=\"eye-outline\" style=\"font-size:1.2rem; margin:0;\"></ion-icon></button></td>\n                </tr>\n            `;\n        });\n        pendingBody.innerHTML = htmlContent;\n    }\n\n    // Handled\n    const handledBody = document.getElementById('handled-tbody');\n    handledBody.innerHTML = '';\n    let handledHtml = '';\n    handledReports.forEach(r => {\n        handledHtml += `\n            <tr>\n                <td><strong>${r.id}</strong></td>\n                <td>${r.loc}</td>\n                <td>${r.type}</td>\n                <td><span style=\"font-size: 0.8rem; font-weight: 500; color: ${r.source.type === 'IoT Sensor' ? 'var(--primary)' : 'var(--warning)'};\"><ion-icon name=\"${r.source.type === 'IoT Sensor' ? 'hardware-chip-outline' : 'people-outline'}\"></ion-icon> ${r.source.type}</span></td>\n                <td>${r.source.name}</td>\n                <td>${r.date}</td>\n                <td>${r.contractor}</td>\n                <td><span class=\"badge badge-success\"><ion-icon name=\"checkmark-circle-outline\"></ion-icon> ${r.status}</span></td>\n                <td><button class=\"action-btn\" style=\"background:var(--surface-solid); color:var(--text-secondary); border:1px solid var(--border-color); padding:0.4rem;\" title=\"View Details\" onclick=\"openSnapshotModal('${r.loc}', '${r.type}', 'low', 99)\"><ion-icon name=\"eye-outline\" style=\"font-size:1.2rem; margin:0;\"></ion-icon></button></td>\n            </tr>\n        `;\n    });\n    handledBody.innerHTML = handledHtml;\n}\n\nfunction initCharts() {\n    // Deterioration Forecast Area Chart (Simplified & understandable)\n    const deteriorationOptions = {\n        series: [{\n            name: 'Forecasted High-Risk Defects',\n            data: [24, 38, 65, 110, 165, 230]\n        }],\n        chart: {\n            height: 380,\n            type: 'area',\n            toolbar: { show: false },\n            fontFamily: 'Inter, sans-serif',\n            animations: { enabled: true, easing: 'easeinout', speed: 800 }\n        },\n        stroke: { curve: 'smooth', width: 3 },\n        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] } },\n        colors: ['#ef4444'],\n        dataLabels: { enabled: false },\n        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],\n        xaxis: { \n            title: { text: 'Upcoming Months', style: { color: '#94a3b8', fontSize: '13px' } },\n            labels: { style: { colors: '#475569' } }\n        },\n        yaxis: { \n            title: { text: 'Total Active Unrepaired Defects', style: { color: '#94a3b8', fontSize: '13px' } },\n            labels: { style: { colors: '#475569' } }\n        },\n        annotations: {\n            yaxis: [{\n                y: 100,\n                borderColor: '#f59e0b',\n                strokeDashArray: 4,\n                label: { borderColor: '#f59e0b', style: { color: '#fff', background: '#f59e0b' }, text: 'City Maintenance Threshold' }\n            }]\n        },\n        tooltip: { theme: 'light' }\n    };\n\n    const deteriorationChart = new ApexCharts(document.querySelector(\"#deteriorationChart\"), deteriorationOptions);\n    deteriorationChart.render();\n\n    // Distribution Chart (Donut)\n    const distributionOptions = {\n        series: [45, 30, 15, 10],\n        chart: { type: 'donut', height: 260, fontFamily: 'Inter, sans-serif' },\n        labels: ['Uneven Surface', 'Surface Crack', 'Deep Pothole', 'Degradation'],\n        colors: ['#2563eb', '#f59e0b', '#ef4444', '#64748b'],\n        plotOptions: { pie: { donut: { size: '65%' } } },\n        dataLabels: { enabled: false },\n        legend: { position: 'bottom', fontSize: '11px', itemMargin: { horizontal: 5, vertical: 0 } },\n        stroke: { show: false }\n    };\n    new ApexCharts(document.querySelector(\"#distributionChart\"), distributionOptions).render();\n\n    // Uptime Radial Chart\n    const uptimeOptions = {\n        series: [99.8],\n        chart: { height: 260, type: 'radialBar', fontFamily: 'Inter, sans-serif' },\n        plotOptions: {\n            radialBar: {\n                hollow: { size: '65%' },\n                dataLabels: {\n                    name: { show: true, fontSize: '13px', color: '#475569', offsetY: -10 },\n                    value: { show: true, fontSize: '2rem', fontWeight: 700, color: '#10b981', formatter: function(val) { return val + \"%\" } }\n                }\n            }\n        },\n        labels: ['Fleet Uptime'],\n        colors: ['#10b981'],\n        stroke: { lineCap: 'round' }\n    };\n\n    const uptimeChart = new ApexCharts(document.querySelector(\"#uptimeChart\"), uptimeOptions);\n    uptimeChart.render();\n}\n\n// Interactivity Initialization\ndocument.addEventListener('DOMContentLoaded', () => {\n    \n    // Init Leaflet map\n    initMap();\n    initCharts();\n\n    // Initial Data loading - Generate exactly 18 alerts to populate the map densely\n    for(let i=0; i<18; i++) generateAlert();\n    renderReports();\n\n    // Simulate Live Updates\n    setInterval(() => {\n        if(Math.random() > 0.4) generateAlert(); // Randomly generate events\n    }, 5500);\n\n    // Simulate Fleet Movement\n    setInterval(() => {\n        fleetMarkers.forEach(m => {\n            const pos = m.getLatLng();\n            m.setLatLng([pos.lat + (Math.random()-0.5)*0.002, pos.lng + (Math.random()-0.5)*0.002]);\n        });\n    }, 2000);\n\n    // Filter event\n    document.getElementById('severity-filter').addEventListener('change', renderDashboard);\n\n    // Tab Navigation\n    const tabBtns = document.querySelectorAll('.tab-btn');\n    const tabContents = document.querySelectorAll('.tab-content');\n\n    tabBtns.forEach(btn => {\n        btn.addEventListener('click', () => {\n            // Remove active classes\n            tabBtns.forEach(b => b.classList.remove('active'));\n            tabContents.forEach(c => c.classList.remove('active'));\n\n            // Add active class\n            btn.classList.add('active');\n            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');\n        });\n    });\n\n    // Close sidebar on mobile link click\n    document.querySelectorAll('.nav-links a').forEach(link => {\n        link.addEventListener('click', () => {\n            if (window.innerWidth <= 768) {\n                document.getElementById('sidebar').classList.remove('open');\n                document.getElementById('sidebar-overlay').classList.remove('visible');\n            }\n        });\n    });\n\n    // Highly Reliable Scroll Spy using Intersection Observer\n    const sections = document.querySelectorAll('section[id]');\n    const navLinks = document.querySelectorAll('.nav-links a');\n\n    const observerOptions = {\n        root: null,\n        rootMargin: '-30% 0px -50% 0px', // Trigger when section is in the top-middle of the screen\n        threshold: 0\n    };\n\n    const observer = new IntersectionObserver((entries) => {\n        entries.forEach(entry => {\n            if (entry.isIntersecting) {\n                const currentId = entry.target.getAttribute('id');\n                navLinks.forEach(a => {\n                    a.classList.remove('active');\n                    if (a.getAttribute('href') === `#${currentId}`) {\n                        a.classList.add('active');\n                    }\n                });\n            }\n        });\n    }, observerOptions);\n\n    sections.forEach(section => observer.observe(section));\n\n    // Throttled Scroll Listener using requestAnimationFrame for smoothness\n    let isTicking = false;\n    window.addEventListener('scroll', () => {\n        if (!isTicking) {\n            window.requestAnimationFrame(() => {\n                // Potential scroll-based animations could go here\n                isTicking = false;\n            });\n            isTicking = true;\n        }\n    });\n\n    // Initial Live Map init\n    initLiveMap();\n    connectWebSocket();\n});\n