import { Dustbin } from '../types';

// Get color based on fill level
export const getFillLevelColor = (fillLevel: number): string => {
  if (fillLevel < 50) return 'bg-green-500';
  if (fillLevel < 80) return 'bg-amber-500';
  return 'bg-red-500';
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'text-green-500';
    case 'warning':
      return 'text-amber-500';
    case 'critical':
      return 'text-red-500';
    case 'servicing':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
};

// Get status icon
export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'check-circle';
    case 'warning':
      return 'alert-triangle';
    case 'critical':
      return 'alert-circle';
    case 'servicing':
      return 'tool';
    default:
      return 'help-circle';
  }
};

// Format date
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Not Available';
  }
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

// Filter dustbins based on search
export const filterDustbins = (
  dustbins: Dustbin[],
  search: string,
  filterType: string
): Dustbin[] => {
  let filtered = [...dustbins];
  
  // Filter by search text (ID or address)
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      bin => 
        bin.id.toString().includes(search) || 
        bin.location.address.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by type
  if (filterType && filterType !== 'all') {
    filtered = filtered.filter(bin => bin.status === filterType);
  }
  
  return filtered;
};

// Sort dustbins
export const sortDustbins = (
  dustbins: Dustbin[],
  sortBy: string
): Dustbin[] => {
  const sorted = [...dustbins];
  
  switch (sortBy) {
    case 'id':
      return sorted.sort((a, b) => a.id - b.id);
    case 'fillLevel':
      return sorted.sort((a, b) => b.fillLevel - a.fillLevel);
    case 'lastUpdated':
      return sorted.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
    default:
      return sorted;
  }
};