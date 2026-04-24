// Mock Data for the demonstration
const locations = [
    { name: 'King Fahad Road', lat: 24.7136, lng: 46.6753 },
    { name: 'Olaya Street', lat: 24.7003, lng: 46.6711 },
    { name: 'Tahlia Street', lat: 24.6942, lng: 46.6836 },
    { name: 'Makkah Al Mukarramah Rd', lat: 24.6644, lng: 46.6753 },
    { name: 'King Abdullah Road', lat: 24.7500, lng: 46.7000 },
    { name: 'Diplomatic Quarter', lat: 24.6755, lng: 46.6264 },
    { name: 'Eastern Ring Road', lat: 24.7450, lng: 46.7600 },
    { name: 'Prince Turki Al Awwal Rd', lat: 24.7215, lng: 46.6345 }
];

const issueTypes = [
    { type: 'Deep Pothole', severity: 'high', icon: 'warning-outline' },
    { type: 'Surface Crack', severity: 'medium', icon: 'git-branch-outline' },
    { type: 'Uneven Surface', severity: 'low', icon: 'stats-chart-outline' },
    { type: 'Manhole Cover', severity: 'high', icon: 'alert-circle-outline' }
];

const imageSources = {
    high: [
        'Potholes%20photos/Pothole%201.jpg',
        'Potholes%20photos/Pothole%202.jpg',
        'Potholes%20photos/Pothole%203.jpg',
        'Potholes%20photos/Pothole%204.jpg',
        'Potholes%20photos/Pothole%205.jpg',
        'Potholes%20photos/Pothole%206.jpg',
        'Potholes%20photos/Pothole%207.jpg',
        'Potholes%20photos/Pothole%208.jpg',
        'Potholes%20photos/Pothole%209.jpg',
        'Potholes%20photos/Pothole%2010.jpg'
    ],
    medium: [
        'Potholes%20photos/Pothole%2011.jpg',
        'Potholes%20photos/Pothole%2012.jpg'
    ],
    low: [
        'Potholes%20photos/Pothole%2013.jpg',
        'Potholes%20photos/Pothole%2014.jpg'
    ]
};

let map, heatmapLayer, markerLayer;
let alerts = [];
let reports = [];
let fleetMarkers = [];

// Theme Management
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    const isDark = body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        body.removeAttribute('data-theme');
        icon.setAttribute('name', 'moon-outline');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.setAttribute('name', 'sunny-outline');
        localStorage.setItem('theme', 'dark');
    }
}

// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('visible');
}

