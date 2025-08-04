# ESP32 Integration for Smart Waste Management - Bin #1001

This document explains how to integrate your ESP32 module with the Smart Waste Management system to send real-time data for bin #1001.

## Important: Default Behavior

**Bin #1001 defaults to 0% fill level when no ESP32 data is provided.**

- When your ESP32 is offline or not sending data: **Bin shows 0%**
- When your ESP32 sends data: **Bin updates to actual sensor readings**
- If ESP32 stops sending data for more than 2 minutes: **Bin automatically resets to 0%**

## Overview

The system is specifically configured so that bin #1001 only shows real data from your ESP32 module. Without ESP32 data, it remains at 0% to clearly indicate no sensor input is available.

## API Endpoint

**URL:** `YOUR_SUPABASE_URL/functions/v1/update-bin`
**Method:** POST
**Content-Type:** application/json

## Required Data Format

```json
{
  "binId": 1001,
  "fillLevel": 75,
  "batteryLevel": 85
}
```

### Parameters:
- `binId` (required): Must be 1001 for your bin
- `fillLevel` (required): Percentage (0-100) of how full the bin is
- `batteryLevel` (optional): Battery percentage (0-100)

## ESP32 Setup Instructions

### 1. Install Required Libraries

In Arduino IDE, install these libraries:
- WiFi (usually pre-installed)
- HTTPClient (usually pre-installed)
- ArduinoJson

### 2. Configure Your ESP32 Code

1. Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your WiFi credentials
2. Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anonymous key
4. Replace the `getFillLevelPercentage()` function with your actual sensor reading code

### 3. Integration with Your Existing Code

Since you mentioned you already have code to read the bin level percentage, you need to:

1. Take your existing sensor reading function
2. Replace the `getFillLevelPercentage()` function in the provided code
3. Make sure it returns a value between 0-100 (percentage)

Example integration:
```cpp
// Your existing function might look like this:
int readBinLevel() {
  // Your ultrasonic sensor code here
  int distance = /* your sensor reading */;
  int percentage = map(distance, emptyDistance, fullDistance, 0, 100);
  return constrain(percentage, 0, 100);
}

// Replace getFillLevelPercentage() with:
int getFillLevelPercentage() {
  return readBinLevel(); // Call your existing function
}
```

## System Behavior

### When ESP32 is Connected and Sending Data:
- ✅ Bin #1001 shows real sensor readings
- ✅ Status updates automatically (Normal/Warning/Critical)
- ✅ Real-time updates on dashboard and map
- ✅ Green indicator shows "Connected"

### When ESP32 is Offline or Not Sending Data:
- ⚠️ Bin #1001 shows 0% fill level
- ⚠️ Status shows as "Normal" (since 0% is not critical)
- ⚠️ Yellow indicator shows "Waiting for ESP32 data"
- ⚠️ Last update time shows when connection was lost

### Connection Timeout:
- If no data received for 2 minutes → Bin automatically resets to 0%
- ESP32 reconnection automatically resumes data updates

## Testing

1. **Upload the code to your ESP32**
2. **Open Serial Monitor (115200 baud rate)**
3. **Watch for connection messages:**
   ```
   ESP32 Smart Waste Bin - Starting...
   Bin ID: 1001
   Note: When this device is offline, bin #1001 will show 0% fill level
   Connecting to WiFi.....
   ✓ WiFi connected!
   Bin #1001 will now receive real-time updates
   ```

4. **In the web application:**
   - Check the ESP32 status panel (should show green when connected)
   - Click "Test ESP32 Update" to simulate updates
   - Verify bin #1001 updates in real-time

5. **Test offline behavior:**
   - Disconnect ESP32 or turn off WiFi
   - Wait 2+ minutes
   - Verify bin #1001 shows 0% fill level

## Data Flow

1. **ESP32 reads sensor data** (your existing code)
2. **ESP32 sends HTTP POST** to `/functions/v1/update-bin`
3. **Edge function validates** and processes the data
4. **Web application polls** for updates every 3 seconds
5. **Bin #1001 updates** with real sensor data
6. **Status auto-updates** based on fill level:
   - 0-49%: Normal (green)
   - 50-79%: Warning (yellow)  
   - 80-100%: Critical (red)

## Troubleshooting

### Bin Shows 0% Even When ESP32 is Running:

1. **Check Serial Monitor output:**
   ```
   ✓ Data sent successfully to bin #1001!
   Fill Level: 45%
   Battery Level: 87%
   ```

2. **Verify WiFi connection:**
   ```
   ✓ WiFi connected!
   IP address: 192.168.1.100
   ```

3. **Check web application status panel:**
   - Should show green "Connected" indicator
   - Should show recent "Last update" time

### Common Issues:

1. **WiFi Connection Failed**
   - Check SSID and password
   - Ensure ESP32 is in range of WiFi
   - Bin will remain at 0% until connected

2. **HTTP Error 400**
   - Check JSON format
   - Ensure binId is 1001
   - Ensure fillLevel is between 0-100

3. **HTTP Error 401/403**
   - Check Supabase URL and API key
   - Ensure API key has correct permissions

4. **Data Not Updating in Web App**
   - Check browser console for errors
   - Verify the edge function is receiving data
   - Use "Test ESP32 Update" button to verify web app functionality

### Debug Tips:

- **Monitor Serial output** for detailed logs
- **Use the status panel** to see connection status
- **Check timestamps** to verify when last data was received
- **Test with simulation** button to isolate ESP32 vs web app issues

## Security Notes

- The provided API key should be the anonymous key (safe for client-side use)
- Consider implementing authentication for production use
- Monitor API usage to prevent abuse

## Production Deployment

For production use:
1. Remove the "Test ESP32 Update" button
2. Remove debug Serial.println statements
3. Implement proper error handling and retry logic
4. Consider adding local data caching for offline scenarios
5. Add OTA (Over-The-Air) update capability

## Summary

This integration ensures that:
- **Bin #1001 only shows real data from your ESP32**
- **No ESP32 data = 0% fill level (clear indication of no sensor input)**
- **Automatic reconnection and status monitoring**
- **Real-time updates when ESP32 is connected**
- **Clear visual indicators of connection status**

Your existing sensor code just needs to be integrated into the `getFillLevelPercentage()` function, and the system will handle all the communication and status management automatically.