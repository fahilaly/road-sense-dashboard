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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize Heatmap Layer (empty initially)
    heatLayer = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 17, gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'} });

    // Init Fleet Markers
    const fleetIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:var(--primary); color:white; width:28px; height:28px; border-radius:50%; display:flex; justify-content:center; align-items:center; border:2px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.4);"><ion-icon name="car-sport"></ion-icon></div>`,
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

    renderDashboard();
    
    // Add Marker to map
    addMarkerToMap(newAlert);
}

function addMarkerToMap(alert) {
    // Create Custom HTML Marker Icon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin ${alert.issue.severity}"><ion-icon class="marker-icon" name="${alert.issue.icon}-outline"></ion-icon></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
    });

    const popupContent = `<b>${alert.issue.type}</b><br>${alert.loc.name}<br>Severity: ${alert.issue.severity.toUpperCase()}<br>
        <button class="action-btn" style="margin-top:0.5rem; padding:0.2rem 0.5rem; font-size:0.75rem;" 
        onclick="openSnapshotModal('${alert.loc.name}', '${alert.issue.type}', '${alert.issue.severity}', ${Math.floor(Math.random()*15 + 80)})">View Snapshot</button>`;
        
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
        badge.innerHTML = '<ion-icon name="time-outline"></ion-icon> Assigned';
    } else {
        badge.className = 'status-badge badge';
        badge.innerHTML = 'Pending';
    }
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
    toast.innerHTML = `<ion-icon name="warning" style="color:var(--danger); font-size:1.5rem; flex-shrink:0;"></ion-icon>
                       <div><strong style="color:var(--text-primary)">${title}</strong><br><span style="font-size:0.85rem; color:var(--text-secondary);">${message}</span></div>`;
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
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600'
        ],
        'medium': [
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600'
        ],
        'low': [
            'https://placehold.co/600x400/1e293b/94a3b8?text=Minor+Surface+Irregularity'
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

// Export CSV
window.exportCSV = function() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Report ID,Location,Issue Type,Severity,Source,Date\n";
    pendingReports.forEach(r => {
        csvContent += `${r.id},"${r.loc}","${r.type.type}",${r.type.severity},"${r.source.name}",${r.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "road_sense_reports.csv");
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
                }
            });
        }
    }

    // Render Alerts List
    const list = document.getElementById('alerts-list');
    list.innerHTML = '';
    recentAlerts.forEach((a, index) => {
        // Only show if it matches filter
        if (filter !== 'all' && a.issue.severity !== filter) return;

        const el = document.createElement('div');
        el.className = `alert-item border-${a.issue.severity}`;
        // Add click listener to the alert element
        el.onclick = () => focusOnAlert(a.lat, a.lng, a.loc.name, a.issue.type, a.issue.severity);

        el.innerHTML = `
            <div class="alert-icon icon-${a.issue.severity}">
                <ion-icon name="${a.issue.icon}-outline"></ion-icon>
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <span class="alert-title">${a.issue.type}</span>
                    <span class="alert-time">${a.time}</span>
                </div>
                <p class="alert-desc">${a.loc.name} • ${a.source.type}: ${a.source.name}</p>
            </div>
        `;
        list.appendChild(el);
    });
}

function renderReports() {
    // Pending
    const pendingBody = document.getElementById('pending-tbody');
    pendingBody.innerHTML = '';
    
    const filteredPending = pendingReports.filter(r => currentFilter === 'all' || r.type.severity === currentFilter);
    
    if (filteredPending.length === 0) {
        pendingBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No pending reports match the selected filter.</td></tr>`;
    } else {
        filteredPending.forEach(r => {
            pendingBody.innerHTML += `
                <tr>
                    <td><strong>${r.id}</strong></td>
                    <td>${r.loc}</td>
                    <td><span class="badge badge-${r.type.severity === 'high' ? 'danger' : (r.type.severity === 'medium' ? 'warning' : 'success')}">${r.type.type}</span></td>
                    <td><span style="font-size: 0.8rem; font-weight: 500; color: ${r.source.type === 'IoT Sensor' ? 'var(--primary)' : 'var(--warning)'};"><ion-icon name="${r.source.type === 'IoT Sensor' ? 'hardware-chip-outline' : 'people-outline'}"></ion-icon> ${r.source.name}</span></td>
                    <td style="color:var(--text-secondary); font-size: 0.9rem;">${r.date}</td>
                    <td>
                        <select class="assignee-select" onchange="updateReportStatus(this)">
                            <option value="Unassigned">Unassigned</option>
                            <option value="Riyadh Infra Co.">Riyadh Infra Co.</option>
                            <option value="City Maintenance">City Maintenance</option>
                            <option value="Fast Paving Ltd">Fast Paving Ltd</option>
                        </select>
                    </td>
                    <td><span class="status-badge badge" style="margin:0;">Pending</span></td>
                    <td><button class="action-btn" style="background:var(--surface-solid); color:var(--text-secondary); border:1px solid var(--border-color); padding:0.4rem;" title="View Details" onclick="openSnapshotModal('${r.loc}', '${r.type.type}', '${r.type.severity}', ${Math.floor(Math.random()*15 + 80)})"><ion-icon name="eye-outline" style="font-size:1.2rem; margin:0;"></ion-icon></button></td>
                </tr>
            `;
        });
    }

    // Handled
    const handledBody = document.getElementById('handled-tbody');
    handledBody.innerHTML = '';
    handledReports.forEach(r => {
        handledBody.innerHTML += `
            <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.loc}</td>
                <td>${r.type}</td>
                <td><span style="font-size: 0.8rem; font-weight: 500; color: ${r.source.type === 'IoT Sensor' ? 'var(--primary)' : 'var(--warning)'};"><ion-icon name="${r.source.type === 'IoT Sensor' ? 'hardware-chip-outline' : 'people-outline'}"></ion-icon> ${r.source.type}</span></td>
                <td>${r.source.name}</td>
                <td>${r.date}</td>
                <td>${r.contractor}</td>
                <td><span class="badge badge-success"><ion-icon name="checkmark-circle-outline"></ion-icon> ${r.status}</span></td>
                <td><button class="action-btn" style="background:var(--surface-solid); color:var(--text-secondary); border:1px solid var(--border-color); padding:0.4rem;" title="View Details" onclick="openSnapshotModal('${r.loc}', '${r.type}', 'low', 99)"><ion-icon name="eye-outline" style="font-size:1.2rem; margin:0;"></ion-icon></button></td>
            </tr>
        `;
    });
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

    // Fallbacks for Absolute Bottom (Analytics) and Absolute Top (Dashboard)
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 20) {
            navLinks.forEach(a => a.classList.remove('active'));
            document.querySelector('.nav-links a[href="#analytics"]').classList.add('active');
        }
    });
    
    // Initial highlight on load
    if (window.scrollY < 100) {
        navLinks.forEach(a => a.classList.remove('active'));
        const dashboardLink = document.querySelector('.nav-links a[href="#dashboard"]');
        if(dashboardLink) dashboardLink.classList.add('active');
    }
});