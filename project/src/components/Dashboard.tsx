import React from 'react';
import { 
  ArrowUpCircle, 
  Trash2, 
  AlertCircle, 
  BarChart3,
  TrendingUp,
  Clock,
  Battery,
  Truck
} from 'lucide-react';
import { Dustbin, DustbinStats } from '../types';

interface DashboardProps {
  dustbins: Dustbin[];
  stats: DustbinStats;
}

const Dashboard: React.FC<DashboardProps> = ({ dustbins, stats }) => {
  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };
  
  return (
    <section id="dashboard" className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Overview of waste collection system</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Efficiency Score */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Efficiency Score</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(stats.efficiencyScore)}`}>
                {stats.efficiencyScore}%
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full ${getEfficiencyColor(stats.efficiencyScore)} bg-opacity-10 flex items-center justify-center`}>
              <TrendingUp className={`h-6 w-6 ${getEfficiencyColor(stats.efficiencyScore)}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${
                  stats.efficiencyScore >= 80 ? 'bg-green-500' : 
                  stats.efficiencyScore >= 60 ? 'bg-amber-500' : 
                  'bg-red-500'
                } h-2 rounded-full`}
                style={{ width: `${stats.efficiencyScore}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Total Collections */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Collections Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCollections}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <ArrowUpCircle className="h-4 w-4 mr-1" />
            <span>4 more than yesterday</span>
          </p>
        </div>
        
        {/* Critical Bins */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Critical Bins</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalBins}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {stats.criticalBins > 0 
              ? `${stats.criticalBins} bins need immediate attention`
              : 'All bins at acceptable levels'}
          </p>
        </div>
        
        {/* Average Fill Level */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Fill Level</p>
              <p className="text-2xl font-bold text-gray-800">{Math.round(stats.avgFillLevel)}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${
                  stats.avgFillLevel < 50 ? 'bg-green-500' : 
                  stats.avgFillLevel < 80 ? 'bg-amber-500' : 
                  'bg-red-500'
                } h-2 rounded-full`}
                style={{ width: `${stats.avgFillLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Summary */}
      <div className="mt-8 bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Trash2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bins</p>
                <p className="text-lg font-semibold">{dustbins.length}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-green-50 p-2 rounded">
                <p className="text-green-600 font-medium">
                  {dustbins.filter(bin => bin.status === 'normal').length}
                </p>
                <p className="text-gray-500">Normal</p>
              </div>
              <div className="bg-amber-50 p-2 rounded">
                <p className="text-amber-600 font-medium">
                  {dustbins.filter(bin => bin.status === 'warning').length}
                </p>
                <p className="text-gray-500">Warning</p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-red-600 font-medium">
                  {dustbins.filter(bin => bin.status === 'critical').length}
                </p>
                <p className="text-gray-500">Critical</p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Update</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                System is actively monitoring all connected bins and sending real-time updates.
              </p>
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                <span>All systems operational</span>
              </p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Battery className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Battery Status</p>
                <p className="text-lg font-semibold">
                  {Math.round(dustbins.reduce((sum, bin) => sum + bin.batteryLevel, 0) / dustbins.length)}% Avg
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Low Battery Bins</span>
                <span>{dustbins.filter(bin => bin.batteryLevel < 30).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ 
                    width: `${100 - (dustbins.filter(bin => bin.batteryLevel < 30).length / dustbins.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;