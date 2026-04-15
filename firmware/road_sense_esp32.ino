/*
 * ═══════════════════════════════════════════════════
 *   Road Sense — ESP32-C3 SuperMini + MPU6050 Firmware
 * ═══════════════════════════════════════════════════
 *
 * Hardware:
 *   - ESP32-C3 SuperMini
 *   - GY-521 MPU6050 (3-axis accelerometer + gyroscope)
 *
 * Wiring (MPU6050 -> ESP32-C3 SuperMini):
 *   VCC -> 3.3V
 *   GND -> GND
 *   SCL -> GPIO9
 *   SDA -> GPIO8
 *   AD0 -> GND  (sets I2C address to 0x68)
 *   INT -> not connected
 *
 * Arduino IDE Setup:
 *   Board: "ESP32C3 Dev Module"
 *   USB CDC On Boot: Enabled
 *   Board package: "esp32" by Espressif Systems (v2.x+)
 *
 * No external libraries needed — uses built-in Wire, WiFi, HTTPClient.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>

// ════════════════════════════════════════
//  WARNING: CHANGE THESE TO YOUR SETTINGS
// ════════════════════════════════════════
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Set this to your computer's local IP address (shown when server starts)
// Example: "http://192.168.1.100:3000/api/sensor-data"
const char* SERVER_URL = "http://192.168.1.100:3000/api/sensor-data";

const char* DEVICE_ID = "ESP32-C3-001";

// ════════════════════════════════════════
//  MPU6050 Configuration
// ════════════════════════════════════════
const uint8_t MPU6050_ADDR = 0x68;

// ESP32-C3 SuperMini I2C pins
const int SDA_PIN = 8;
const int SCL_PIN = 9;

// ════════════════════════════════════════
//  Detection Thresholds
// ════════════════════════════════════════
// Magnitude threshold for bump detection (in g-force)
// Sitting still on a table = 1.0g
// Light bump = 1.5g
// Medium bump = 2.0g
// Hard bump / pothole = 3.0g+
const float BUMP_THRESHOLD_LOW    = 1.5;   // Low severity
const float BUMP_THRESHOLD_MED    = 2.0;   // Medium severity
const float BUMP_THRESHOLD_HIGH   = 3.0;   // High severity

const unsigned long BUMP_COOLDOWN = 2000;  // Minimum ms between detections
const unsigned long HEARTBEAT_INTERVAL = 10000; // Heartbeat every 10 seconds

// ════════════════════════════════════════
//  State
// ════════════════════════════════════════
unsigned long lastBumpTime = 0;
unsigned long lastHeartbeatTime = 0;
bool mpuReady = false;

// Built-in LED (ESP32-C3 SuperMini has LED on GPIO8 -- but we're using GPIO8 for I2C)
// If your board has an LED on another pin, set it here. Otherwise set to -1.
const int LED_PIN = -1;

void setup() {
    Serial.begin(115200);
    delay(1000); // Wait for serial monitor

    Serial.println();
    Serial.println("Road Sense - ESP32-C3 Firmware");
    Serial.println("==============================");

    if (LED_PIN >= 0) {
        pinMode(LED_PIN, OUTPUT);
        digitalWrite(LED_PIN, LOW);
    }

    // -- Initialize I2C & MPU6050 --
    Wire.begin(SDA_PIN, SCL_PIN);
    Serial.print("Initializing MPU6050... ");

    // Check if MPU6050 is connected
    Wire.beginTransmission(MPU6050_ADDR);
    if (Wire.endTransmission() == 0) {
        Serial.println("Found!");
        mpuReady = true;

        // Wake up MPU6050 (it starts in sleep mode)
        writeRegister(0x6B, 0x00); // PWR_MGMT_1: wake up

        // Set accelerometer range to +/-4g (good balance of sensitivity and range)
        writeRegister(0x1C, 0x08); // ACCEL_CONFIG: +/-4g

        // Set Digital Low Pass Filter to reduce noise
        writeRegister(0x1A, 0x03); // CONFIG: DLPF ~44Hz bandwidth

        Serial.println("MPU6050 configured: +/-4g range, DLPF enabled");
    } else {
        Serial.println("NOT FOUND! Check wiring:");
        Serial.println("  SDA -> GPIO8");
        Serial.println("  SCL -> GPIO9");
        Serial.println("  VCC -> 3.3V");
        Serial.println("  GND -> GND");
    }

    // -- Connect to WiFi --
    Serial.printf("\nConnecting to WiFi: %s", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\nWiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("Sending data to: %s\n\n", SERVER_URL);
    } else {
        Serial.println("\nWiFi connection failed! Check SSID and password.");
    }
}

void loop() {
    if (!mpuReady) {
        Serial.println("MPU6050 not ready. Retrying...");
        delay(2000);
        return;
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        delay(3000);
        return;
    }

    // -- Read accelerometer data --
    float ax, ay, az;
    readAccelerometer(&ax, &ay, &az);

    // Calculate total acceleration magnitude
    float magnitude = sqrt(ax * ax + ay * ay + az * az);

    unsigned long now = millis();

    // -- Detect bumps based on magnitude threshold --
    if (magnitude > BUMP_THRESHOLD_LOW && (now - lastBumpTime > BUMP_COOLDOWN)) {
        lastBumpTime = now;

        // Classify severity
        String severity;
        String issueType;

        if (magnitude > BUMP_THRESHOLD_HIGH) {
            severity = "high";
            issueType = "Deep Pothole";
        } else if (magnitude > BUMP_THRESHOLD_MED) {
            severity = "medium";
            issueType = "Surface Crack (Longitudinal)";
        } else {
            severity = "low";
            issueType = "Uneven Surface / Bump";
        }

        Serial.printf("\nDETECTION! Severity: %s | Magnitude: %.2fg\n", severity.c_str(), magnitude);
        Serial.printf("   Accel: X=%.3f  Y=%.3f  Z=%.3f\n", ax, ay, az);

        // Flash LED
        blinkLED(3, 100);

        // Send detection to server
        sendDetection(ax, ay, az, magnitude, severity, issueType);
    }

    // -- Periodic heartbeat --
    if (now - lastHeartbeatTime > HEARTBEAT_INTERVAL) {
        lastHeartbeatTime = now;
        sendHeartbeat(ax, ay, az, magnitude);
    }

    delay(50); // ~20Hz sampling rate
}

// ════════════════════════════════════════
//  MPU6050 Functions
// ════════════════════════════════════════

void readAccelerometer(float* ax, float* ay, float* az) {
    Wire.beginTransmission(MPU6050_ADDR);
    Wire.write(0x3B); // Start at ACCEL_XOUT_H register
    Wire.endTransmission(false);
    Wire.requestFrom(MPU6050_ADDR, (uint8_t)6, (uint8_t)true);

    int16_t rawX = (Wire.read() << 8) | Wire.read();
    int16_t rawY = (Wire.read() << 8) | Wire.read();
    int16_t rawZ = (Wire.read() << 8) | Wire.read();

    // Convert to g-force (+/-4g range -> 8192 LSB/g)
    *ax = rawX / 8192.0;
    *ay = rawY / 8192.0;
    *az = rawZ / 8192.0;
}

void writeRegister(uint8_t reg, uint8_t value) {
    Wire.beginTransmission(MPU6050_ADDR);
    Wire.write(reg);
    Wire.write(value);
    Wire.endTransmission(true);
}

// ════════════════════════════════════════
//  Network Functions
// ════════════════════════════════════════

void sendDetection(float ax, float ay, float az, float mag, String severity, String type) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000);

    // Build JSON payload
    String json = "{";
    json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    json += "\"type\":\"detection\",";
    json += "\"accel_x\":" + String(ax, 3) + ",";
    json += "\"accel_y\":" + String(ay, 3) + ",";
    json += "\"accel_z\":" + String(az, 3) + ",";
    json += "\"magnitude\":" + String(mag, 3) + ",";
    json += "\"severity\":\"" + severity + "\",";
    json += "\"issue_type\":\"" + type + "\"";
    json += "}";

    int httpCode = http.POST(json);

    if (httpCode > 0) {
        Serial.printf("   Sent to server (HTTP %d)\n", httpCode);
    } else {
        Serial.printf("   Failed to send: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

void sendHeartbeat(float ax, float ay, float az, float mag) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(2000);

    String json = "{";
    json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    json += "\"type\":\"heartbeat\",";
    json += "\"accel_x\":" + String(ax, 3) + ",";
    json += "\"accel_y\":" + String(ay, 3) + ",";
    json += "\"accel_z\":" + String(az, 3) + ",";
    json += "\"magnitude\":" + String(mag, 3);
    json += "}";

    http.POST(json);
    http.end();
}

// ════════════════════════════════════════
//  Utility
// ════════════════════════════════════════

void blinkLED(int times, int delayMs) {
    if (LED_PIN < 0) return;
    for (int i = 0; i < times; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(delayMs);
        digitalWrite(LED_PIN, LOW);
        delay(delayMs);
    }
}
