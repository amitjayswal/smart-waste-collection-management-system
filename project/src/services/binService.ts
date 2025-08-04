import { supabase, BinUpdate } from '../lib/supabase'

// Service for handling bin data updates from ESP32
export interface BinUpdateData {
  binId: number;
  fillLevel: number;
  batteryLevel?: number;
  status?: string;
  timestamp?: string;
}

export class BinService {
  private static instance: BinService;
  private updateCallbacks: ((data: BinUpdateData) => void)[] = [];
  private pollingInterval: number | null = null;
  private lastUpdateTime: { [key: number]: number } = {};
  private realtimeSubscription: any = null;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private debugMode: boolean = true; // Enable debug logging

  private constructor() {}

  static getInstance(): BinService {
    if (!BinService.instance) {
      BinService.instance = new BinService();
    }
    return BinService.instance;
  }

  // Subscribe to bin updates
  onBinUpdate(callback: (data: BinUpdateData) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  // Notify all subscribers of bin update
  private notifyUpdate(data: BinUpdateData) {
    if (this.debugMode) {
      console.log('🔄 Notifying subscribers of bin update:', data);
    }
    
    this.updateCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in bin update callback:', error);
      }
    });
  }

  // Start real-time subscription to database changes
  startRealtimeSubscription() {
    if (this.realtimeSubscription) {
      this.stopRealtimeSubscription();
    }

    console.log('🚀 Starting real-time subscription to bin updates...');
    this.connectionStatus = 'connecting';

    this.realtimeSubscription = supabase
      .channel('bin_updates_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bin_updates'
        },
        (payload) => {
          console.log('📡 Real-time update received from Supabase:', payload);
          
          const newUpdate = payload.new as BinUpdate;
          const updateData: BinUpdateData = {
            binId: newUpdate.bin_id,
            fillLevel: newUpdate.fill_level,
            batteryLevel: newUpdate.battery_level,
            status: newUpdate.status,
            timestamp: newUpdate.created_at
          };

          console.log('✅ Processing real-time update for bin:', updateData.binId);
          this.notifyUpdate(updateData);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bin_updates'
        },
        (payload) => {
          console.log('📡 Real-time UPDATE received from Supabase:', payload);
          
          const updatedRecord = payload.new as BinUpdate;
          const updateData: BinUpdateData = {
            binId: updatedRecord.bin_id,
            fillLevel: updatedRecord.fill_level,
            batteryLevel: updatedRecord.battery_level,
            status: updatedRecord.status,
            timestamp: updatedRecord.updated_at
          };

          console.log('✅ Processing real-time UPDATE for bin:', updateData.binId);
          this.notifyUpdate(updateData);
        }
      )
      .subscribe((status, err) => {
        console.log('📊 Subscription status changed:', status);
        
        if (err) {
          console.error('❌ Subscription error:', err);
          this.connectionStatus = 'disconnected';
        } else if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
          this.connectionStatus = 'connected';
        } else if (status === 'CLOSED') {
          console.log('🔌 Real-time subscription closed');
          this.connectionStatus = 'disconnected';
        }
      });

    // Test the subscription after a short delay
    setTimeout(() => {
      this.testRealtimeConnection();
    }, 2000);
  }

  // Test real-time connection
  private async testRealtimeConnection() {
    console.log('🧪 Testing real-time connection...');
    
    try {
      // Insert a test record to verify real-time updates work
      const testData = {
        bin_id: 9999, // Use a test bin ID
        fill_level: Math.floor(Math.random() * 100),
        battery_level: 100,
        status: 'normal'
      };

      console.log('📤 Inserting test data:', testData);
      
      const { data, error } = await supabase
        .from('bin_updates')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error('❌ Test insert failed:', error);
      } else {
        console.log('✅ Test data inserted successfully:', data);
        console.log('⏳ Waiting for real-time notification...');
      }
    } catch (error) {
      console.error('❌ Real-time connection test failed:', error);
    }
  }

  // Stop real-time subscription
  stopRealtimeSubscription() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
      this.connectionStatus = 'disconnected';
      console.log('🔌 Real-time subscription stopped');
    }
  }

  // Start polling for updates (fallback method)
  startPolling(intervalMs: number = 3000) { // Reduced to 3 seconds for better responsiveness
    if (this.pollingInterval) {
      this.stopPolling();
    }

    console.log(`🔄 Starting polling every ${intervalMs}ms as fallback...`);

    this.pollingInterval = window.setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error('❌ Error polling for bin updates:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ Polling stopped');
    }
  }

  // Check for updates from database
  private async checkForUpdates() {
    try {
      // Get the latest update for each bin since last check
      const { data: latestUpdates, error } = await supabase
        .from('bin_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Get more updates to catch any missed ones

      if (error) {
        console.error('❌ Error fetching updates:', error);
        return;
      }

      if (latestUpdates && latestUpdates.length > 0) {
        if (this.debugMode) {
          console.log(`📊 Polling found ${latestUpdates.length} recent updates`);
        }

        // Process each update
        latestUpdates.forEach((update: BinUpdate) => {
          const updateTime = new Date(update.created_at).getTime();
          const lastKnownTime = this.lastUpdateTime[update.bin_id] || 0;

          // Only notify if this is a new update
          if (updateTime > lastKnownTime) {
            this.lastUpdateTime[update.bin_id] = updateTime;
            
            const updateData: BinUpdateData = {
              binId: update.bin_id,
              fillLevel: update.fill_level,
              batteryLevel: update.battery_level,
              status: update.status,
              timestamp: update.created_at
            };

            if (this.debugMode) {
              console.log('📥 New update found via polling:', updateData);
            }
            this.notifyUpdate(updateData);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error in checkForUpdates:', error);
    }
  }

  // Get latest data for a specific bin
  async getLatestBinData(binId: number): Promise<BinUpdateData | null> {
    try {
      const { data, error } = await supabase
        .from('bin_updates')
        .select('*')
        .eq('bin_id', binId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        console.log(`ℹ️ No data found for bin ${binId}`);
        return null;
      }

      return {
        binId: data[0].bin_id,
        fillLevel: data[0].fill_level,
        batteryLevel: data[0].battery_level,
        status: data[0].status,
        timestamp: data[0].created_at
      };
    } catch (error) {
      console.error('❌ Error fetching latest bin data:', error);
      return null;
    }
  }

  // Method to manually trigger an update (useful for testing)
  simulateUpdate(binId: number, fillLevel: number, batteryLevel?: number) {
    let status = 'normal';
    if (fillLevel >= 80) {
      status = 'critical';
    } else if (fillLevel >= 50) {
      status = 'warning';
    }

    const data: BinUpdateData = {
      binId,
      fillLevel,
      batteryLevel: batteryLevel || 100,
      status,
      timestamp: new Date().toISOString()
    };

    console.log('🧪 Simulating ESP32 update:', data);
    this.notifyUpdate(data);
  }

  // Send actual data to database (simulates ESP32 POST request)
  async sendTestDataToDatabase(binId: number, fillLevel: number, batteryLevel?: number) {
    try {
      console.log('📤 Sending test data to database...');
      
      let status = 'normal';
      if (fillLevel >= 80) {
        status = 'critical';
      } else if (fillLevel >= 50) {
        status = 'warning';
      }

      const { data, error } = await supabase
        .from('bin_updates')
        .insert({
          bin_id: binId,
          fill_level: fillLevel,
          battery_level: batteryLevel || 100,
          status: status
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to insert test data:', error);
        return false;
      }

      console.log('✅ Test data inserted successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ Error sending test data:', error);
      return false;
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await supabase
        .from('bin_updates')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test error:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`🐛 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get all recent updates for debugging
  async getAllRecentUpdates(limit: number = 10): Promise<BinUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('bin_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent updates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllRecentUpdates:', error);
      return [];
    }
  }
}

// Export singleton instance
export const binService = BinService.getInstance();