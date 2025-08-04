import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dustbin } from '../types';
import { formatDate } from '../utils/helpers';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface DustbinMapProps {
  dustbins: Dustbin[];
  selectedBin: number | null;
  setSelectedBin: (id: number | null) => void;
}

const DustbinMap: React.FC<DustbinMapProps> = ({ 
  dustbins, 
  selectedBin,
  setSelectedBin
}) => {
  // Create custom icons for different fill levels
  const createBinIcon = (fillLevel: number, isSelected: boolean) => {
    let fillColor = '#10B981'; // Green for <50%
    if (fillLevel >= 80) {
      fillColor = '#EF4444'; // Red for >=80%
    } else if (fillLevel >= 50) {
      fillColor = '#F59E0B'; // Amber for >=50%
    }
    
    return L.divIcon({
      className: 'custom-bin-icon',
      html: `
        <div style="
          width: ${isSelected ? '30px' : '24px'}; 
          height: ${isSelected ? '30px' : '24px'}; 
          background-color: ${fillColor}; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 ${isSelected ? '6px' : '0'} rgba(0,0,0,0.5);
          transition: all 0.3s ease;
        ">
          <div style="color: white; font-weight: bold; font-size: ${isSelected ? '13px' : '10px'};">
            ${fillLevel}%
          </div>
        </div>
      `,
      iconSize: [isSelected ? 30 : 24, isSelected ? 30 : 24],
      iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12],
    });
  };
  
  return (
    <section id="map" className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Map View</h2>
        <p className="text-gray-600">Current locations and status of all dustbins</p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '500px' }}>
        <MapContainer 
          center={[40.7128, -74.006]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {dustbins.map((bin) => (
            <Marker 
              key={bin.id}
              position={[bin.location.lat, bin.location.lng]}
              icon={createBinIcon(bin.fillLevel, selectedBin === bin.id)}
              eventHandlers={{
                click: () => setSelectedBin(bin.id),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-gray-800">Bin #{bin.id}</h3>
                  <p className="text-sm text-gray-600">{bin.location.address}</p>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`${
                          bin.fillLevel < 50 ? 'bg-green-500' : 
                          bin.fillLevel < 80 ? 'bg-amber-500' : 
                          'bg-red-500'
                        } h-2 rounded-full`}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Fill Level</span>
                      <span className="font-medium">{bin.fillLevel}%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Last updated: {formatDate(bin.lastUpdated)}
                  </p>
                  <button 
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => window.location.hash = `#bin-${bin.id}`}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
};

export default DustbinMap;