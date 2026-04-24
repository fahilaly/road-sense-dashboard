# Road Sense: Municipal Infrastructure Monitoring System
## Technical & Business Strategy Report — April 2026

---

## Part 1: Project Vision & Executive Summary
Road Sense is a high-performance, cost-effective infrastructure monitoring solution designed for municipal fleet deployment. By integrating **Multimodal Sensor Fusion** (3-axis vibration analysis + Computer Vision) directly into government-regulated vehicles (buses, garbage trucks), Road Sense eliminates the need for individual consumer smartphone apps and provides city planners with a centralized, real-time map of road hazards.

---

## Part 2: Technical Optimization & Research Validation
Our system leverages 2024-2025 research in **Multimodal Sensor Fusion** to ensure high detection accuracy while minimizing false positives from speed bumps or expansion joints.

### 1. Vibration Analysis: The "Drop Signature" Algorithm
Using the MPU6050 Accelerometer, we implement a **Dynamic Baseline Calibration**. The system continuously monitors Z-axis noise to adjust for different vehicle types (e.g., a heavy bus vs. a light car).
*   **Pothole Detection:** A rapid negative Z-axis spike followed by a sharp positive rebound.
*   **Speed Bump Rejection:** A smooth, low-frequency wave on all axes without the sharp "drop" phase.

### 2. Computer Vision: AAL-Net & Real-time Inference
Integrating with existing onboard CCTV cameras, the system uses a modified **AAL-Net** (Anomaly Awareness Learning Network) to visually confirm detections. This prevents "Ghost Detections" caused by debris on the road.

---

## Part 3: Municipal Fleet Hardware Integration
Unlike consumer-grade apps, Road Sense is built for **Automotive Grade Integration**:
*   **Hardware:** ESP32-C3 SuperMini + MPU6050 sensor package.
*   **Power:** Direct 12V/24V integration via vehicle battery.
*   **Data Source:** Uses existing high-accuracy vehicle GPS and CAN bus data (for speed compensation).
*   **Connectivity:** 4G/LTE cellular transmission to the cloud dashboard.

---

## Part 4: Data Architecture & System Connection
The connection between the physical hardware and the municipal dashboard follows a streamlined cloud pipeline:

### 1. The Edge Device (ESP32)
When a detection occurs, the ESP32 fuses the vibration magnitude with the GPS coordinates into a compact **JSON Payload**:
```json
{
  "device_id": "BUS-MUNI-104",
  "type": "detection",
  "accel_z": -2.45,
  "magnitude": 4.12,
  "severity": "high",
  "lat": 24.1234,
  "lng": 47.5678
}
```
The hardware executes an **HTTP POST Request** to send this JSON securely to the centralized cloud server: 
`https://roadsence.onrender.com/api/sensor-data`

### 2. The Backend Server (Node.js & Express)
The cloud server acts as the middleman. Built using Node.js and Express (e.g., `server.js`), this backend exposes a **REST API endpoint** (like `api/reports/add`).
*   **Verification:** The server validates the JSON structure.
*   **Database:** Detections are saved to a persistent database (PostgreSQL/MongoDB) for historical trend analysis.
*   **Broadcast:** The server pushes the update to all active dashboards using **WebSockets (Socket.io)** for instant, no-refresh map updates.

### 3. The Web Dashboard (Frontend)
The city planner's dashboard (Leaflet.js + HTML5) maintains an active WebSocket connection. When the server broadcasts a new detection, the map instantly drops a red marker at the exact GPS coordinate, alerting the road maintenance team within milliseconds of the event.

---

## Part 5: Presentation Outline (Municipal Stakeholders)

### Slide 1: Title Slide
*   **Visual:** "Road Sense" Logo with a map of the city showing data overlays.
*   **Tagline:** Smart Cities Start with Smooth Roads.

### Slide 2: The $Billion Problem
*   **Visual:** Photo of a pothole vs. the cost of repairing a suspension system. 
*   **Key Fact:** Unrepaired potholes cost cities millions in damage claims and increase road maintenance costs by 400% if left for more than 6 months.

### Slide 3: Our Solution: The Fleet-First Approach
*   **Visual:** A diagram showing a city bus detecting a pothole and sending data to the cloud.
*   **Key Message:** No apps. No driver distraction. We use the vehicles that are already on the road.

### Slide 4: Academic Foundation (2025 Research)
*   **Visual:** Side-by-side graphs of "Vibration Waveforms."
*   **Key Message:** Our algorithm distinguishes between a speed bump and a pothole using high-frequency "Drop Signature" analysis.

### Slide 5: Hardware Integration
*   **Visual:** A photo of the ESP32-C3 SuperMini compared to the size of a coin.
*   **Key Message:** Small, powerful, and integrates with existing vehicle telematics and cameras.

### Slide 6: Live Cloud Pipeline
*   **Visual:** Flowchart: [Vehicle] -> [4G Network] -> [Render Cloud] -> [Live Dashboard].
*   **Speaker Notes:** "To get data from the bus to the city official's screen, we use a robust cloud architecture. The vehicle transmits a JSON payload containing the GPS and severity data over a cellular network to our custom Node.js backend hosted on Render at `roadsence.onrender.com`. The server permanently logs the issue in our database, which instantly updates the live Leaflet map on our web dashboard in real-time."

### Slide 7: Economic Impact & ROI
*   **Visual:** A chart showing "Cost of Repair" (Small crack vs. Massive sinkhole over time).
*   **Key Message:** Road Sense allows "Preventative Maintenance"—fixing a small crack for $50 before it becomes a $5,000 hole.

### Slide 8: Future Roadmap
*   **Visual:** Icons for AI predictive modeling and Autonomous Vehicle integration.

### Slide 9: Q&A / Conclusion
*   **Final Statement:** Let's build a smoother, safer city together.
