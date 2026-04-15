<div align="center">

# Road Sense - Smart Infrastructure Monitoring (Prototype)

<img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop" width="100%" alt="Smart City Infrastructure" style="border-radius: 12px; margin-bottom: 2rem;" />

</div>

## About The Project

*Note: This application is currently a prototype.* Road Sense is an IoT-driven platform that utilizes simple vehicle sensors to monitor road conditions. The collected data is then processed and sorted using AI and computer vision to accurately detect potholes, cracks, and degradation for proactive city maintenance.

## Key Features

- **Live Detection Map:** Look around a detailed map overlaying active infrastructure risks and reports in real-time.
- **Heatmap Analytics:** Spot high-density damage areas rapidly using our heatmap toggles for efficient resource allocation.
- **Predictive Forecasting:** AI-powered forecasts predicting road deterioration over 6-month cycles to identify cost savings.
- **Visual Evidence Snapshots:** Get immediate visual proof showing AI bounding-box annotated images of reported road damages.
- **Live Hardware Feed:** A dedicated tab for real-time ESP32-C3 + MPU6050 sensor data with its own map and alerts.
- **Mobile Responsive:** Fully supports viewing and managing reports efficiently from your mobile device while out in the field.
- **Data Export:** Generate and download detailed CSV reports of all pending and handled assignments.

## Hardware Integration

### Components
- **ESP32-C3 SuperMini** — WiFi-enabled microcontroller
- **GY-521 MPU6050** — 3-axis accelerometer + gyroscope (6-DOF)

### Wiring
| MPU6050 | ESP32-C3 |
|---------|----------|
| VCC     | 3.3V     |
| GND     | GND      |
| SCL     | GPIO9    |
| SDA     | GPIO8    |
| AD0     | GND      |

### Running the Server
```bash
npm install
npm start
# Dashboard: http://localhost:3000
# Test detection: http://localhost:3000/api/test-detection
```

### Flashing the Firmware
1. Open `firmware/road_sense_esp32.ino` in Arduino IDE
2. Set Board to **ESP32C3 Dev Module**
3. Update WiFi credentials and server IP
4. Upload

## Contributors

This project is maintained and developed by:

- **fahilaly**
