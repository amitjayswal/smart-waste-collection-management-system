import React, { useState, useEffect } from 'react';
import { binService } from '../services/binService';
import { BinUpdate } from '../lib/supabase';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Send, 
  RefreshCw, 
  Bug, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';

interface ESP32DebugPanelProps {
  esp32Connected: boolean;
  lastEsp32Update: Date | null;
  databaseConnected: boolean;
}

const ESP32DebugPanel: React.FC<ESP32DebugPanelProps> = ({
  esp32Connected,
  lastEsp32Update,
  databaseConnected
}) => {
  const [recentUpdates, setRecentUpdates] = useState<BinUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [testInProgress, setTestInProgress] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    // Update connection status
    setConnectionStatus(binService.getConnectionStatus());
    
    // Load recent updates
    loadRecentUpdates();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadRecentUpdates();
      setConnectionStatus(binService.getConnectionStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadRecentUpdates = async () => {
    const updates = await binService.getAllRecentUpdates(5);
    setRecentUpdates(updates);
  };

  const testRealTimeConnection = async () => {
    setTestInProgress(true);
    addDebugLog('🧪 Starting real-time connection test...');
    
    try {
      // Send test data to database
      const success = await binService.sendTestDataToDatabase(
        1001, 
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
      );
      
      if (success) {
        addDebugLog('✅ Test data sent to database successfully');
        addDebugLog('⏳ Waiting for real-time notification...');
        
        // Refresh recent updates after a delay
        setTimeout(() => {
          loadRecentUpdates();
          addDebugLog('🔄 Refreshed recent updates list');
        }, 2000);
      } else {
        addDebugLog('❌ Failed to send test data to database');
      }
    } catch (error) {
      addDebugLog(`❌ Test failed: ${error}`);
    }
    
    setTestInProgress(false);
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? CheckCircle : AlertCircle;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bug className="h-5 w-5 mr-2 text-blue-600" />
          ESP32 Real-time Debug Panel
        </h3>
        <button
          onClick={loadRecentUpdates}
          className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Connection Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Database Connection */}
        <div className={`p-4 rounded-lg border-2 ${
          databaseConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className={`h-5 w-5 mr-2 ${getStatusColor(databaseConnected)}`} />
              <span className="font-medium">Database</span>
            </div>
            {React.createElement(getStatusIcon(databaseConnected), {
              className: `h-5 w-5 ${getStatusColor(databaseConnected)}`
            })}
          </div>
          <p className={`text-sm mt-1 ${getStatusColor(databaseConnected)}`}>
            {databaseConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>

        {/* Real-time Subscription */}
        <div className={`p-4 rounded-lg border-2 ${
          connectionStatus === 'connected' ? 'border-green-200 bg-green-50' : 
          connectionStatus === 'connecting' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className={`h-5 w-5 mr-2 ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'connecting' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <span className="font-medium">Real-time</span>
            </div>
            {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {connectionStatus === 'connecting' && <Clock className="h-5 w-5 text-yellow-600" />}
            {connectionStatus === 'disconnected' && <AlertCircle className="h-5 w-5 text-red-600" />}
          </div>
          <p className={`text-sm mt-1 ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'connecting' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </p>
        </div>

        {/* ESP32 Status */}
        <div className={`p-4 rounded-lg border-2 ${
          esp32Connected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {esp32Connected ? (
                <Wifi className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 mr-2 text-yellow-600" />
              )}
              <span className="font-medium">ESP32</span>
            </div>
            {React.createElement(getStatusIcon(esp32Connected), {
              className: `h-5 w-5 ${getStatusColor(esp32Connected)}`
            })}
          </div>
          <p className={`text-sm mt-1 ${esp32Connected ? 'text-green-600' : 'text-yellow-600'}`}>
            {esp32Connected ? 'Sending Data' : 'Waiting for Data'}
          </p>
          {lastEsp32Update && (
            <p className="text-xs text-gray-500 mt-1">
              Last: {lastEsp32Update.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testRealTimeConnection}
          disabled={testInProgress}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4 mr-2" />
          {testInProgress ? 'Testing...' : 'Test Real-time Connection'}
        </button>
        
        <button
          onClick={() => binService.simulateUpdate(1001, Math.floor(Math.random() * 100))}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Activity className="h-4 w-4 mr-2" />
          Simulate ESP32 Update
        </button>
        
        <button
          onClick={clearDebugLogs}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Clear Logs
        </button>
      </div>

      {/* Recent Updates */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Recent Database Updates</h4>
        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
          {recentUpdates.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent updates found</p>
          ) : (
            <div className="space-y-2">
              {recentUpdates.map((update, index) => (
                <div key={update.id} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Bin #{update.bin_id}: {update.fill_level}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      update.status === 'critical' ? 'bg-red-100 text-red-800' :
                      update.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {update.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {formatTimestamp(update.created_at)} | Battery: {update.battery_level}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Logs */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2">Debug Logs</h4>
        <div className="bg-black text-green-400 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-sm">
          {debugLogs.length === 0 ? (
            <p className="text-gray-500">No debug logs yet...</p>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-1">How to verify real-time data:</h5>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Click "Test Real-time Connection" to send data to database</li>
          <li>Watch for the data to appear in "Recent Database Updates"</li>
          <li>Check if bin #1001 updates in the main dashboard</li>
          <li>Monitor debug logs for real-time notifications</li>
          <li>Use your ESP32 to send actual data to the API endpoint</li>
        </ol>
      </div>
    </div>
  );
};

export default ESP32DebugPanel;