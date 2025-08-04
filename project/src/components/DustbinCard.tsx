import React from 'react';
import { Trash2, Battery, Clock, AlertTriangle, AlertCircle, CheckCircle, MapPin, PenTool as Tool } from 'lucide-react';
import { Dustbin } from '../types';
import { formatDate } from '../utils/helpers';

interface DustbinCardProps {
  dustbin: Dustbin;
}

const DustbinCard: React.FC<DustbinCardProps> = ({ dustbin }) => {
  // Determine fill color based on level
  const getFillColor = (level: number) => {
    if (level < 50) return 'bg-green-500';
    if (level < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'servicing':
        return <Tool className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Attention Needed';
      case 'critical':
        return 'Collection Required';
      case 'servicing':
        return 'Currently Servicing';
      default:
        return 'Unknown';
    }
  };
  
  // Get bin type icon and color
  const getBinTypeInfo = (type: string) => {
    switch (type) {
      case 'general':
        return { color: 'text-gray-600', label: 'General Waste' };
      case 'recyclable':
        return { color: 'text-blue-600', label: 'Recyclable' };
      case 'organic':
        return { color: 'text-green-600', label: 'Organic' };
      default:
        return { color: 'text-gray-600', label: 'Unknown' };
    }
  };
  
  const binTypeInfo = getBinTypeInfo(dustbin.type);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full ${getFillColor(dustbin.fillLevel)} flex items-center justify-center text-white`}>
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-800">Bin #{dustbin.id}</h3>
              <p className={`text-sm ${binTypeInfo.color}`}>{binTypeInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(dustbin.status)}
            <span className={`ml-1 text-sm ${
              dustbin.status === 'normal' ? 'text-green-500' : 
              dustbin.status === 'warning' ? 'text-amber-500' : 
              dustbin.status === 'critical' ? 'text-red-500' : 'text-blue-500'
            }`}>
              {getStatusText(dustbin.status)}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className={`${getFillColor(dustbin.fillLevel)} h-4 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${dustbin.fillLevel}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Fill Level</span>
            <span className="font-semibold">{dustbin.fillLevel}%</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate" style={{ maxWidth: '150px' }}>{dustbin.location.address}</span>
          </div>
          <div className="flex items-center">
            <Battery className="h-4 w-4 mr-1" />
            <span>{dustbin.batteryLevel}%</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated: {formatDate(dustbin.lastUpdated)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex justify-between">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View Details
        </button>
        <button className="text-sm text-green-600 hover:text-green-800 font-medium">
          Request Collection
        </button>
      </div>
    </div>
  );
};

export default DustbinCard;