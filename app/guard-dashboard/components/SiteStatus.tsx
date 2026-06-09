'use client';

import { useState } from 'react';

interface SiteStatusProps {
  guardInfo: {
    name: string;
    id: string;
    assignedSite: string;
    siteId: string;
  };
}

export default function SiteStatus({ guardInfo }: SiteStatusProps) {
  const [statusUpdates, setStatusUpdates] = useState({
    lighting: 'operational',
    cameras: 'operational',
    alarms: 'operational',
    access: 'operational',
    emergency: 'operational'
  });

  const [maintenanceRequest, setMaintenanceRequest] = useState({
    item: '',
    priority: 'low',
    description: '',
    location: ''
  });

  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const systemStatus = [
    {
      name: 'Lighting System',
      key: 'lighting',
      icon: 'ri-lightbulb-line',
      description: 'External and internal lighting'
    },
    {
      name: 'CCTV Cameras',
      key: 'cameras',
      icon: 'ri-camera-line',
      description: 'All surveillance cameras'
    },
    {
      name: 'Alarm System',
      key: 'alarms',
      icon: 'ri-alarm-line',
      description: 'Security and fire alarms'
    },
    {
      name: 'Access Control',
      key: 'access',
      icon: 'ri-door-line',
      description: 'Entry/exit points and locks'
    },
    {
      name: 'Emergency Systems',
      key: 'emergency',
      icon: 'ri-first-aid-kit-line',
      description: 'Emergency lighting and exits'
    }
  ];

  const maintenanceItems = [
    'Lighting',
    'CCTV Camera',
    'Alarm System',
    'Door/Lock',
    'Emergency Equipment',
    'Heating/Cooling',
    'Plumbing',
    'Electrical',
    'Other'
  ];

  const locations = [
    'Main Building',
    'West Wing',
    'East Wing',
    'Parking Area A',
    'Parking Area B',
    'Loading Dock',
    'Emergency Exits',
    'Roof Access',
    'Security Office',
    'Perimeter Fence'
  ];

  const handleStatusChange = (key: string, status: string) => {
    setStatusUpdates({
      ...statusUpdates,
      [key]: status
    });
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMaintenanceForm(false);
    setMaintenanceRequest({
      item: '',
      priority: 'low',
      description: '',
      location: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500';
      case 'maintenance': return 'bg-amber-500';
      case 'fault': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'maintenance': return 'Maintenance Required';
      case 'fault': return 'Fault/Not Working';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Status Update</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemStatus.map((system) => (
            <div key={system.key} className="border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600/15 rounded-lg flex items-center justify-center mr-3">
                    <i className={`${system.icon} text-blue-400`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{system.name}</h3>
                    <p className="text-sm text-gray-400">{system.description}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${getStatusColor(statusUpdates[system.key])}`}></div>
              </div>

              <div className="space-y-2">
                {['operational', 'maintenance', 'fault'].map((status) => (
                  <label key={status} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={system.key}
                      value={status}
                      checked={statusUpdates[system.key] === status}
                      onChange={(e) => handleStatusChange(system.key, e.target.value)}
                      className="mr-2 cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">{getStatusText(status)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap flex items-center">
            <i className="ri-refresh-line mr-2"></i>
            Update Status
          </button>
        </div>
      </div>

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Maintenance Request</h3>
          <button
            onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors cursor-pointer whitespace-nowrap flex items-center"
          >
            <i className="ri-tools-line mr-2"></i>
            Request Maintenance
          </button>
        </div>

        {showMaintenanceForm && (
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item/Equipment *
                </label>
                <select
                  value={maintenanceRequest.item}
                  onChange={(e) => setMaintenanceRequest({...maintenanceRequest, item: e.target.value})}
                  required
                  className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="">Select Item</option>
                  {maintenanceItems.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={maintenanceRequest.priority}
                  onChange={(e) => setMaintenanceRequest({...maintenanceRequest, priority: e.target.value})}
                  required
                  className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="low">Low - Routine maintenance</option>
                  <option value="medium">Medium - Needs attention</option>
                  <option value="high">High - Urgent repair</option>
                  <option value="emergency">Emergency - Immediate action</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <select
                  value={maintenanceRequest.location}
                  onChange={(e) => setMaintenanceRequest({...maintenanceRequest, location: e.target.value})}
                  required
                  className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={maintenanceRequest.description}
                onChange={(e) => setMaintenanceRequest({...maintenanceRequest, description: e.target.value})}
                rows={3}
                maxLength={500}
                required
                placeholder="Describe the maintenance issue or requirement..."
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowMaintenanceForm(false)}
                className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors cursor-pointer whitespace-nowrap flex items-center"
              >
                <i className="ri-send-plane-line mr-2"></i>
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Status Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">
              {Object.values(statusUpdates).filter(status => status === 'operational').length}
            </div>
            <div className="text-sm text-emerald-300">Systems Operational</div>
          </div>

          <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">
              {Object.values(statusUpdates).filter(status => status === 'maintenance').length}
            </div>
            <div className="text-sm text-amber-300">Need Maintenance</div>
          </div>

          <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">
              {Object.values(statusUpdates).filter(status => status === 'fault').length}
            </div>
            <div className="text-sm text-red-300">System Faults</div>
          </div>
        </div>
      </div>
    </div>
  );
}