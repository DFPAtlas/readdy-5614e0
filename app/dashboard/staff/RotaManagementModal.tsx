
'use client';

import { useState } from 'react';

interface RotaManagementModalProps {
  onClose: () => void;
  selectedGuard: any;
}

export default function RotaManagementModal({ onClose, selectedGuard }: RotaManagementModalProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const sites = [
    'Westfield Shopping Centre',
    'City Business Park',
    'Healthcare Complex',
    'Retail Center',
    'Corporate Headquarters',
    'Industrial Estate'
  ];

  const shifts = [
    { id: 'day', name: 'Day Shift', time: '06:00 - 18:00' },
    { id: 'night', name: 'Night Shift', time: '18:00 - 06:00' },
    { id: 'early', name: 'Early Shift', time: '06:00 - 14:00' },
    { id: 'late', name: 'Late Shift', time: '14:00 - 22:00' },
    { id: 'overtime', name: 'Overtime', time: 'Variable' }
  ];

  const [weeklyRota, setWeeklyRota] = useState({
    monday: { site: 'Westfield Shopping Centre', shift: 'day', hours: 8 },
    tuesday: { site: 'Westfield Shopping Centre', shift: 'day', hours: 8 },
    wednesday: { site: 'City Business Park', shift: 'night', hours: 8 },
    thursday: { site: 'City Business Park', shift: 'night', hours: 8 },
    friday: { site: 'Westfield Shopping Centre', shift: 'day', hours: 8 },
    saturday: { site: '', shift: '', hours: 0 },
    sunday: { site: '', shift: '', hours: 0 }
  });

  const handleRotaChange = (day: string, field: string, value: string | number) => {
    setWeeklyRota(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const totalHours = Object.values(weeklyRota).reduce((sum, day) => sum + day.hours, 0);
  const totalDays = Object.values(weeklyRota).filter(day => day.site).length;

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
        <div className="flex items-center space-x-4">
          <input
            type="week"
            value={selectedWeek.toISOString().slice(0, 10)}
            onChange={(e) => setSelectedWeek(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="text-sm text-gray-600">
            Total: {totalHours} hours, {totalDays} days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(weeklyRota).map(([day, schedule]) => (
          <div key={day} className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="font-medium text-gray-900 capitalize">{day}</div>
              <div>
                <select
                  value={schedule.site}
                  onChange={(e) => handleRotaChange(day, 'site', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Off Day</option>
                  {sites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={schedule.shift}
                  onChange={(e) => handleRotaChange(day, 'shift', e.target.value)}
                  disabled={!schedule.site}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Shift</option>
                  {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>{shift.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={schedule.hours}
                  onChange={(e) => handleRotaChange(day, 'hours', parseInt(e.target.value) || 0)}
                  min="0"
                  max="12"
                  disabled={!schedule.site}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Schedule Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Total Hours:</span>
            <span className="font-medium text-blue-900 ml-2">{totalHours} hours</span>
          </div>
          <div>
            <span className="text-blue-700">Working Days:</span>
            <span className="font-medium text-blue-900 ml-2">{totalDays} days</span>
          </div>
          <div>
            <span className="text-blue-700">Overtime:</span>
            <span className="font-medium text-blue-900 ml-2">{totalHours > 40 ? totalHours - 40 : 0} hours</span>
          </div>
          <div>
            <span className="text-blue-700">Rest Days:</span>
            <span className="font-medium text-blue-900 ml-2">{7 - totalDays} days</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Team Assignments</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {sites.map(site => (
          <div key={site} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">{site}</h4>
            <div className="space-y-2">
              {shifts.map(shift => (
                <div key={shift.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{shift.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({shift.time})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select className="px-2 py-1 border border-gray-300 rounded text-sm pr-8">
                      <option value="">Assign Guard</option>
                      <option value="1">John Smith</option>
                      <option value="2">Sarah Johnson</option>
                      <option value="3">Michael Williams</option>
                    </select>
                    <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap">
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Rota Templates</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center text-sm">
          <i className="ri-add-line mr-2"></i>
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Standard Week Template</h4>
            <div className="flex items-center space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap">
                Apply
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm cursor-pointer whitespace-nowrap">
                Delete
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Mon-Fri: Day Shift (8 hours), Weekends: Off
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Night Shift Template</h4>
            <div className="flex items-center space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap">
                Apply
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm cursor-pointer whitespace-nowrap">
                Delete
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Sun-Thu: Night Shift (8 hours), Fri-Sat: Off
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Rotating Shifts Template</h4>
            <div className="flex items-center space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap">
                Apply
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm cursor-pointer whitespace-nowrap">
                Delete
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Alternating day/night shifts weekly
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rota Management</h2>
              {selectedGuard && (
                <p className="text-sm text-gray-600 mt-1">Managing schedule for {selectedGuard.name}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'schedule' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Individual Schedule
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'team' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Assignments
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'templates' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Rota Templates
            </button>
          </nav>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'team' && renderTeamTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
