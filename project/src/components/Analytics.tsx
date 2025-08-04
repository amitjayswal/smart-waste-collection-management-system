import React from 'react';
import { Dustbin } from '../types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsProps {
  dustbins: Dustbin[];
}

const Analytics: React.FC<AnalyticsProps> = ({ dustbins }) => {
  // Calculate fill level distribution
  const fillLevelRanges = [
    { label: '0-25%', count: 0, color: 'rgba(16, 185, 129, 0.7)' },
    { label: '26-50%', count: 0, color: 'rgba(16, 185, 129, 0.5)' },
    { label: '51-75%', count: 0, color: 'rgba(245, 158, 11, 0.7)' },
    { label: '76-100%', count: 0, color: 'rgba(239, 68, 68, 0.7)' }
  ];
  
  dustbins.forEach(bin => {
    if (bin.fillLevel <= 25) fillLevelRanges[0].count++;
    else if (bin.fillLevel <= 50) fillLevelRanges[1].count++;
    else if (bin.fillLevel <= 75) fillLevelRanges[2].count++;
    else fillLevelRanges[3].count++;
  });
  
  // Calculate bin type distribution
  const binTypes = [
    { label: 'General', count: 0, color: 'rgba(75, 85, 99, 0.7)' },
    { label: 'Recyclable', count: 0, color: 'rgba(59, 130, 246, 0.7)' },
    { label: 'Organic', count: 0, color: 'rgba(16, 185, 129, 0.7)' },
  ];
  
  dustbins.forEach(bin => {
    if (bin.type === 'general') binTypes[0].count++;
    else if (bin.type === 'recyclable') binTypes[1].count++;
    else if (bin.type === 'organic') binTypes[2].count++;
  });
  
  // Mock collection data by hour
  const hourlyData = {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Collections',
        data: [1, 0, 0, 1, 3, 4, 2, 1, 3, 5, 2, 1],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  // Doughnut chart data for fill level distribution
  const fillLevelChartData = {
    labels: fillLevelRanges.map(range => range.label),
    datasets: [
      {
        data: fillLevelRanges.map(range => range.count),
        backgroundColor: fillLevelRanges.map(range => range.color),
        borderColor: fillLevelRanges.map(range => range.color.replace('0.7', '1')),
        borderWidth: 1,
      }
    ]
  };
  
  // Doughnut chart data for bin type distribution
  const binTypeChartData = {
    labels: binTypes.map(type => type.label),
    datasets: [
      {
        data: binTypes.map(type => type.count),
        backgroundColor: binTypes.map(type => type.color),
        borderColor: binTypes.map(type => type.color.replace('0.7', '1')),
        borderWidth: 1,
      }
    ]
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Collections by Hour',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  };
  
  return (
    <section id="analytics" className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
        <p className="text-gray-600">Visualization of waste collection data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Collections by Hour</h3>
          <Bar data={hourlyData} options={barOptions} />
          <div className="mt-4 text-sm text-gray-600">
            <p>Peak collection times are around 10:00 AM and 6:00 PM.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Fill Level Distribution</h3>
          <div className="h-64">
            <Doughnut data={fillLevelChartData} options={doughnutOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              {fillLevelRanges[2].count + fillLevelRanges[3].count} bins are above 50% capacity.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Bin Type Distribution</h3>
          <div className="h-64">
            <Doughnut data={binTypeChartData} options={doughnutOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Distribution of different types of waste bins in the system.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Collection Summary</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Total Collections</h4>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-green-600">87</span>
                <span className="ml-2 text-sm text-green-500">↑ 12% from last week</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Average Fill Level at Collection</h4>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-blue-600">76%</span>
                <span className="ml-2 text-sm text-green-500">↑ 5% from last week</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Higher is better - indicates more efficient collections
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Collection Efficiency</h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '83%' }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Previous: 78%</span>
                <span className="font-medium text-green-600">Current: 83%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;