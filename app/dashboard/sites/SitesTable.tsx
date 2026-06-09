'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Site {
  id: number;
  name: string;
  status: string;
  staffOnDuty: string[];
  totalStaff: number;
  lastUpdate: string;
  incidents: number;
  location: string;
  address: string;
  phone: string;
  manager: string;
  nextPatrol: string;
  lastIncident: string;
  checkInInterval: string;
  contract: string;
  startDate: string;
}

interface SitesTableProps {
  sites: Site[];
  viewMode: string;
}

export default function SitesTable({ sites, viewMode }: SitesTableProps) {
  const [selectedSites, setSelectedSites] = useState<number[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green':
        return 'All Clear';
      case 'yellow':
        return 'Attention Required';
      case 'red':
        return 'Alert';
      default:
        return 'Unknown';
    }
  };

  const handleSelectSite = (siteId: number) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSites(
      selectedSites.length === sites.length 
        ? [] 
        : sites.map(site => site.id)
    );
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div key={site.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{site.name}</h3>
                <p className="text-sm text-gray-600">{site.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(site.status)}`}></div>
                <span className="text-sm font-medium text-gray-700">{getStatusText(site.status)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Staff on Duty</span>
                <span className="text-sm text-gray-600">{site.staffOnDuty.length}/{site.totalStaff}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Manager</span>
                <span className="text-sm text-gray-600">{site.manager}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Next Patrol</span>
                <span className={`text-sm ${site.nextPatrol === 'Overdue' ? 'text-red-600' : 'text-gray-600'}`}>
                  {site.nextPatrol}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Contract</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  site.contract === 'Premium' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {site.contract}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">Updated: {site.lastUpdate}</span>
              <Link 
                href={`/dashboard/sites/${site.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedSites.length === sites.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Patrol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedSites.includes(site.id)}
                    onChange={() => handleSelectSite(site.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{site.name}</div>
                    <div className="text-sm text-gray-500">{site.location}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(site.status)}`}></div>
                    <span className="text-sm text-gray-900">{getStatusText(site.status)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{site.staffOnDuty.length}/{site.totalStaff}</div>
                  <div className="text-sm text-gray-500">
                    {site.staffOnDuty.length > 0 ? 'On duty' : 'No staff'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {site.manager}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${site.nextPatrol === 'Overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                    {site.nextPatrol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    site.contract === 'Premium' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {site.contract}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {site.lastUpdate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/dashboard/sites/${site.id}`}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}