// Map Initialization
function initMap() {
    map = L.map('map', {
        center: [24.7136, 46.6753],
        zoom: 13,
        zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Modern styled tiles (Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);
    heatmapLayer = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 17 }).addTo(map);

    // Initial Fleet Simulation
    for(let i=0; i<5; i++) {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const marker = L.circleMarker([loc.lat + (Math.random()-0.5)*0.01, loc.lng + (Math.random()-0.5)*0.01], {
            radius: 6,
            fillColor: "#2563eb",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        marker.bindTooltip(`Fleet Unit RS-0${i+1} (Online)`, { permanent: false, direction: 'top' });
        fleetMarkers.push(marker);
    }
}

function toggleMapLayer(type) {
    const btnMarkers = document.getElementById('btn-markers');
    const btnHeatmap = document.getElementById('btn-heatmap');

    if (type === 'markers') {
        if (!map.hasLayer(markerLayer)) {
            map.addLayer(markerLayer);
            btnMarkers.classList.add('active');
            btnMarkers.style.background = 'var(--primary)';
            btnMarkers.style.color = 'white';
        } else {
            map.removeLayer(markerLayer);
            btnMarkers.classList.remove('active');
            btnMarkers.style.background = 'var(--bg-color)';
            btnMarkers.style.color = 'var(--text-secondary)';
        }
    } else {
        if (!map.hasLayer(heatmapLayer)) {
            map.addLayer(heatmapLayer);
            btnHeatmap.classList.add('active');
            btnHeatmap.style.background = 'var(--primary)';
            btnHeatmap.style.color = 'white';
        } else {
            map.removeLayer(heatmapLayer);
            btnHeatmap.classList.remove('active');
            btnHeatmap.style.background = 'var(--bg-color)';
            btnHeatmap.style.color = 'var(--text-secondary)';
        }
    }
}

function generateAlert() {
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const issue = issueTypes[Math.floor(Math.random() * issueTypes.length)];
    const id = Math.floor(1000 + Math.random() * 9000);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const alert = {
        id, loc, issue, time,
        lat: loc.lat + (Math.random() - 0.5) * 0.02,
        lng: loc.lng + (Math.random() - 0.5) * 0.02
    };

    alerts.unshift(alert);
    if (alerts.length > 20) alerts.pop();

    renderDashboard();
}

function renderDashboard() {
    const filter = document.getElementById('severity-filter').value;
    const listContainer = document.getElementById('alerts-list');
    
    // Clear Map
    markerLayer.clearLayers();
    const heatmapData = [];

    // Filtered alerts
    const recentAlerts = alerts.slice(0, 8);
    let listHtml = '';

    recentAlerts.forEach((a) => {
        // Only show if it matches filter
        if (filter !== 'all' && a.issue.severity !== filter) return;

        listHtml += `
            <div class="alert-item border-${a.issue.severity}" 
                 onclick="focusOnAlert(${a.lat}, ${a.lng}, '${a.loc.name.replace(/'/g, "\\'")}', '${a.issue.type.replace(/'/g, "\\'")}', '${a.issue.severity}')">
                <div class="alert-icon"><ion-icon name="${a.issue.icon}"></ion-icon></div>
                <div class="alert-info">
                    <h4>${a.issue.type} detected</h4>
                    <p>${a.loc.name} • ${a.time}</p>
                </div>
                <span class="badge badge-${a.issue.severity === 'high' ? 'danger' : a.issue.severity === 'medium' ? 'warning' : 'success'}">${a.issue.severity}</span>
            </div>
        `;
    });

    // Add all filtered markers to map
    alerts.forEach(a => {
        if (filter !== 'all' && a.issue.severity !== filter) return;
        
        const color = a.issue.severity === 'high' ? '#ef4444' : a.issue.severity === 'medium' ? '#f59e0b' : '#2563eb';
        
        const m = L.circleMarker([a.lat, a.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(markerLayer);

        // Map Popups Enhancement
        m.bindPopup(`
            <div style="font-family:'Inter', sans-serif; padding:5px;">
                <h4 style="margin:0 0 5px 0; color:${color};">${a.issue.type}</h4>
                <p style="margin:0 0 10px 0; font-size:12px; color:#64748b;">${a.loc.name}<br>Detected at ${a.time}</p>
                <button class="action-btn" style="width:100%; font-size:11px; padding:4px;" onclick="openSnapshotModal('${a.loc.name.replace(/'/g, "\\'")}', '${a.issue.type.replace(/'/g, "\\'")}', '${a.issue.severity}', ${a.id})">View Evidence</button>
            </div>
        `);

        heatmapData.push([a.lat, a.lng, a.issue.severity === 'high' ? 1.0 : 0.5]);
    });

    heatmapLayer.setLatLngs(heatmapData);
    listContainer.innerHTML = listHtml || '<p style="text-align:center; padding:2rem; color:var(--text-muted);">No detections matching filter</p>';
}

function focusOnAlert(lat, lng, locName, type, severity) {
    map.flyTo([lat, lng], 15, { duration: 1.5 });
    // Find the marker and open its popup
    markerLayer.eachLayer(layer => {
        if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
            layer.openPopup();
        }
    });
}

function openSnapshotModal(loc, type, severity, id) {
    const modal = document.getElementById('snapshot-modal');
    const img = document.getElementById('snapshot-img');
    const locSpan = document.getElementById('snap-loc');
    const issueSpan = document.getElementById('snap-issue');
    const bbox = document.getElementById('snapshot-bbox');

    // Get random image from severity category
    const sources = imageSources[severity] || imageSources.low;
    const randomImg = sources[Math.floor(Math.random() * sources.length)];
    
    img.src = randomImg;
    locSpan.innerText = loc;
    issueSpan.innerText = type;
    issueSpan.className = `badge badge-${severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'success'}`;
    
    // Randomize bbox position for realism
    const top = 30 + Math.random() * 40;
    const left = 20 + Math.random() * 50;
    bbox.style.top = top + '%';
    bbox.style.left = left + '%';
    bbox.style.width = (15 + Math.random() * 15) + '%';
    bbox.style.height = (10 + Math.random() * 15) + '%';

    modal.classList.add('visible');
}

function closeSnapshotModal() {
    document.getElementById('snapshot-modal').classList.remove('visible');
}

// Report System
function openReportModal() {
    document.getElementById('report-modal').classList.add('visible');
}

function closeReportModal() {
    document.getElementById('report-modal').classList.remove('visible');
}

function submitReport() {
    const loc = document.getElementById('report-loc').value;
    const type = document.getElementById('report-type').value;

    if (!loc) {
        showToast("Please enter a location", "warning");
        return;
    }

    const newReport = {
        id: 'R-' + Math.floor(1000 + Math.random() * 9000),
        loc,
        type,
        source: 'Citizen App',
        date: new Date().toLocaleDateString(),
        assignee: 'Unassigned',
        status: 'Pending'
    };

    reports.unshift(newReport);
    renderReports();
    closeReportModal();
    showToast("Report submitted successfully!", "success");
    
    // Also add to map temporarily as a citizen report
    const citizenMarker = L.circleMarker([24.7136 + (Math.random()-0.5)*0.05, 46.6753 + (Math.random()-0.5)*0.05], {
        radius: 10,
        fillColor: "#6366f1",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(markerLayer);
    citizenMarker.bindPopup(`<b>Citizen Report:</b> ${type}<br>${loc}`);
}

function showToast(msg, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'border-low' : 'border-high'}`;
    toast.innerHTML = `
        <ion-icon name="${type === 'success' ? 'checkmark-circle' : 'alert-circle'}" style="font-size:1.5rem; color:${type === 'success' ? 'var(--success)' : 'var(--danger)'}"></ion-icon>
        <div>
            <p style="margin:0; font-weight:600; font-size:0.9rem;">${msg}</p>
        </div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function renderReports() {
    const pendingBody = document.getElementById('pending-tbody');
    const handledBody = document.getElementById('handled-tbody');
    
    // Initial data if empty
    if(reports.length === 0) {
        reports = [
            { id: 'R-4821', loc: 'King Fahad / Tahlia', type: 'Deep Pothole', source: 'Fleet RS-02', date: '2024-03-20', assignee: 'Eng. Ahmed', status: 'Pending' },
            { id: 'R-4819', loc: 'Olaya St North', type: 'Surface Crack', source: 'Citizen App', date: '2024-03-19', assignee: 'Unassigned', status: 'Pending' },
            { id: 'R-4790', loc: 'Airport Rd Exit 5', type: 'Uneven Surface', source: 'Fleet RS-04', date: '2024-03-18', assignee: 'Eng. Sarah', status: 'Pending' }
        ];
    }

    const handledReports = [
        { id: 'R-4501', loc: 'Exit 10 / Ring Rd', type: 'Deep Pothole', source: {name: 'Fleet RS-01'}, date: '2024-03-15', contractor: 'Al-Rashid Const.', status: 'Repaired' },
        { id: 'R-4482', loc: 'Makkah Rd Tunnel', type: 'Surface Crack', source: {name: 'Citizen App'}, date: '2024-03-12', contractor: 'City Maintenance', status: 'Repaired' }
    ];

    let pendingHtml = '';
    reports.forEach(r => {
        const severity = r.type.includes('Pothole') ? 'high' : r.type.includes('Crack') ? 'medium' : 'low';
        pendingHtml += `
            <tr>
                <td><strong>#${r.id}</strong></td>
                <td>${r.loc}</td>
                <td><span class="badge badge-${severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'success'}">${r.type}</span></td>
                <td>${r.source}</td>
                <td>${r.date}</td>
                <td>
                    <select class="assignee-select">
                        <option ${r.assignee === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
                        <option ${r.assignee === 'Eng. Ahmed' ? 'selected' : ''}>Eng. Ahmed</option>
                        <option ${r.assignee === 'Eng. Sarah' ? 'selected' : ''}>Eng. Sarah</option>
                    </select>
                </td>
                <td><span class="badge" style="background:var(--bg-color); color:var(--text-secondary);">${r.status}</span></td>
                <td><button class="action-btn" onclick="openSnapshotModal('${r.loc.replace(/'/g, "\\'")}', '${r.type.replace(/'/g, "\\'")}', '${severity}', 0)">View</button></td>
            </tr>
        `;
    });
    pendingBody.innerHTML = pendingHtml;

    let handledHtml = '';
    handledReports.forEach(r => {
        handledHtml += `
            <tr>
                <td><strong>#${r.id}</strong></td>
                <td>${r.loc}</td>
                <td>${r.type}</td>
                <td>${r.source.name}</td>
                <td>${r.date}</td>
                <td>${r.contractor}</td>
                <td><span class="badge badge-success"><ion-icon name="checkmark-circle-outline"></ion-icon> ${r.status}</span></td>
                <td><button class="action-btn" style="background:var(--surface-solid); color:var(--text-secondary); border:1px solid var(--border-color); padding:0.4rem;" title="View Details" onclick="openSnapshotModal('${r.loc}', '${r.type}', 'low', 99)"><ion-icon name="eye-outline" style="font-size:1.2rem; margin:0;"></ion-icon></button></td>
            </tr>
        `;
    });
    handledBody.innerHTML = handledHtml;
}

function initCharts() {
    // Deterioration Forecast Area Chart (Simplified & understandable)
    const deteriorationOptions = {
        series: [{
            name: 'Forecasted High-Risk Defects',
            data: [24, 38, 65, 110, 165, 230]
        }],
        chart: {
            height: 380,
            type: 'area',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] } },
        colors: ['#ef4444'],
        dataLabels: { enabled: false },
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        xaxis: { 
            title: { text: 'Upcoming Months', style: { color: '#94a3b8', fontSize: '13px' } },
            labels: { style: { colors: '#475569' } }
        },
        yaxis: { 
            title: { text: 'Total Active Unrepaired Defects', style: { color: '#94a3b8', fontSize: '13px' } },
            labels: { style: { colors: '#475569' } }
        },
        annotations: {
            yaxis: [{
                y: 100,
                borderColor: '#f59e0b',
                strokeDashArray: 4,
                label: { borderColor: '#f59e0b', style: { color: '#fff', background: '#f59e0b' }, text: 'City Maintenance Threshold' }
            }]
        },
        tooltip: { theme: 'light' }
    };

    const deteriorationChart = new ApexCharts(document.querySelector("#deteriorationChart"), deteriorationOptions);
    deteriorationChart.render();

    // Distribution Chart (Donut)
    const distributionOptions = {
        series: [45, 30, 15, 10],
        chart: { type: 'donut', height: 260, fontFamily: 'Inter, sans-serif' },
        labels: ['Uneven Surface', 'Surface Crack', 'Deep Pothole', 'Degradation'],
        colors: ['#2563eb', '#f59e0b', '#ef4444', '#64748b'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', fontSize: '11px', itemMargin: { horizontal: 5, vertical: 0 } },
        stroke: { show: false }
    };
    new ApexCharts(document.querySelector("#distributionChart"), distributionOptions).render();

    // Uptime Radial Chart
    const uptimeOptions = {
        series: [99.8],
        chart: { height: 260, type: 'radialBar', fontFamily: 'Inter, sans-serif' },
        plotOptions: {
            radialBar: {
                hollow: { size: '65%' },
                dataLabels: {
                    name: { show: true, fontSize: '13px', color: '#475569', offsetY: -10 },
                    value: { show: true, fontSize: '2rem', fontWeight: 700, color: '#10b981', formatter: function(val) { return val + "%" } }
                }
            }
        },
        labels: ['Fleet Uptime'],
        colors: ['#10b981'],
        stroke: { lineCap: 'round' }
    };

    const uptimeChart = new ApexCharts(document.querySelector("#uptimeChart"), uptimeOptions);
    uptimeChart.render();
}

// Interactivity Initialization
document.addEventListener('DOMContentLoaded', () => {
    
    // Init Leaflet map
    initMap();
    initCharts();

    // Initial Data loading - Generate exactly 18 alerts to populate the map densely
    for(let i=0; i<18; i++) generateAlert();
    renderReports();

    // Simulate Live Updates
    setInterval(() => {
        if(Math.random() > 0.4) generateAlert(); // Randomly generate events
    }, 5500);

    // Simulate Fleet Movement
    setInterval(() => {
        fleetMarkers.forEach(m => {
            const pos = m.getLatLng();
            m.setLatLng([pos.lat + (Math.random()-0.5)*0.002, pos.lng + (Math.random()-0.5)*0.002]);
        });
    }, 2000);

    // Filter event
    document.getElementById('severity-filter').addEventListener('change', renderDashboard);

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Close sidebar on mobile link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('sidebar-overlay').classList.remove('visible');
            }
        });
    });

    // Highly Reliable Scroll Spy using Intersection Observer
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px', // Trigger when section is in the top-middle of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === `#${currentId}`) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Throttled Scroll Listener using requestAnimationFrame for smoothness
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const scrollPos = window.scrollY;
                const windowHeight = window.innerHeight;
                const offsetHeight = document.body.offsetHeight;

                // Absolute bottom check
                if ((windowHeight + Math.round(scrollPos)) >= offsetHeight - 20) {
                    navLinks.forEach(a => a.classList.remove('active'));
                    document.querySelector('.nav-links a[href="#live-feed"]').classList.add('active');
                } else if (scrollPos < 100) {
                    // Absolute top check
                    navLinks.forEach(a => a.classList.remove('active'));
                    const dashboardLink = document.querySelector('.nav-links a[href="#dashboard"]');
                    if(dashboardLink) dashboardLink.classList.add('active');
                }
                
                isTicking = false;
            });
            isTicking = true;
        }
    });

    // 🚀🚀 Initialize Live Feed map + WebSocket 🚀🚀
    initLiveMap();
    connectWebSocket();
});

