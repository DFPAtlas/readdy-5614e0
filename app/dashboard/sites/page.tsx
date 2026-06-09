'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteFilters from './SiteFilters';
import SitesTable from './SitesTable';
import SiteStats from './SiteStats';

export default function SitesPage() {
  const [sites, setSites] = useState([
    {
      id: 1,
      name: 'City Centre Mall',
      status: 'green',
      staffOnDuty: ['John Smith', 'Sarah Johnson'],
      totalStaff: 3,
      lastUpdate: '2 mins ago',
      incidents: 0,
      location: 'Manchester City Centre',
      address: '123 High Street, Manchester M1 1AA',
      phone: '+44 161 123 4567',
      manager: 'John Smith',
      nextPatrol: '14:30',
      lastIncident: 'None',
      checkInInterval: '30 mins',
      contract: 'Premium',
      startDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Industrial Park East',
      status: 'yellow',
      staffOnDuty: ['Mike Wilson'],
      totalStaff: 2,
      lastUpdate: '15 mins ago',
      incidents: 1,
      location: 'Industrial District',
      address: '456 Industrial Road, Manchester M12 2BB',
      phone: '+44 161 234 5678',
      manager: 'Mike Wilson',
      nextPatrol: '15:00',
      lastIncident: '2 hours ago',
      checkInInterval: '45 mins',
      contract: 'Standard',
      startDate: '2024-02-01'
    },
    {
      id: 3,
      name: 'Riverside Office Complex',
      status: 'green',
      staffOnDuty: ['Emma Davis', 'Tom Brown', 'Lisa White'],
      totalStaff: 3,
      lastUpdate: '5 mins ago',
      incidents: 0,
      location: 'Riverside Business Park',
      address: '789 River View, Manchester M5 5CC',
      phone: '+44 161 345 6789',
      manager: 'Emma Davis',
      nextPatrol: '15:15',
      lastIncident: 'None',
      checkInInterval: '30 mins',
      contract: 'Premium',
      startDate: '2024-01-20'
    },
    {
      id: 4,
      name: 'Warehouse District',
      status: 'red',
      staffOnDuty: [],
      totalStaff: 2,
      lastUpdate: '45 mins ago',
      incidents: 2,
      location: 'South Industrial Zone',
      address: '321 Warehouse Lane, Manchester M15 3DD',
      phone: '+44 161 456 7890',
      manager: 'David Miller',
      nextPatrol: 'Overdue',
      lastIncident: '1 hour ago',
      checkInInterval: '30 mins',
      contract: 'Standard',
      startDate: '2024-03-01'
    },
    {
      id: 5,
      name: 'Shopping Centre West',
      status: 'green',
      staffOnDuty: ['David Miller', 'Anna Clark'],
      totalStaff: 2,
      lastUpdate: '1 min ago',
      incidents: 0,
      location: 'West Shopping District',
      address: '654 Shopping Plaza, Manchester M8 8EE',
      phone: '+44 161 567 8901',
      manager: 'Anna Clark',
      nextPatrol: '14:45',
      lastIncident: 'None',
      checkInInterval: '30 mins',
      contract: 'Premium',
      startDate: '2024-02-15'
    },
    {
      id: 6,
      name: 'Corporate Tower',
      status: 'yellow',
      staffOnDuty: ['James Taylor'],
      totalStaff: 2,
      lastUpdate: '30 mins ago',
      incidents: 0,
      location: 'Financial District',
      address: '987 Business Tower, Manchester M3 6FF',
      phone: '+44 161 678 9012',
      manager: 'James Taylor',
      nextPatrol: '15:30',
      lastIncident: 'None',
      checkInInterval: '45 mins',
      contract: 'Standard',
      startDate: '2024-01-10'
    }
  ]);

  const [filteredSites, setFilteredSites] = useState(sites);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    let filtered = sites;

    if (searchTerm) {
      filtered = filtered.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.manager.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    if (contractFilter !== 'all') {
      filtered = filtered.filter(site => site.contract === contractFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter, contractFilter]);

  const handleBulkAction = (action: string, selectedSites: number[]) => {
    console.log(`Bulk action ${action} for sites:`, selectedSites);
    // Implementation for bulk actions
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sites Management</h1>
            <p className="text-gray-400">Monitor and manage all your security sites</p>
          </div>
          <Link 
            href="/dashboard/sites/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Add New Site
          </Link>
        </div>

        <SiteStats sites={sites} />

        <SiteFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          contractFilter={contractFilter}
          setContractFilter={setContractFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalSites={filteredSites.length}
          onBulkAction={handleBulkAction}
        />

        <SitesTable 
          sites={filteredSites}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}