/*
  ESP32 Smart Waste Bin with Ultrasonic Sensor - Bin #1001
  
  This code combines ultrasonic sensor reading with WiFi data transmission
  to send real-time dustbin level data to the Smart Waste Management system.
  
  Hardware Requirements:
  - ESP32 Development Board
  - HC-SR04 Ultrasonic Sensor (Trig: Pin 4, Echo: Pin 15)
  - I2C LCD Display (Address: 0x27)
  - Onboard LED (Pin 2)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials - REPLACE WITH YOUR WIFI DETAILS
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server configuration - REPLACE WITH YOUR DEPLOYED APP URL
const char* serverURL = "https://heartfelt-sfogliatella-b8bcf8.netlify.app/functions/v1/update-bin";
const char* apiKey = "YOUR_SUPABASE_ANON_KEY"; // Get this from Supabase dashboard

// Bin configuration
const int BIN_ID = 1001;

// Define LCD
LiquidCrystal_I2C lcd(0x27, 16, 2); // Change 0x27 to your I2C address if needed

// Define Ultrasonic Sensor Pins
const int trigPin = 4;
const int echoPin = 15;

// Onboard LED Pin
const int onboardLED = 2;

// Dustbin Level Settings
const float maxDistance = 34.0; // Distance when dustbin is empty (cm)
const float minDistance = 5.0;  // Distance when dustbin is full (cm)

// Variables for Distance Measurement
long duration;
float distance;
float percentage;

// Timing for data transmission
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // Send data every 30 seconds

// Connection status
bool wifiConnected = false;
bool dataTransmissionEnabled = true;

// Variables for sensor readings
int currentFillLevel = 0;
int batteryLevel = 100; // Start with full battery

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  Serial.println("ESP32 Smart Waste Bin - Starting...");
  Serial.println("Bin ID: 1001");
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Dustbin");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  
  // Configure Sensor Pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Configure Onboard LED
  pinMode(onboardLED, OUTPUT);
  digitalWrite(onboardLED, LOW);
  
  // Initialize WiFi
  connectToWiFi();
  
  // Clear LCD and show ready status
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dustbin Level:");
}

void loop() {
  // Check WiFi connection
  checkWiFiConnection();
  
  // Read sensor data
  readUltrasonicSensor();
  
  // Update LCD display
  updateLCDDisplay();
  
  // Send data to server if connected and it's time to send
  if (wifiConnected && dataTransmissionEnabled) {
    if (millis() - lastSendTime >= sendInterval) {
      sendBinData(currentFillLevel, batteryLevel);
      lastSendTime = millis();
    }
  }
  
  // Simulate battery drain (very slowly)
  if (millis() % 300000 == 0) { // Every 5 minutes
    if (batteryLevel > 0) {
      batteryLevel = max(0, batteryLevel - 1);
    }
  }
  
  // Small delay before next reading
  for (int i = 0; i < 500; i++) {
    delayMicroseconds(1000); // 1 ms delay repeated 500 times
  }
}

void readUltrasonicSensor() {
  // Send a pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Measure the duration of the pulse
  duration = pulseIn(echoPin, HIGH);
  
  // Calculate distance
  distance = duration * 0.034 / 2; // Speed of sound: 343 m/s or 0.034 cm/µs
  
  // Calculate dustbin level percentage
  if (distance <= minDistance) {
    percentage = 100.0; // Full
  } else if (distance >= maxDistance) {
    percentage = 0.0; // Empty
  } else {
    percentage = 100.0 * (1 - (distance - minDistance) / (maxDistance - minDistance));
  }
  
  // Ensure percentage is within bounds
  percentage = constrain(percentage, 0.0, 100.0);
  currentFillLevel = (int)percentage;
  
  // Display on Serial Monitor
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print(" cm, Level: ");
  Serial.print(currentFillLevel);
  Serial.print("%, WiFi: ");
  Serial.println(wifiConnected ? "Connected" : "Disconnected");
}

void updateLCDDisplay() {
  // Display on LCD
  if (currentFillLevel > 95) {
    lcd.setCursor(0, 1);
    lcd.print("Dustbin Full!   ");
    digitalWrite(onboardLED, HIGH); // Turn on LED for full status
  } else {
    lcd.setCursor(0, 1);
    lcd.print("Level: ");
    lcd.print(currentFillLevel);
    lcd.print("%");
    
    // Show WiFi status
    if (wifiConnected) {
      lcd.print(" WiFi:OK");
    } else {
      lcd.print(" WiFi:--");
    }
    lcd.print("   "); // Clear any remaining characters
    
    digitalWrite(onboardLED, LOW); // Turn off LED otherwise
  }
}

void connectToWiFi() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  lcd.setCursor(0, 1);
  lcd.print("Please wait...");
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Update LCD with dots
    if (attempts % 3 == 0) {
      lcd.setCursor(0, 1);
      lcd.print("Connecting");
      for (int i = 0; i < (attempts / 3) % 4; i++) {
        lcd.print(".");
      }
      lcd.print("    ");
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("✓ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.println("Bin #1001 will now send real-time updates");
    
    // Show success on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print("IP: ");
    lcd.print(WiFi.localIP().toString().substring(0, 11));
    delay(3000);
    
    // Reset LCD to normal display
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Dustbin Level:");
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("✗ WiFi connection failed!");
    Serial.println("Bin #1001 will remain at 0% until connection is established");
    
    // Show error on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Check settings");
    delay(3000);
    
    // Reset LCD to normal display
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Dustbin Level:");
  }
}

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
      
      // Brief LED flash to indicate successful transmission
      digitalWrite(onboardLED, HIGH);
      delay(100);
      digitalWrite(onboardLED, LOW);
    } else {
      Serial.println("Server responded with error: " + response);
    }
  } else {
    Serial.println("✗ Error sending data. HTTP Response code: " + String(httpResponseCode));
    Serial.println("Bin #1001 will not update until connection is restored");
  }
  
  http.end();
}

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

// Function to get current fill level (for compatibility with original structure)
int getFillLevelPercentage() {
  return currentFillLevel;
}

// Function to get battery level (for compatibility with original structure)
int getBatteryLevel() {
  return batteryLevel;
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