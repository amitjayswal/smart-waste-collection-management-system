export interface Dustbin {
  id: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  fillLevel: number;
  capacity: number;
  lastUpdated: Date;
  status: 'normal' | 'warning' | 'critical' | 'servicing';
  batteryLevel: number;
  type: 'general' | 'recyclable' | 'organic';
}

export interface DustbinStats {
  totalCollections: number;
  avgFillLevel: number;
  criticalBins: number;
  efficiencyScore: number;
}