import { Dustbin } from '../types';

// Initial dustbin data
export const initialDustbins: Dustbin[] = [
  {
    id: 1001,
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Central Park East, New York"
    },
    fillLevel: 0, // Default to 0% - will be updated by ESP32
    capacity: 100,
    lastUpdated: new Date(),
    status: 'normal',
    batteryLevel: 100, // Default to full battery
    type: 'general'
  },
  {
    id: 1002,
    location: {
      lat: 40.7138,
      lng: -74.013,
      address: "Madison Square, New York"
    },
    fillLevel: 30,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'normal',
    batteryLevel: 92,
    type: 'recyclable'
  },
  {
    id: 1003,
    location: {
      lat: 40.7118,
      lng: -74.009,
      address: "Bryant Park, New York"
    },
    fillLevel: 88,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'critical',
    batteryLevel: 64,
    type: 'organic'
  },
  {
    id: 1004,
    location: {
      lat: 40.7148,
      lng: -74.016,
      address: "Union Square, New York"
    },
    fillLevel: 45,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'normal',
    batteryLevel: 78,
    type: 'general'
  },
  {
    id: 1005,
    location: {
      lat: 40.7158,
      lng: -74.003,
      address: "Battery Park, New York"
    },
    fillLevel: 92,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'critical',
    batteryLevel: 56,
    type: 'recyclable'
  },
  {
    id: 1006,
    location: {
      lat: 40.7168,
      lng: -74.018,
      address: "Washington Square Park, New York"
    },
    fillLevel: 15,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'normal',
    batteryLevel: 94,
    type: 'organic'
  },
  {
    id: 1007,
    location: {
      lat: 40.7108,
      lng: -74.001,
      address: "High Line Park, New York"
    },
    fillLevel: 68,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'warning',
    batteryLevel: 72,
    type: 'general'
  },
  {
    id: 1008,
    location: {
      lat: 40.7188,
      lng: -74.011,
      address: "Times Square, New York"
    },
    fillLevel: 50,
    capacity: 100,
    lastUpdated: new Date(),
    status: 'normal',
    batteryLevel: 83,
    type: 'recyclable'
  }
];

// Calculate dashboard statistics
export const calculateStats = (dustbins: Dustbin[]): DustbinStats => {
  const totalBins = dustbins.length;
  const criticalBins = dustbins.filter(bin => bin.status === 'critical').length;
  const avgFillLevel = dustbins.reduce((sum, bin) => sum + bin.fillLevel, 0) / totalBins;
  
  // Mock collection data
  const totalCollections = Math.floor(Math.random() * 5) + 15;
  
  // Calculate efficiency score (0-100)
  const efficiencyScore = Math.min(
    100, 
    Math.floor(100 - (criticalBins / totalBins) * 50 - (avgFillLevel > 70 ? 20 : 0) + (totalCollections > 15 ? 10 : 0))
  );
  
  return {
    totalCollections,
    avgFillLevel,
    criticalBins,
    efficiencyScore
  };
};