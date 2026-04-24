const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Serve the dashboard static files
app.use(express.static(path.join(__dirname)));

// ──────────────────────────────────────
// WebSocket — Dashboard clients
// ──────────────────────────────────────
const clients = new Set();

wss.on('connection', (ws, req) => {
    clients.add(ws);
    const ip = req.socket.remoteAddress;
    console.log(`📊 Dashboard connected from ${ip}. Total: ${clients.size}`);

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`📊 Dashboard disconnected. Total: ${clients.size}`);
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// ──────────────────────────────────────
// REST API — ESP32 sends data here
// ──────────────────────────────────────

// Main endpoint: receives sensor data from ESP32
app.post('/api/sensor-data', (req, res) => {
    const data = req.body;

    if (data.type === 'detection') {
        console.log(`\n🔴 DETECTION from ${data.device_id}`);
        console.log(`   Severity: ${data.severity} | Type: ${data.issue_type}`);
        console.log(`   Accel: X=${data.accel_x}g  Y=${data.accel_y}g  Z=${data.accel_z}g`);
        console.log(`   Magnitude: ${data.magnitude}g`);
    } else if (data.type === 'heartbeat') {
        process.stdout.write(`💓 Heartbeat from ${data.device_id} | Mag: ${Number(data.magnitude).toFixed(2)}g\r`);
    }

    // Broadcast to all connected dashboards
    broadcast({
        ...data,
        timestamp: new Date().toISOString()
    });

    res.json({ status: 'ok' });
});

// Health check
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        connectedDashboards: clients.size,
        uptime: Math.floor(process.uptime()) + 's'
    });
});

// ──────────────────────────────────────
// Test endpoint — simulate a detection
// without needing the physical ESP32
// Visit: http://localhost:3000/api/test-detection
// ──────────────────────────────────────
app.get('/api/test-detection', (req, res) => {
    const magnitude = 1.8 + Math.random() * 2.0;
    const severity = magnitude > 3.0 ? 'high' : magnitude > 2.3 ? 'medium' : 'low';

    const testData = {
        device_id: 'ESP32-C3-TEST',
        type: 'detection',
        accel_x: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        accel_y: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        accel_z: parseFloat((1.0 + Math.random() * 2).toFixed(3)),
        magnitude: parseFloat(magnitude.toFixed(3)),
        severity: severity,
        issue_type: severity === 'high' ? 'Deep Pothole' : severity === 'medium' ? 'Surface Crack (Longitudinal)' : 'Uneven Surface / Bump',
        timestamp: new Date().toISOString()
    };

    broadcast(testData);
    console.log(`\n🧪 TEST detection broadcasted: ${severity} (${magnitude.toFixed(2)}g)`);
    res.json({ status: 'ok', data: testData, message: 'Test detection sent to dashboard!' });
});

// Also allow test heartbeat
app.get('/api/test-heartbeat', (req, res) => {
    const testData = {
        device_id: 'ESP32-C3-TEST',
        type: 'heartbeat',
        accel_x: parseFloat((Math.random() * 0.1).toFixed(3)),
        accel_y: parseFloat((Math.random() * 0.1).toFixed(3)),
        accel_z: parseFloat((0.98 + Math.random() * 0.04).toFixed(3)),
        magnitude: parseFloat((1.0 + Math.random() * 0.05).toFixed(3)),
        timestamp: new Date().toISOString()
    };

    broadcast(testData);
    res.json({ status: 'ok', data: testData });
});

// ──────────────────────────────────────
// Start server
// ──────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    // Get local IP for ESP32 configuration
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = 'localhost';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║         🚀  Road Sense Server is RUNNING            ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  📊 Dashboard:    http://localhost:${PORT}              ║`);
    console.log(`║  📡 ESP32 Target: http://${localIP}:${PORT}/api/sensor-data  ║`);
    console.log(`║  🧪 Test URL:     http://localhost:${PORT}/api/test-detection║`);
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Waiting for connections...');
    console.log('');
});