// ═══ LIVE HARDWARE FEED LOGIC (WebSocket) ═══
let liveMap, liveMarkerLayer;
let ws;
let detectionCount = 0;

function initLiveMap() {
    liveMap = L.map('live-map', {
        center: [24.7136, 46.6753],
        zoom: 14,
        zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(liveMap);
    liveMarkerLayer = L.layerGroup().addTo(liveMap);
    
    // Add a pulsing blue dot for "Current Fleet Position"
    const fleetPos = L.circleMarker([24.7136, 46.6753], {
        radius: 8, fillColor: '#2563eb', color: '#fff', weight: 3, opacity: 1, fillOpacity: 0.8
    }).addTo(liveMap);
    fleetPos.bindTooltip("Your Hardware Unit (RS-LIVE)", { permanent: true, direction: 'right' });
}

function connectWebSocket() {
    const statusText = document.getElementById('hw-status-text');
    const statusDot = document.getElementById('hw-dot');
    const statusBadge = document.getElementById('hw-status');

    // Try to connect to local server
    ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
        statusText.innerText = "Connected (Live)";
        statusBadge.style.background = "#dcfce7";
        statusBadge.style.color = "#10b981";
        showToast("Hardware connection established", "success");
    };

    ws.onclose = () => {
        statusText.innerText = "Disconnected";
        statusBadge.style.background = "var(--danger-bg)";
        statusBadge.style.color = "var(--danger)";
        // Attempt reconnect after 5s
        setTimeout(connectWebSocket, 5000);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'telemetry') {
            updateTelemetry(data.data);
        } else if (data.type === 'detection') {
            handleLiveDetection(data.data);
        }
    };
}

