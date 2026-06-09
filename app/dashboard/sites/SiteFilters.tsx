'use client';

import { useState } from 'react';

interface SiteFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  contractFilter: string;
  setContractFilter: (contract: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  totalSites: number;
  onBulkAction: (action: string, selectedSites: number[]) => void;
}

export default function SiteFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  contractFilter,
  setContractFilter,
  viewMode,
  setViewMode,
  totalSites,
  onBulkAction
}: SiteFiltersProps) {
  const [showBulkActions, setShowBulkActions] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search sites, locations, or managers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="green">Active</option>
              <option value="yellow">Warning</option>
              <option value="red">Alert</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white pr-8"
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
            >
              <option value="all">All Contracts</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-list-unordered mr-1"></i>
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-layout-grid-line mr-1"></i>
              Grid
            </button>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-more-line mr-1"></i>
              Actions
            </button>
            
            {showBulkActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => onBulkAction('export', [])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <i className="ri-download-line mr-2"></i>
                    Export Data
                  </button>
                  <button
                    onClick={() => onBulkAction('refresh', [])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Refresh All
                  </button>
                  <button
                    onClick={() => onBulkAction('report', [])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <i className="ri-file-text-line mr-2"></i>
                    Generate Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {totalSites} sites
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
}