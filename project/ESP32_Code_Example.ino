/*
  ESP32 Smart Waste Bin Data Sender - Bin #1001
  
  This code reads the fill level percentage from your existing sensor code
  and sends it to the web application via HTTP POST request.
  
  IMPORTANT: When no data is sent, bin #1001 will show 0% fill level.
  Only when your ESP32 sends data will the bin level update.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server configuration
const char* serverURL = "YOUR_SUPABASE_URL/functions/v1/update-bin";
const char* apiKey = "YOUR_SUPABASE_ANON_KEY";

// Bin configuration
const int BIN_ID = 1001;

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // Send data every 30 seconds

// Connection status
bool wifiConnected = false;
bool dataTransmissionEnabled = true; // Set to false to stop sending data (bin will show 0%)

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Smart Waste Bin - Starting...");
  Serial.println("Bin ID: 1001");
  Serial.println("Note: When this device is offline, bin #1001 will show 0% fill level");
  
  // Initialize WiFi
  connectToWiFi();
}

void loop() {
  // Check WiFi connection
  checkWiFiConnection();
  
  // Only send data if WiFi is connected and transmission is enabled
  if (wifiConnected && dataTransmissionEnabled) {
    // Check if it's time to send data
    if (millis() - lastSendTime >= sendInterval) {
      
      // Get fill level from your existing sensor code
      int fillLevel = getFillLevelPercentage(); // Replace with your actual function
      int batteryLevel = getBatteryLevel(); // Replace with your actual function (optional)
      
      // Only send data if we have a valid reading
      if (fillLevel >= 0 && fillLevel <= 100) {
        sendBinData(fillLevel, batteryLevel);
      } else {
        Serial.println("Invalid sensor reading, skipping data transmission");
      }
      
      lastSendTime = millis();
    }
  }
  
  // Your existing sensor reading code can go here
  // or in separate functions called from here
  
  delay(1000); // Small delay to prevent overwhelming the system
}

// Function to connect to WiFi
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("✓ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.println("Bin #1001 will now receive real-time updates");
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("✗ WiFi connection failed!");
    Serial.println("Bin #1001 will remain at 0% until connection is established");
  }
}

// Function to get fill level percentage
// Replace this with your actual sensor reading code
int getFillLevelPercentage() {
  // Example: Replace this with your ultrasonic sensor or other sensor code
  // This is just a placeholder that returns a random value for testing
  
  // Your actual code might look something like:
  // int distance = readUltrasonicSensor();
  // int fillLevel = map(distance, emptyDistance, fullDistance, 0, 100);
  // return constrain(fillLevel, 0, 100);
  
  // For testing purposes, return a random value
  // Remove this and add your actual sensor code
  static int testLevel = 0;
  testLevel += random(-5, 10); // Simulate changing levels
  testLevel = constrain(testLevel, 0, 100);
  
  Serial.println("Current fill level: " + String(testLevel) + "%");
  return testLevel;
}

// Function to get battery level (optional)
int getBatteryLevel() {
  // Replace with your actual battery monitoring code
  // For testing, return a slowly decreasing value
  static int batteryLevel = 100;
  if (random(0, 100) < 2) { // 2% chance to decrease battery
    batteryLevel = max(0, batteryLevel - 1);
  }
  return batteryLevel;
}

// Function to send bin data to the server
void sendBinData(int fillLevel, int batteryLevel) {
  if (!wifiConnected) {
    Serial.println("Cannot send data - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(serverURL);
  
  // Set headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + apiKey);
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["binId"] = BIN_ID;
  doc["fillLevel"] = fillLevel;
  doc["batteryLevel"] = batteryLevel;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending data: " + jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    
    if (httpResponseCode == 200) {
      Serial.println("✓ Data sent successfully to bin #1001!");
      Serial.println("Fill Level: " + String(fillLevel) + "%");
      Serial.println("Battery Level: " + String(batteryLevel) + "%");
      Serial.println("Web dashboard will update in real-time");
    } else {
      Serial.println("Server responded with error: " + response);
    }
  } else {
    Serial.println("✗ Error sending data. HTTP Response code: " + String(httpResponseCode));
    Serial.println("Bin #1001 will not update until connection is restored");
  }
  
  http.end();
}

// Function to handle WiFi reconnection
void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    if (wifiConnected) {
      Serial.println("WiFi connection lost! Bin #1001 will revert to 0% after timeout");
      wifiConnected = false;
    }
    
    // Try to reconnect every 30 seconds
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 30000) {
      Serial.println("Attempting to reconnect to WiFi...");
      connectToWiFi();
      lastReconnectAttempt = millis();
    }
  } else if (!wifiConnected) {
    wifiConnected = true;
    Serial.println("WiFi reconnected! Resuming data transmission to bin #1001");
  }
}

// Function to enable/disable data transmission (useful for testing)
void setDataTransmission(bool enabled) {
  dataTransmissionEnabled = enabled;
  if (enabled) {
    Serial.println("Data transmission enabled - bin #1001 will receive updates");
  } else {
    Serial.println("Data transmission disabled - bin #1001 will show 0% after timeout");
  }
}