function updateTelemetry(data) {
    document.getElementById('sensor-ax').innerText = data.ax.toFixed(3);
    document.getElementById('sensor-ay').innerText = data.ay.toFixed(3);
    document.getElementById('sensor-az').innerText = data.az.toFixed(3);
    document.getElementById('sensor-mag').innerText = data.mag.toFixed(3);
    
    // Optional: Subtle vibration effect on dashboard if magnitude is high
    if (data.mag > 1.5) {
        document.body.style.transform = `translate(${(Math.random()-0.5)*2}px, ${(Math.random()-0.5)*2}px)`;
        setTimeout(() => document.body.style.transform = 'none', 50);
    }
}

function handleLiveDetection(data) {
    detectionCount++;
    document.getElementById('live-detection-count').innerText = `${detectionCount} detections`;
    
    // Add to list
    const list = document.getElementById('live-alerts-list');
    // Remove "waiting" message if first detection
    if (detectionCount === 1) list.innerHTML = '';

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const item = document.createElement('div');
    item.className = 'alert-item border-high fade-in';
    item.innerHTML = `
        <div class="alert-icon"><ion-icon name="warning-outline"></ion-icon></div>
        <div class="alert-info">
            <h4>Pothole Detected (Live)</h4>
            <p>Magnitude: ${data.mag.toFixed(2)}g • ${time}</p>
        </div>
        <span class="badge badge-danger">CRITICAL</span>
    `;
    list.prepend(item);

    // Add to map
    const m = L.circleMarker([24.7136 + (Math.random()-0.5)*0.01, 46.6753 + (Math.random()-0.5)*0.01], {
        radius: 12, fillColor: '#ef4444', color: '#fff', weight: 3, opacity: 1, fillOpacity: 0.9
    }).addTo(liveMarkerLayer);
    
    m.bindPopup(`<b>Live Detection</b><br>Magnitude: ${data.mag.toFixed(2)}g<br>Time: ${time}`).openPopup();
    
    showToast("CRITICAL: Road defect detected by hardware!", "danger");
}
