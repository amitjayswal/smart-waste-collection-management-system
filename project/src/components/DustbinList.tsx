import React, { useState } from 'react';
import { Search, Filter, SortDesc, RefreshCw } from 'lucide-react';
import { Dustbin } from '../types';
import DustbinCard from './DustbinCard';
import { filterDustbins, sortDustbins } from '../utils/helpers';

interface DustbinListProps {
  dustbins: Dustbin[];
  refreshData: () => void;
}

const DustbinList: React.FC<DustbinListProps> = ({ dustbins, refreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fillLevel');
  
  const filteredDustbins = filterDustbins(dustbins, searchTerm, statusFilter);
  const sortedDustbins = sortDustbins(filteredDustbins, sortBy);
  
  return (
    <section id="list" className="mb-8">
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Dustbin List</h2>
          <p className="text-gray-600">All connected dustbins in the system</p>
        </div>
        
        <button 
          className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
          onClick={refreshData}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search by ID or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="servicing">Servicing</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SortDesc className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="id">Sort by ID</option>
              <option value="fillLevel">Sort by Fill Level</option>
              <option value="lastUpdated">Sort by Last Updated</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedDustbins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No dustbins match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedDustbins.map((bin) => (
            <div key={bin.id} id={`bin-${bin.id}`}>
              <DustbinCard dustbin={bin} />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        Showing {sortedDustbins.length} of {dustbins.length} dustbins
      </div>
    </section>
  );
};

export default DustbinList;