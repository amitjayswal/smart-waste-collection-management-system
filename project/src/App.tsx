import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DustbinMap from './components/DustbinMap';
import DustbinList from './components/DustbinList';
import Analytics from './components/Analytics';
import ESP32DebugPanel from './components/ESP32DebugPanel';
import { Dustbin, DustbinStats } from './types';
import { initialDustbins, calculateStats } from './data/dustbins';
import { binService, BinUpdateData } from './services/binService';

function App() {
  const [dustbins, setDustbins] = useState<Dustbin[]>(initialDustbins);
  const [stats, setStats] = useState<DustbinStats>(calculateStats(initialDustbins));
  const [selectedBin, setSelectedBin] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [lastEsp32Update, setLastEsp32Update] = useState<Date | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(true); // Show debug panel by default

  // Update stats whenever dustbins change
  useEffect(() => {
    setStats(calculateStats(dustbins));
  }, [dustbins]);

  // Test database connection on startup
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await binService.testConnection();
      setDatabaseConnected(isConnected);
      
      if (isConnected) {
        console.log('✅ Supabase database connected successfully');
        
        // Load initial data for bin 1001
        const latestData = await binService.getLatestBinData(1001);
        if (latestData) {
          console.log('📊 Loaded initial data for bin 1001:', latestData);
          updateBinData(latestData);
        }
      } else {
        console.error('❌ Failed to connect to Supabase database');
      }
    };

    testConnection();
  }, []);

  // Subscribe to ESP32 bin updates
  useEffect(() => {
    console.log('🔧 Setting up bin update subscriptions...');
    
    const unsubscribe = binService.onBinUpdate((data: BinUpdateData) => {
      console.log('🔄 Received bin update in App component:', data);
      updateBinData(data);
    });

    // Start real-time subscription (preferred method)
    binService.startRealtimeSubscription();
    
    // Also start polling as fallback
    binService.startPolling(5000); // Poll every 5 seconds as backup

    return () => {
      console.log('🧹 Cleaning up subscriptions...');
      unsubscribe();
      binService.stopRealtimeSubscription();
      binService.stopPolling();
    };
  }, []);

  // Helper function to update bin data
  const updateBinData = (data: BinUpdateData) => {
    console.log('📝 Updating bin data:', data);
    
    // Mark ESP32 as connected when we receive data
    if (data.binId === 1001) {
      setEsp32Connected(true);
      setLastEsp32Update(new Date());
      console.log('✅ ESP32 connection confirmed for bin 1001');
    }
    
    setDustbins(currentBins => {
      const updatedBins = currentBins.map(bin => {
        if (bin.id === data.binId) {
          const updatedBin = {
            ...bin,
            fillLevel: data.fillLevel,
            batteryLevel: data.batteryLevel || bin.batteryLevel,
            status: data.status as Dustbin['status'] || 
              (data.fillLevel >= 80 ? 'critical' : 
               data.fillLevel >= 50 ? 'warning' : 'normal'),
            lastUpdated: new Date()
          };
          console.log(`🔄 Updated bin ${bin.id}:`, updatedBin);
          return updatedBin;
        }
        return bin;
      });
      return updatedBins;
    });
  };

  // Monitor ESP32 connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (lastEsp32Update) {
        const timeSinceLastUpdate = Date.now() - lastEsp32Update.getTime();
        // Consider disconnected if no update for more than 2 minutes
        if (timeSinceLastUpdate > 120000) {
          if (esp32Connected) {
            console.log('⚠️ ESP32 connection timeout - resetting bin 1001 to 0%');
            setEsp32Connected(false);
            
            // Reset bin 1001 to 0% if ESP32 is disconnected
            setDustbins(currentBins => {
              return currentBins.map(bin => {
                if (bin.id === 1001) {
                  return {
                    ...bin,
                    fillLevel: 0,
                    status: 'normal',
                    lastUpdated: new Date()
                  };
                }
                return bin;
              });
            });
          }
        }
      }
    };

    const intervalId = setInterval(checkConnectionStatus, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [lastEsp32Update, esp32Connected]);

  // Simulate IoT updates for other bins (not bin 1001 which comes from ESP32)
  useEffect(() => {
    const updateDustbins = () => {
      setDustbins(currentBins => {
        const updatedBins = JSON.parse(JSON.stringify(currentBins));
        
        updatedBins.forEach((bin: Dustbin, index: number) => {
          // Skip bin 1001 as it gets updates from ESP32
          if (bin.id === 1001) return;
          
          // Only update some bins randomly to simulate realistic IoT behavior
          if (Math.random() < 0.3) {
            const fillChange = Math.floor(Math.random() * 8) - 2;
            let newFillLevel = bin.fillLevel + fillChange;
            
            newFillLevel = Math.max(0, Math.min(100, newFillLevel));
            
            let newStatus = bin.status;
            if (newFillLevel < 50) {
              newStatus = 'normal';
            } else if (newFillLevel < 80) {
              newStatus = 'warning';
            } else {
              newStatus = 'critical';
            }
            
            if (Math.random() < 0.02) {
              newStatus = 'servicing';
              newFillLevel = Math.max(0, newFillLevel - 20);
            }
            
            const batteryChange = Math.random() < 0.2 ? -1 : 0;
            const newBatteryLevel = Math.max(0, bin.batteryLevel + batteryChange);
            
            updatedBins[index] = {
              ...bin,
              fillLevel: newFillLevel,
              status: newStatus as Dustbin['status'],
              lastUpdated: new Date(),
              batteryLevel: newBatteryLevel
            };
          }
        });
        
        return updatedBins;
      });
    };
    
    const intervalId = setInterval(updateDustbins, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const refreshData = () => {
    setDustbins(currentBins => {
      const updatedBins = JSON.parse(JSON.stringify(currentBins));
      updatedBins.forEach((bin: Dustbin) => {
        // Don't update bin 1001's lastUpdated if it's controlled by ESP32
        if (bin.id !== 1001) {
          bin.lastUpdated = new Date();
        }
      });
      return updatedBins;
    });
  };

  // Test function to simulate ESP32 data (for development/testing)
  const simulateESP32Update = () => {
    const randomFillLevel = Math.floor(Math.random() * 100);
    const randomBatteryLevel = Math.floor(Math.random() * 100);
    console.log('🧪 Simulating ESP32 update via frontend button');
    binService.simulateUpdate(1001, randomFillLevel, randomBatteryLevel);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Database Connection Status */}
        <div className={`mb-2 p-3 border rounded-lg ${
          databaseConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${
                databaseConnected ? 'text-green-800' : 'text-red-800'
              }`}>
                Supabase Database Status
              </h3>
              <p className={`text-xs ${
                databaseConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {databaseConnected 
                  ? 'Connected - Ready to receive ESP32 data'
                  : 'Disconnected - Check your .env configuration'
                }
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              databaseConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </div>
        </div>

        {/* ESP32 Status Panel */}
        <div className={`mb-4 p-4 border rounded-lg ${
          esp32Connected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${
                esp32Connected ? 'text-green-800' : 'text-yellow-800'
              }`}>
                ESP32 Module Status - Bin #1001
              </h3>
              <p className={`text-xs ${
                esp32Connected ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {esp32Connected 
                  ? `Connected - Last update: ${lastEsp32Update?.toLocaleTimeString() || 'Never'}`
                  : 'Waiting for ESP32 data - Bin level set to 0%'
                }
              </p>
              <p className="text-xs text-gray-600 mt-1">
                API Endpoint: <code className="bg-white px-1 rounded">/functions/v1/update-bin</code>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                esp32Connected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <button
                onClick={simulateESP32Update}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Test ESP32 Update
              </button>
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <ESP32DebugPanel
            esp32Connected={esp32Connected}
            lastEsp32Update={lastEsp32Update}
            databaseConnected={databaseConnected}
          />
        )}

        <Dashboard dustbins={dustbins} stats={stats} />
        <DustbinMap 
          dustbins={dustbins} 
          selectedBin={selectedBin}
          setSelectedBin={setSelectedBin}
        />
        <DustbinList dustbins={dustbins} refreshData={refreshData} />
        <Analytics dustbins={dustbins} />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                <h2 className="ml-2 text-lg font-semibold">Smart Waste Management</h2>
              </div>
              <p className="ml-4 text-sm text-gray-500">© 2025. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Documentation</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;